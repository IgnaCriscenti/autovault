// Capa de servicio: logica de negocio y acceso a datos de vehiculos, en UN solo lugar.
// No sabe nada de HTTP (req/res). La usan los controllers (y mas adelante el agente).
import mongoose, { QueryFilter, Types, isValidObjectId } from "mongoose";
import Vehicle, { IVehicle, IVehicleDocument } from "../models/Vehicle.js";
import { escapeRegex } from "../lib/escape-regex.js";
import { CreateVehicleInput, ListVehiclesInput, UpdateVehicleInput } from "../schemas/vehicle.schema.js";
import { Paginated } from "../types/pagination.types.js";

const SEARCH_FIELDS = ["brand", "model", "color", "description"] as const;

// Vehiculo como lo devuelve la API de lectura: con el NOMBRE de quien lo publico (no el email: es publico).
export type VehicleWithOwner = IVehicle & { _id: Types.ObjectId; ownerName: string };

// Agrega ownerName buscando los dueños en la coleccion "user" de Better Auth, en UNA sola consulta.
async function withOwnerNames(vehicles: (IVehicle & { _id: Types.ObjectId })[]): Promise<VehicleWithOwner[]> {
  const ids = [...new Set(vehicles.map((v) => v.owner))].filter(isValidObjectId).map((id) => new Types.ObjectId(id));
  const users = await mongoose.connection
    .collection("user")
    .find({ _id: { $in: ids } }, { projection: { name: 1 } })
    .toArray();
  const names = new Map(users.map((u) => [u._id.toString(), String(u.name)]));
  return vehicles.map((v) => ({ ...v, ownerName: names.get(v.owner) ?? "Usuario eliminado" }));
}

// El filtro se arma campo por campo desde input YA validado por Zod: nunca se pasa el input crudo
// a Mongo (eso permitiria inyectar operadores como { "$gt": "" }).
function buildFilter(input: ListVehiclesInput): QueryFilter<IVehicle> {
  const { search, brand, fuelType, transmission, bodyType, minPrice, maxPrice, minYear, maxYear, available, has3d } =
    input;
  const filter: QueryFilter<IVehicle> = {};

  // Cada palabra debe aparecer en algun campo: "toyota hilux" encuentra la Toyota Hilux.
  // Una palabra de 4 digitos tambien puede ser el año: "corolla 2022".
  if (search) {
    filter.$and = search.split(/\s+/).map((word) => {
      const byText: QueryFilter<IVehicle>[] = SEARCH_FIELDS.map((field) => ({
        [field]: { $regex: escapeRegex(word), $options: "i" },
      }));
      return { $or: /^\d{4}$/.test(word) ? [...byText, { year: Number(word) }] : byText };
    });
  }
  // Marca exacta sin importar mayusculas: "toyota" encuentra "Toyota".
  if (brand) filter.brand = { $regex: `^${escapeRegex(brand)}$`, $options: "i" };
  if (fuelType) filter.fuelType = fuelType;
  if (transmission) filter.transmission = transmission;
  if (bodyType) filter.bodyType = bodyType;
  if (available !== undefined) filter.available = available;
  if (has3d === true) filter.sketchfabModelId = { $exists: true, $nin: [null, ""] };
  if (has3d === false) filter.$or = [{ sketchfabModelId: { $exists: false } }, { sketchfabModelId: { $in: [null, ""] } }];
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = { ...(minPrice !== undefined && { $gte: minPrice }), ...(maxPrice !== undefined && { $lte: maxPrice }) };
  }
  if (minYear !== undefined || maxYear !== undefined) {
    filter.year = { ...(minYear !== undefined && { $gte: minYear }), ...(maxYear !== undefined && { $lte: maxYear }) };
  }

  return filter;
}

// ownerId: si viene, lista solo las publicaciones de ese usuario ("mis publicaciones").
export async function listVehicles(input: ListVehiclesInput, ownerId?: string): Promise<Paginated<VehicleWithOwner>> {
  const { page, limit, sortBy, sortOrder } = input;
  const filter = buildFilter(input);
  if (ownerId) filter.owner = ownerId;

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      // _id como desempate: sin el, la paginacion puede repetir/saltear items con valores iguales.
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(), // objetos planos (mas livianos): solo se leen y se serializan
    Vehicle.countDocuments(filter),
  ]);

  const data = await withOwnerNames(vehicles);
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

// Detalle para la API (GET /:id), con el nombre de quien lo publico.
export async function getVehicleDetail(id: string): Promise<VehicleWithOwner | null> {
  const vehicle = await Vehicle.findById(id).lean();
  if (!vehicle) return null;
  const [withOwner] = await withOwnerNames([vehicle]);
  return withOwner;
}

// Marcas distintas del catalogo, ordenadas (para el filtro del front).
export async function listBrands(): Promise<string[]> {
  const brands: string[] = await Vehicle.distinct("brand");
  return brands.sort((a, b) => a.localeCompare(b, "es"));
}

export function findVehicleById(id: string): Promise<IVehicleDocument | null> {
  return Vehicle.findById(id);
}

export function createVehicle(input: CreateVehicleInput, ownerId: string): Promise<IVehicleDocument> {
  return Vehicle.create({ ...input, owner: ownerId });
}

export function updateVehicle(id: string, input: UpdateVehicleInput): Promise<IVehicleDocument | null> {
  return Vehicle.findByIdAndUpdate(id, input, { returnDocument: "after", runValidators: true });
}

export function deleteVehicle(id: string): Promise<IVehicleDocument | null> {
  return Vehicle.findByIdAndDelete(id);
}

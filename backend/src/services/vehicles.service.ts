// Capa de servicio: logica de negocio y acceso a datos de vehiculos, en UN solo lugar.
// No sabe nada de HTTP (req/res). La usan los controllers (y mas adelante el agente).
import { QueryFilter } from "mongoose";
import Vehicle, { IVehicle, IVehicleDocument } from "../models/Vehicle.js";
import { escapeRegex } from "../lib/escape-regex.js";
import { CreateVehicleInput, ListVehiclesInput, UpdateVehicleInput } from "../schemas/vehicle.schema.js";
import { Paginated } from "../types/pagination.types.js";

const SEARCH_FIELDS = ["brand", "model", "color", "description"] as const;

// El filtro se arma campo por campo desde input YA validado por Zod: nunca se pasa el input crudo
// a Mongo (eso permitiria inyectar operadores como { "$gt": "" }).
function buildFilter(input: ListVehiclesInput): QueryFilter<IVehicle> {
  const { search, brand, fuelType, transmission, bodyType, minPrice, maxPrice, minYear, maxYear, available } = input;
  const filter: QueryFilter<IVehicle> = {};

  // Cada palabra debe aparecer en algun campo: "toyota hilux" encuentra la Toyota Hilux.
  if (search) {
    filter.$and = search
      .split(/\s+/)
      .map((word) => ({ $or: SEARCH_FIELDS.map((field) => ({ [field]: { $regex: escapeRegex(word), $options: "i" } })) }));
  }
  // Marca exacta sin importar mayusculas: "toyota" encuentra "Toyota".
  if (brand) filter.brand = { $regex: `^${escapeRegex(brand)}$`, $options: "i" };
  if (fuelType) filter.fuelType = fuelType;
  if (transmission) filter.transmission = transmission;
  if (bodyType) filter.bodyType = bodyType;
  if (available !== undefined) filter.available = available;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = { ...(minPrice !== undefined && { $gte: minPrice }), ...(maxPrice !== undefined && { $lte: maxPrice }) };
  }
  if (minYear !== undefined || maxYear !== undefined) {
    filter.year = { ...(minYear !== undefined && { $gte: minYear }), ...(maxYear !== undefined && { $lte: maxYear }) };
  }

  return filter;
}

export async function listVehicles(input: ListVehiclesInput): Promise<Paginated<IVehicleDocument>> {
  const { page, limit, sortBy, sortOrder } = input;
  const filter = buildFilter(input);

  const [data, total] = await Promise.all([
    Vehicle.find(filter)
      // _id como desempate: sin el, la paginacion puede repetir/saltear items con valores iguales.
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Vehicle.countDocuments(filter),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

// Marcas distintas del catalogo, ordenadas (para el filtro del front).
export async function listBrands(): Promise<string[]> {
  const brands: string[] = await Vehicle.distinct("brand");
  return brands.sort((a, b) => a.localeCompare(b, "es"));
}

export function findVehicleById(id: string): Promise<IVehicleDocument | null> {
  return Vehicle.findById(id);
}

export function createVehicle(input: CreateVehicleInput): Promise<IVehicleDocument> {
  return Vehicle.create(input);
}

export function updateVehicle(id: string, input: UpdateVehicleInput): Promise<IVehicleDocument | null> {
  return Vehicle.findByIdAndUpdate(id, input, { returnDocument: "after", runValidators: true });
}

export function deleteVehicle(id: string): Promise<IVehicleDocument | null> {
  return Vehicle.findByIdAndDelete(id);
}

// Capa de servicio: logica de negocio y acceso a datos de vehiculos, en UN solo lugar.
// No sabe nada de HTTP (req/res). La usan los controllers (y mas adelante el agente).
import Vehicle, { IVehicleDocument } from "../models/Vehicle.js";
import { CreateVehicleInput, ListVehiclesInput, UpdateVehicleInput } from "../schemas/vehicle.schema.js";
import { Paginated } from "../types/pagination.types.js";

export async function listVehicles(input: ListVehiclesInput): Promise<Paginated<IVehicleDocument>> {
  const { page, limit, sortBy, sortOrder } = input;
  const filter = {};

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

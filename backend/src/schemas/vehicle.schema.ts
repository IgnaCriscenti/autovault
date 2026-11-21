import { z } from "zod";
import { BODY_TYPES, FUEL_TYPES, MIN_YEAR, TRANSMISSIONS, maxYear } from "../constants/vehicle.js";

export const ALLOWED_SORT_FIELDS = ["listedAt", "price", "year", "mileage", "brand"] as const;

// GET /api/v1/vehicles?page=1&limit=12 — los query params llegan como string: z.coerce los convierte.
export const listVehiclesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.enum(ALLOWED_SORT_FIELDS).default("listedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createVehicleSchema = z.object({
  brand: z.string({ error: "La marca es obligatoria" }).trim().min(1, "La marca es obligatoria").max(50),
  model: z.string({ error: "El modelo es obligatorio" }).trim().min(1, "El modelo es obligatorio").max(80),
  year: z
    .number({ error: "El año debe ser un número" })
    .int("El año debe ser un número entero")
    .min(MIN_YEAR, `El año no puede ser anterior a ${MIN_YEAR}`)
    .max(maxYear(), `El año no puede ser posterior a ${maxYear()}`),
  price: z
    .number({ error: "El precio debe ser un número" })
    .positive("El precio debe ser mayor a 0")
    .max(10_000_000, "El precio es demasiado alto"),
  mileage: z
    .number({ error: "El kilometraje debe ser un número" })
    .int("El kilometraje debe ser un número entero")
    .min(0, "El kilometraje no puede ser negativo")
    .max(2_000_000, "El kilometraje es demasiado alto"),
  fuelType: z.enum(FUEL_TYPES, { error: `Combustible invalido. Opciones: ${FUEL_TYPES.join(", ")}` }),
  transmission: z.enum(TRANSMISSIONS, { error: `Transmision invalida. Opciones: ${TRANSMISSIONS.join(", ")}` }),
  bodyType: z.enum(BODY_TYPES, { error: `Carroceria invalida. Opciones: ${BODY_TYPES.join(", ")}` }),
  color: z.string().trim().max(30, "El color no puede superar 30 caracteres").optional(),
  description: z.string().trim().max(2000, "La descripcion no puede superar 2000 caracteres").optional(),
  // "" permite borrar la imagen al editar.
  imageUrl: z
    .union([z.url({ protocol: /^https?$/, error: "La URL de la imagen no es valida" }), z.literal("")])
    .optional(),
  available: z.boolean({ error: "Disponible debe ser true o false" }).optional(),
  // Acepta "2026-11-21" o un ISO completo.
  listedAt: z.coerce.date({ error: "La fecha de publicacion no es valida" }).optional(),
});

// PATCH/PUT: todos los campos opcionales, pero al menos uno.
export const updateVehicleSchema = createVehicleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "No se envio ningun campo para actualizar" });

export type ListVehiclesInput = z.infer<typeof listVehiclesSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

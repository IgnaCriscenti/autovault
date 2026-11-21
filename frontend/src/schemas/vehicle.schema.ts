// Validacion del formulario de vehiculo (misma regla que el backend, mensajes en español).
import { z } from "zod";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, type Vehicle } from "../types/vehicle";

// Mensajes por defecto de Zod en español (los campos con mensaje propio lo mantienen).
z.config(z.locales.es());

const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear() + 1;

// Los inputs numericos usan valueAsNumber: un campo vacio llega como NaN -> error de tipo.
const numberField = (label: string) => z.number({ error: `${label} debe ser un numero` });

export const vehicleSchema = z.object({
  brand: z.string().trim().min(1, { error: "La marca es obligatoria" }).max(50, { error: "Maximo 50 caracteres" }),
  model: z.string().trim().min(1, { error: "El modelo es obligatorio" }).max(80, { error: "Maximo 80 caracteres" }),
  year: numberField("El año")
    .int({ error: "El año debe ser entero" })
    .min(MIN_YEAR, { error: `Minimo ${MIN_YEAR}` })
    .max(MAX_YEAR, { error: `Maximo ${MAX_YEAR}` }),
  price: numberField("El precio")
    .positive({ error: "El precio debe ser mayor a 0" })
    .max(10_000_000, { error: "El precio es demasiado alto" }),
  mileage: numberField("El kilometraje")
    .int({ error: "El kilometraje debe ser entero" })
    .min(0, { error: "No puede ser negativo" })
    .max(2_000_000, { error: "El kilometraje es demasiado alto" }),
  fuelType: z.enum(FUEL_TYPES, { error: "Elegi un combustible" }),
  transmission: z.enum(TRANSMISSIONS, { error: "Elegi una transmision" }),
  bodyType: z.enum(BODY_TYPES, { error: "Elegi una carroceria" }),
  color: z.string().trim().max(30, { error: "Maximo 30 caracteres" }),
  description: z.string().trim().max(2000, { error: "Maximo 2000 caracteres" }),
  imageUrl: z.union([z.url({ protocol: /^https?$/, error: "Ingresa una URL valida (https://...)" }), z.literal("")]),
  available: z.boolean(),
  listedAt: z.iso.date({ error: "Ingresa una fecha valida" }),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

const today = () => new Date().toISOString().slice(0, 10);

export const emptyVehicle = (): VehicleFormValues => ({
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  price: NaN,
  mileage: 0,
  fuelType: "gasoline",
  transmission: "manual",
  bodyType: "sedan",
  color: "",
  description: "",
  imageUrl: "",
  available: true,
  listedAt: today(),
});

export const toVehicleFormValues = (v: Vehicle): VehicleFormValues => ({
  brand: v.brand,
  model: v.model,
  year: v.year,
  price: v.price,
  mileage: v.mileage,
  fuelType: v.fuelType,
  transmission: v.transmission,
  bodyType: v.bodyType,
  color: v.color ?? "",
  description: v.description ?? "",
  imageUrl: v.imageUrl ?? "",
  available: v.available,
  listedAt: v.listedAt.slice(0, 10),
});

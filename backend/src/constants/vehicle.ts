// Valores permitidos para los campos "enum" del vehiculo. Los comparten el modelo de Mongoose y Zod.
export const FUEL_TYPES = ["gasoline", "diesel", "cng", "hybrid", "electric"] as const;
export const TRANSMISSIONS = ["manual", "automatic"] as const;
export const BODY_TYPES = ["sedan", "hatchback", "suv", "pickup", "coupe", "van"] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BodyType = (typeof BODY_TYPES)[number];

// Id de un modelo de Sketchfab: 32 caracteres hexadecimales (ej: c7ee1c618e1a44edbcf4be71d49df255).
export const SKETCHFAB_UID_REGEX = /^[a-f0-9]{32}$/;

// Acepta el id o una URL de Sketchfab (".../3d-models/honda-civic-c7ee1c61...", ".../models/<id>/embed")
// y devuelve el id. Si no encuentra uno, devuelve el texto tal cual (y la validacion lo rechaza).
export function extractSketchfabId(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/([a-f0-9]{32})(?:[/?#]|\/embed|$)/i);
  return match ? match[1].toLowerCase() : trimmed;
}

export const MIN_YEAR = 1950;
export const maxYear = (): number => new Date().getFullYear() + 1;

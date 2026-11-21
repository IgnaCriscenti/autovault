// Valores permitidos para los campos "enum" del vehiculo. Los comparten el modelo de Mongoose y Zod.
export const FUEL_TYPES = ["gasoline", "diesel", "cng", "hybrid", "electric"] as const;
export const TRANSMISSIONS = ["manual", "automatic"] as const;
export const BODY_TYPES = ["sedan", "hatchback", "suv", "pickup", "coupe", "van"] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BodyType = (typeof BODY_TYPES)[number];

export const MIN_YEAR = 1950;
export const maxYear = (): number => new Date().getFullYear() + 1;

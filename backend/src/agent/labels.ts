// Textos en español de los valores enum del vehiculo: las tools se los devuelven asi al modelo,
// para que los muestre tal cual (los mismos que usa el front en lib/vehicle-format.ts).
import type { BodyType, FuelType, Transmission } from "../constants/vehicle.js";

export const FUEL_LABELS: Record<FuelType, string> = {
  gasoline: "Nafta",
  diesel: "Diesel",
  cng: "GNC",
  hybrid: "Híbrido",
  electric: "Eléctrico",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: "Manual",
  automatic: "Automática",
};

export const BODY_LABELS: Record<BodyType, string> = {
  sedan: "Sedán",
  hatchback: "Hatchback",
  suv: "SUV",
  pickup: "Pick-up",
  coupe: "Coupé",
  van: "Utilitario",
};

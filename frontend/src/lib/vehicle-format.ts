// Textos en español y formatos para mostrar los datos del vehiculo (la API usa valores en ingles).
import type { BodyType, FuelType, Transmission } from "../types/vehicle";

export const FUEL_LABELS: Record<FuelType, string> = {
  gasoline: "Nafta",
  diesel: "Diesel",
  cng: "GNC",
  hybrid: "Hibrido",
  electric: "Electrico",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: "Manual",
  automatic: "Automatica",
};

export const BODY_LABELS: Record<BodyType, string> = {
  sedan: "Sedan",
  hatchback: "Hatchback",
  suv: "SUV",
  pickup: "Pick-up",
  coupe: "Coupe",
  van: "Utilitario",
};

const usd = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const km = new Intl.NumberFormat("es-AR");

export const formatPrice = (price: number): string => usd.format(price);
export const formatMileage = (mileage: number): string => (mileage === 0 ? "0 km" : `${km.format(mileage)} km`);
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-AR", { timeZone: "UTC" });

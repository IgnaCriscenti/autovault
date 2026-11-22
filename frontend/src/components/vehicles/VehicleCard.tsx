import { Link } from "react-router";
import type { Vehicle } from "../../types/vehicle";
import { FUEL_LABELS, TRANSMISSION_LABELS, formatMileage, formatPrice } from "../../lib/vehicle-format";
import { VehicleImage } from "./VehicleImage";

export const AvailabilityBadge = ({ available }: { available: boolean }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
      available ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
    }`}
  >
    {available ? "Disponible" : "Vendido"}
  </span>
);

export const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const title = `${vehicle.brand} ${vehicle.model}`;

  return (
    <Link
      to={`/vehicles/${vehicle._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <VehicleImage src={vehicle.imageUrl} alt={title} className="aspect-video w-full" />
        {vehicle.sketchfabModelId && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            3D · 360°
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{title}</h3>
          <AvailabilityBadge available={vehicle.available} />
        </div>
        <p className="text-sm text-slate-500">
          {vehicle.year} · {formatMileage(vehicle.mileage)} · {FUEL_LABELS[vehicle.fuelType]} ·{" "}
          {TRANSMISSION_LABELS[vehicle.transmission]}
        </p>
        <p className="mt-auto text-xl font-bold text-brand-700">{formatPrice(vehicle.price)}</p>
      </div>
    </Link>
  );
};

// Ruta publica "/vehicles/:id". El id sale de la URL con useParams.
import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useParams } from "react-router";
import { getErrorMessage } from "../lib/api";
import { useSession } from "../lib/auth-client";
import { useGetVehicleByIdQuery } from "../store/api";
import {
  BODY_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  formatDate,
  formatMileage,
  formatPrice,
} from "../lib/vehicle-format";
import { VehicleImage } from "../components/vehicles/VehicleImage";
import { AvailabilityBadge } from "../components/vehicles/VehicleCard";

const BackLink = () => (
  <Link to="/" className="text-sm text-slate-500 underline hover:text-slate-700">
    ← Volver al catalogo
  </Link>
);

export const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  // skipToken = no pedir nada si no hay id. Cada id es una entrada distinta en la cache.
  const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(id ?? skipToken);
  const { data: session } = useSession();

  if (isLoading) return <p className="text-slate-500">Cargando vehiculo...</p>;

  if (error || !vehicle) {
    return (
      <section className="flex flex-col gap-2">
        <p className="text-red-600">No se pudo cargar el vehiculo: {getErrorMessage(error)}</p>
        <BackLink />
      </section>
    );
  }

  const title = `${vehicle.brand} ${vehicle.model}`;
  const specs: [string, string][] = [
    ["Año", String(vehicle.year)],
    ["Kilometraje", formatMileage(vehicle.mileage)],
    ["Combustible", FUEL_LABELS[vehicle.fuelType]],
    ["Transmision", TRANSMISSION_LABELS[vehicle.transmission]],
    ["Carroceria", BODY_LABELS[vehicle.bodyType]],
    ["Color", vehicle.color || "—"],
    ["Publicado", formatDate(vehicle.listedAt)],
    ["Publicado por", vehicle.ownerName],
  ];

  // El dueño edita desde "Mis publicaciones"; un admin (si no es suyo) desde el panel.
  const isOwner = session?.user.id === vehicle.owner;
  const editPath = isOwner
    ? `/mis-publicaciones?edit=${vehicle._id}`
    : session?.user.role === "admin"
      ? `/admin?edit=${vehicle._id}`
      : null;

  return (
    <section className="flex flex-col gap-4">
      <BackLink />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <VehicleImage src={vehicle.imageUrl} alt={title} className="aspect-video w-full rounded-2xl" />

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
            <AvailabilityBadge available={vehicle.available} />
          </div>
          <p className="text-3xl font-bold text-brand-700">{formatPrice(vehicle.price)}</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {specs.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          {vehicle.description && <p className="border-t border-slate-100 pt-4 text-slate-700">{vehicle.description}</p>}
          {editPath && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <span className="text-slate-600">{isOwner ? "Esta es tu publicacion." : "Sos administrador."}</span>
              <Link to={editPath} className="font-medium text-brand-700 underline">
                Editar publicacion
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Ruta publica "/": catalogo de vehiculos.
import { getErrorMessage } from "../lib/api";
import { useGetVehiclesQuery } from "../store/api";
import { VehicleCard } from "../components/vehicles/VehicleCard";

export const Home = () => {
  const { data, isLoading, error } = useGetVehiclesQuery({ limit: 50 });
  const vehicles = data?.data ?? [];

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Catalogo de vehiculos</h2>
        <p className="text-slate-500">Autos 0 km y usados seleccionados, listos para transferir.</p>
      </div>

      {isLoading && <p className="text-slate-500">Cargando vehiculos...</p>}
      {error && <p className="text-red-600">No se pudo cargar el catalogo: {getErrorMessage(error)}</p>}

      {!isLoading && !error && vehicles.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Todavia no hay vehiculos publicados.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle._id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
};

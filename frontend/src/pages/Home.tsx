// Ruta publica "/": catalogo con busqueda, filtros y paginacion (todo guardado en la URL).
import { useSearchParams } from "react-router";
import { getErrorMessage } from "../lib/api";
import { useGetVehiclesQuery } from "../store/api";
import { parseFilters, parsePage, toApiQuery, toSearchParams, type VehicleFilters as Filters } from "../lib/vehicle-filters";
import { VehicleCard } from "../components/vehicles/VehicleCard";
import { VehicleFilters } from "../components/vehicles/VehicleFilters";
import { Pagination } from "../components/ui/Pagination";

const PAGE_SIZE = 9;

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);
  const page = parsePage(searchParams);

  // Cada combinacion de filtros + pagina es una entrada distinta en la cache de RTK Query.
  const { data, isLoading, isFetching, error } = useGetVehiclesQuery(toApiQuery(filters, page, PAGE_SIZE));
  const vehicles = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  // Cambiar un filtro vuelve a la pagina 1. `replace` evita llenar el historial con cada tecla.
  const handleFiltersChange = (next: Filters) => setSearchParams(toSearchParams(next, 1), { replace: true });

  const handlePageChange = (nextPage: number) => {
    setSearchParams(toSearchParams(filters, nextPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Catalogo de vehiculos</h2>
        <p className="text-slate-500">Autos 0 km y usados seleccionados, listos para transferir.</p>
      </div>

      <VehicleFilters value={filters} onChange={handleFiltersChange} />

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          No se pudo cargar el catalogo: {getErrorMessage(error)}
        </p>
      ) : (
        <p className="text-sm text-slate-500" aria-live="polite">
          {isLoading ? "Cargando vehiculos..." : `${total} ${total === 1 ? "vehiculo encontrado" : "vehiculos encontrados"}`}
        </p>
      )}

      {!isLoading && !error && vehicles.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No hay vehiculos que coincidan con la busqueda.
        </p>
      )}

      <div className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle._id} vehicle={vehicle} />
        ))}
      </div>

      <Pagination page={page} totalPages={data?.meta.totalPages ?? 0} onPageChange={handlePageChange} />
    </section>
  );
};

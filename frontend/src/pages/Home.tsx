// Ruta publica "/": portada + catalogo con busqueda, filtros y paginacion (todo guardado en la URL).
import { useRef } from "react";
import { useSearchParams } from "react-router";
import { SearchXIcon } from "lucide-react";
import { getErrorMessage } from "../lib/api";
import { useGetVehiclesQuery } from "../store/api";
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  parseFilters,
  parsePage,
  toApiQuery,
  toSearchParams,
  type VehicleFilters as Filters,
} from "../lib/vehicle-filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { HomeHero } from "../components/vehicles/HomeHero";
import { VehicleCard, VehicleCardSkeleton } from "../components/vehicles/VehicleCard";
import { VehicleFilters } from "../components/vehicles/VehicleFilters";

const PAGE_SIZE = 9;

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);
  const page = parsePage(searchParams);
  const catalogRef = useRef<HTMLDivElement>(null);

  // Cada combinacion de filtros + pagina es una entrada distinta en la cache de RTK Query.
  const { data, isLoading, isFetching, error } = useGetVehiclesQuery(toApiQuery(filters, page, PAGE_SIZE));
  const vehicles = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  // La portada se muestra solo en la vista "limpia" del catalogo (sin filtros, pagina 1).
  const showHero = page === 1 && !hasActiveFilters(filters);

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Cambiar un filtro vuelve a la pagina 1. `replace` evita llenar el historial con cada tecla.
  const handleFiltersChange = (next: Filters) => setSearchParams(toSearchParams(next, 1), { replace: true });

  const handlePageChange = (nextPage: number) => {
    setSearchParams(toSearchParams(filters, nextPage));
    scrollToCatalog();
  };

  return (
    <div className="flex flex-col gap-10">
      {showHero && <HomeHero onBrowse={scrollToCatalog} />}

      <section ref={catalogRef} className="flex scroll-mt-24 flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold">Catalogo</h2>
            <p className="text-muted-foreground" aria-live="polite">
              {isLoading ? "Cargando vehiculos..." : `${total} ${total === 1 ? "vehiculo encontrado" : "vehiculos encontrados"}`}
            </p>
          </div>
        </div>

        <VehicleFilters value={filters} onChange={handleFiltersChange} />

        {error && <FormError message={`No se pudo cargar el catalogo: ${getErrorMessage(error)}`} />}

        {!isLoading && !error && vehicles.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
            <SearchXIcon className="size-10 text-muted-foreground" />
            <p className="font-medium">No hay vehiculos que coincidan con la busqueda.</p>
            <Button variant="outline" onClick={() => handleFiltersChange(EMPTY_FILTERS)}>
              Ver todo el catalogo
            </Button>
          </div>
        )}

        <div className={cn("grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3", isFetching && !isLoading && "opacity-60")}>
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <VehicleCardSkeleton key={i} />)
            : vehicles.map((vehicle) => <VehicleCard key={vehicle._id} vehicle={vehicle} />)}
        </div>

        <Pagination page={page} totalPages={data?.meta.totalPages ?? 0} onPageChange={handlePageChange} />
      </section>
    </div>
  );
};

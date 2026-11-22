// Filtros del catalogo <-> query string de la URL <-> query de la API.
// Se guardan en la URL para que F5, "atras" y compartir el link mantengan la busqueda.
import type { VehiclesQuery } from "../store/api";
import type { BodyType, FuelType, Transmission } from "../types/vehicle";

export const SORT_OPTIONS = {
  recent: { label: "Más recientes", sortBy: "listedAt", sortOrder: "desc" },
  price_asc: { label: "Menor precio", sortBy: "price", sortOrder: "asc" },
  price_desc: { label: "Mayor precio", sortBy: "price", sortOrder: "desc" },
  year_desc: { label: "Más nuevos", sortBy: "year", sortOrder: "desc" },
  km_asc: { label: "Menor kilometraje", sortBy: "mileage", sortOrder: "asc" },
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

// Todo como string (lo que hay en los inputs y en la URL). "" = sin filtro.
export interface VehicleFilters {
  search: string;
  brand: string;
  bodyType: BodyType | "";
  fuelType: FuelType | "";
  transmission: Transmission | "";
  minPrice: string;
  maxPrice: string;
  minYear: string;
  onlyAvailable: boolean;
  only3d: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: VehicleFilters = {
  search: "",
  brand: "",
  bodyType: "",
  fuelType: "",
  transmission: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  onlyAvailable: false,
  only3d: false,
  sort: "recent",
};

const TEXT_KEYS = ["search", "brand", "bodyType", "fuelType", "transmission", "minPrice", "maxPrice", "minYear"] as const;

export function parseFilters(params: URLSearchParams): VehicleFilters {
  const filters: VehicleFilters = { ...EMPTY_FILTERS };
  for (const key of TEXT_KEYS) {
    // El backend valida los valores: uno invalido en la URL vuelve como error 400 y se muestra.
    (filters as unknown as Record<string, string>)[key] = params.get(key) ?? "";
  }
  filters.onlyAvailable = params.get("available") === "true";
  filters.only3d = params.get("has3d") === "true";
  const sort = params.get("sort");
  if (sort && sort in SORT_OPTIONS) filters.sort = sort as SortKey;
  return filters;
}

export function parsePage(params: URLSearchParams): number {
  const page = Number(params.get("page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

// Solo se escriben en la URL los filtros con valor (URL corta y legible).
export function toSearchParams(filters: VehicleFilters, page = 1): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of TEXT_KEYS) {
    const value = filters[key].trim();
    if (value) params.set(key, value);
  }
  if (filters.onlyAvailable) params.set("available", "true");
  if (filters.only3d) params.set("has3d", "true");
  if (filters.sort !== "recent") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  return params;
}

const toNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export function toApiQuery(filters: VehicleFilters, page: number, limit: number): VehiclesQuery {
  const { sortBy, sortOrder } = SORT_OPTIONS[filters.sort];
  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search: filters.search.trim() || undefined,
    brand: filters.brand || undefined,
    bodyType: filters.bodyType || undefined,
    fuelType: filters.fuelType || undefined,
    transmission: filters.transmission || undefined,
    minPrice: toNumber(filters.minPrice),
    maxPrice: toNumber(filters.maxPrice),
    minYear: toNumber(filters.minYear),
    available: filters.onlyAvailable ? true : undefined,
    has3d: filters.only3d ? true : undefined,
  };
}

export const hasActiveFilters = (filters: VehicleFilters): boolean =>
  toSearchParams({ ...filters, sort: "recent" }).toString() !== "";

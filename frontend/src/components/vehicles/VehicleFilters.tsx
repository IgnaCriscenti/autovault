// Barra de filtros del catalogo. Edita un "borrador" local y lo aplica con debounce,
// asi escribir en la busqueda o en los precios no dispara una request por tecla.
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpDownIcon, SearchIcon, XIcon } from "lucide-react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  hasActiveFilters,
  toSearchParams,
  type SortKey,
  type VehicleFilters as Filters,
} from "../../lib/vehicle-filters";
import { BODY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "../../lib/vehicle-format";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from "../../types/vehicle";
import { useGetBrandsQuery } from "../../store/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface VehicleFiltersProps {
  value: Filters;
  onChange: (filters: Filters) => void;
}

const serialize = (filters: Filters) => toSearchParams(filters).toString();

const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
  <Label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
    {label}
    {children}
  </Label>
);

export const VehicleFilters = ({ value, onChange }: VehicleFiltersProps) => {
  const { data: brands = [] } = useGetBrandsQuery();
  const [draft, setDraft] = useState(value);
  const debouncedDraft = useDebouncedValue(draft, 400);

  // Si la URL cambia desde afuera (atras/adelante, "Limpiar"), el borrador se sincroniza.
  const valueKey = serialize(value);
  useEffect(() => {
    setDraft(value);
  }, [valueKey]);

  // Cuando el borrador deja de cambiar, se aplica (solo si es distinto a lo que ya hay).
  useEffect(() => {
    if (serialize(debouncedDraft) !== valueKey) onChange(debouncedDraft);
  }, [debouncedDraft]);

  const set = <K extends keyof Filters>(key: K, fieldValue: Filters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: fieldValue }));

  const clear = () => {
    setDraft(EMPTY_FILTERS);
    onChange(EMPTY_FILTERS);
  };

  return (
    <Card aria-label="Filtros" className="gap-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por marca, modelo, color..."
            aria-label="Buscar"
            value={draft.search}
            onChange={(e) => set("search", e.target.value)}
            className="h-10 bg-background pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
          <NativeSelect
            aria-label="Ordenar por"
            value={draft.sort}
            onChange={(e) => set("sort", e.target.value as SortKey)}
            className="w-full sm:w-48 [&_select]:h-10"
          >
            {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
              <NativeSelectOption key={key} value={key}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7 [&_select]:h-9 [&_select]:bg-background">
        <FilterField label="Marca">
          <NativeSelect value={draft.brand} onChange={(e) => set("brand", e.target.value)} className="w-full">
            <NativeSelectOption value="">Todas</NativeSelectOption>
            {brands.map((brand) => (
              <NativeSelectOption key={brand} value={brand}>
                {brand}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label="Carroceria">
          <NativeSelect
            value={draft.bodyType}
            onChange={(e) => set("bodyType", e.target.value as Filters["bodyType"])}
            className="w-full"
          >
            <NativeSelectOption value="">Todas</NativeSelectOption>
            {BODY_TYPES.map((v) => (
              <NativeSelectOption key={v} value={v}>
                {BODY_LABELS[v]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label="Combustible">
          <NativeSelect
            value={draft.fuelType}
            onChange={(e) => set("fuelType", e.target.value as Filters["fuelType"])}
            className="w-full"
          >
            <NativeSelectOption value="">Todos</NativeSelectOption>
            {FUEL_TYPES.map((v) => (
              <NativeSelectOption key={v} value={v}>
                {FUEL_LABELS[v]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label="Transmision">
          <NativeSelect
            value={draft.transmission}
            onChange={(e) => set("transmission", e.target.value as Filters["transmission"])}
            className="w-full"
          >
            <NativeSelectOption value="">Todas</NativeSelectOption>
            {TRANSMISSIONS.map((v) => (
              <NativeSelectOption key={v} value={v}>
                {TRANSMISSION_LABELS[v]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label="Precio min. (USD)">
          <Input
            type="number"
            min={0}
            step={1000}
            placeholder="0"
            value={draft.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
            className="h-9 bg-background"
          />
        </FilterField>
        <FilterField label="Precio max. (USD)">
          <Input
            type="number"
            min={0}
            step={1000}
            placeholder="Sin limite"
            value={draft.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="h-9 bg-background"
          />
        </FilterField>
        <FilterField label="Año desde">
          <Input
            type="number"
            min={1950}
            placeholder="Cualquiera"
            value={draft.minYear}
            onChange={(e) => set("minYear", e.target.value)}
            className="h-9 bg-background"
          />
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-5">
          <Label className="text-sm font-normal">
            <Checkbox checked={draft.onlyAvailable} onCheckedChange={(c) => set("onlyAvailable", c === true)} />
            Solo disponibles
          </Label>
          <Label className="text-sm font-normal">
            <Checkbox checked={draft.only3d} onCheckedChange={(c) => set("only3d", c === true)} />
            Con vista 3D
          </Label>
        </div>
        {hasActiveFilters(draft) && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <XIcon /> Limpiar filtros
          </Button>
        )}
      </div>
    </Card>
  );
};

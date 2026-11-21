// Barra de filtros del catalogo. Edita un "borrador" local y lo aplica con debounce,
// asi escribir en la busqueda o en los precios no dispara una request por tecla.
import { useEffect, useState } from "react";
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
import { FieldWrapper, inputClass } from "../ui/Field";

interface VehicleFiltersProps {
  value: Filters;
  onChange: (filters: Filters) => void;
}

const serialize = (filters: Filters) => toSearchParams(filters).toString();

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
    <section aria-label="Filtros" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Buscar por marca, modelo, color..."
          aria-label="Buscar"
          value={draft.search}
          onChange={(e) => set("search", e.target.value)}
          className={`${inputClass} flex-1`}
        />
        <select
          aria-label="Ordenar por"
          value={draft.sort}
          onChange={(e) => set("sort", e.target.value as SortKey)}
          className={inputClass}
        >
          {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <FieldWrapper label="Marca">
          <select value={draft.brand} onChange={(e) => set("brand", e.target.value)} className={inputClass}>
            <option value="">Todas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </FieldWrapper>
        <FieldWrapper label="Carroceria">
          <select
            value={draft.bodyType}
            onChange={(e) => set("bodyType", e.target.value as Filters["bodyType"])}
            className={inputClass}
          >
            <option value="">Todas</option>
            {BODY_TYPES.map((v) => (
              <option key={v} value={v}>
                {BODY_LABELS[v]}
              </option>
            ))}
          </select>
        </FieldWrapper>
        <FieldWrapper label="Combustible">
          <select
            value={draft.fuelType}
            onChange={(e) => set("fuelType", e.target.value as Filters["fuelType"])}
            className={inputClass}
          >
            <option value="">Todos</option>
            {FUEL_TYPES.map((v) => (
              <option key={v} value={v}>
                {FUEL_LABELS[v]}
              </option>
            ))}
          </select>
        </FieldWrapper>
        <FieldWrapper label="Transmision">
          <select
            value={draft.transmission}
            onChange={(e) => set("transmission", e.target.value as Filters["transmission"])}
            className={inputClass}
          >
            <option value="">Todas</option>
            {TRANSMISSIONS.map((v) => (
              <option key={v} value={v}>
                {TRANSMISSION_LABELS[v]}
              </option>
            ))}
          </select>
        </FieldWrapper>
        <FieldWrapper label="Precio min. (USD)">
          <input
            type="number"
            min={0}
            step={1000}
            placeholder="0"
            value={draft.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
            className={inputClass}
          />
        </FieldWrapper>
        <FieldWrapper label="Precio max. (USD)">
          <input
            type="number"
            min={0}
            step={1000}
            placeholder="Sin limite"
            value={draft.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
            className={inputClass}
          />
        </FieldWrapper>
        <FieldWrapper label="Año desde">
          <input
            type="number"
            min={1950}
            placeholder="Cualquiera"
            value={draft.minYear}
            onChange={(e) => set("minYear", e.target.value)}
            className={inputClass}
          />
        </FieldWrapper>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={draft.onlyAvailable}
            onChange={(e) => set("onlyAvailable", e.target.checked)}
          />
          Solo disponibles
        </label>
        {hasActiveFilters(draft) && (
          <button type="button" onClick={clear} className="text-sm font-medium text-brand-700 underline">
            Limpiar filtros
          </button>
        )}
      </div>
    </section>
  );
};

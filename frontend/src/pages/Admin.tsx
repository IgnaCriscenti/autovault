// Ruta "/admin" (solo rol admin): ABM de vehiculos.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../lib/api";
import type { VehicleFormValues } from "../schemas/vehicle.schema";
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehiclesQuery,
  useUpdateVehicleMutation,
} from "../store/api";
import type { Vehicle } from "../types/vehicle";
import { VehicleForm } from "../components/admin/VehicleForm";
import { AvailabilityBadge } from "../components/vehicles/VehicleCard";
import { formatMileage, formatPrice } from "../lib/vehicle-format";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Pagination } from "../components/ui/Pagination";
import { inputClass } from "../components/ui/Field";

const PAGE_SIZE = 10;

export const Admin = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const { data, isLoading, isFetching, error: loadError } = useGetVehiclesQuery({
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const vehicles = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;

  // Si se borra el ultimo vehiculo de la ultima pagina, volver a la anterior.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [deleteVehicle, { error: deleteError }] = useDeleteVehicleMutation();
  // Estado de UI de esta pantalla: no es global, se queda en useState.
  const [editing, setEditing] = useState<Vehicle | null>(null);

  // Cada mutation invalida el tag "Vehicles" y RTK Query vuelve a pedir el listado.
  // unwrap() lanza el error para que lo muestre el formulario.
  const handleSave = async (values: VehicleFormValues) => {
    if (editing) {
      await updateVehicle({ id: editing._id, values }).unwrap();
      setEditing(null);
    } else {
      await createVehicle(values).unwrap();
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`¿Eliminar ${vehicle.brand} ${vehicle.model} (${vehicle.year})?`)) return;
    const result = await deleteVehicle(vehicle._id);
    if (!result.error && editing?._id === vehicle._id) setEditing(null);
  };

  const error = loadError ?? deleteError;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Panel de administracion</h2>
        <p className="text-slate-500">Alta, edicion y baja de vehiculos del catalogo.</p>
      </div>

      <VehicleForm vehicle={editing} onSave={handleSave} onCancel={() => setEditing(null)} />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Buscar en el catalogo..."
          aria-label="Buscar vehiculos"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={`${inputClass} w-full sm:w-80`}
        />
        <span className="text-sm text-slate-500">{data ? `${data.meta.total} vehiculos` : ""}</span>
      </div>

      <div
        className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Vehiculo</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Km</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((vehicle) => (
              <tr key={vehicle._id} className={editing?._id === vehicle._id ? "bg-brand-50" : ""}>
                <td className="px-4 py-3 font-medium">
                  <Link to={`/vehicles/${vehicle._id}`} className="hover:underline">
                    {vehicle.brand} {vehicle.model}
                  </Link>
                </td>
                <td className="px-4 py-3">{vehicle.year}</td>
                <td className="px-4 py-3">{formatMileage(vehicle.mileage)}</td>
                <td className="px-4 py-3">{formatPrice(vehicle.price)}</td>
                <td className="px-4 py-3">
                  <AvailabilityBadge available={vehicle.available} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(vehicle)}
                      className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vehicle)}
                      className="rounded-lg border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && vehicles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  {debouncedSearch ? "No hay vehiculos que coincidan con la busqueda." : "Todavia no hay vehiculos cargados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
};

// ABM de vehículos reutilizable:
//   scope "all"  -> panel de admin (todas las publicaciones)
//   scope "mine" -> "Mis publicaciones" (solo las del usuario logueado; el backend igual lo controla)
// El vehículo en edición vive en la URL (?edit=<id>): así el detalle puede linkear directo a editarlo.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { Box, CarIcon, PencilIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/api";
import { useSession } from "../../lib/auth-client";
import type { VehicleFormValues } from "../../schemas/vehicle.schema";
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useGetMyVehiclesQuery,
  useGetVehicleByIdQuery,
  useGetVehiclesQuery,
  useUpdateVehicleMutation,
} from "../../store/api";
import type { Vehicle } from "../../types/vehicle";
import { formatMileage, formatPrice } from "../../lib/vehicle-format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormError } from "@/components/ui/Field";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VehicleForm } from "./VehicleForm";
import { AvailabilityBadge } from "../vehicles/VehicleCard";
import { VehicleImage } from "../vehicles/VehicleImage";

const PAGE_SIZE = 10;

interface VehicleManagerProps {
  scope: "all" | "mine";
  emptyMessage: string;
}

export const VehicleManager = ({ scope, emptyMessage }: VehicleManagerProps) => {
  const { data: session } = useSession();
  const myId = session?.user.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Vehicle | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const query = { search: debouncedSearch || undefined, page, limit: PAGE_SIZE };
  // Solo una de las dos queries se ejecuta (la otra recibe skipToken).
  const all = useGetVehiclesQuery(scope === "all" ? query : skipToken);
  const mine = useGetMyVehiclesQuery(scope === "mine" ? query : skipToken);
  const { data, isLoading, isFetching, error: loadError } = scope === "all" ? all : mine;
  const vehicles = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const columns = scope === "all" ? 7 : 6;

  // Vehículo en edición, tomado de ?edit=<id>. En "mine" se ignora si no es propio.
  const editId = searchParams.get("edit");
  const { data: editData } = useGetVehicleByIdQuery(editId ?? skipToken);
  const editing: Vehicle | null =
    editId && editData && (scope === "all" || editData.owner === myId) ? editData : null;

  const setEditing = (vehicle: Vehicle | null) =>
    setSearchParams(vehicle ? { edit: vehicle._id } : {}, { replace: true });

  // Si se borra el último vehículo de la última página, volver a la anterior.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();

  // Cada mutation invalida el tag "Vehicles" y RTK Query vuelve a pedir los listados.
  // unwrap() lanza el error para que lo muestre el formulario.
  const handleSave = async (values: VehicleFormValues) => {
    const name = `${values.brand} ${values.model}`;
    if (editing) {
      await updateVehicle({ id: editing._id, values }).unwrap();
      setEditing(null);
      toast.success("Cambios guardados", { description: name });
    } else {
      await createVehicle(values).unwrap();
      toast.success("Vehículo publicado", { description: `${name} ya está en el catálogo.` });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const vehicle = toDelete;
    setToDelete(null);
    try {
      await deleteVehicle(vehicle._id).unwrap();
      if (editing?._id === vehicle._id) setEditing(null);
      toast.success("Vehículo eliminado", { description: `${vehicle.brand} ${vehicle.model}` });
    } catch (err) {
      toast.error("No se pudo eliminar", { description: getErrorMessage(err) });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <VehicleForm vehicle={editing} onSave={handleSave} onCancel={() => setEditing(null)} />

      {loadError && <FormError message={getErrorMessage(loadError)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={scope === "all" ? "Buscar en el catálogo..." : "Buscar en mis publicaciones..."}
            aria-label="Buscar vehículos"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 bg-background pl-9"
          />
        </div>
        {data && (
          <Badge variant="secondary">
            {data.meta.total} {data.meta.total === 1 ? "vehículo" : "vehículos"}
          </Badge>
        )}
      </div>

      <Card className={cn("py-0 transition-opacity", isFetching && !isLoading && "opacity-60")}>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="pl-4">Vehículo</TableHead>
              {scope === "all" && <TableHead>Publicado por</TableHead>}
              <TableHead>Año</TableHead>
              <TableHead>Km</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="pr-4 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns} className="px-4">
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id} className={editing?._id === vehicle._id ? "bg-accent/60" : undefined}>
                <TableCell className="pl-4">
                  <Link to={`/vehicles/${vehicle._id}`} className="group flex items-center gap-3">
                    <VehicleImage src={vehicle.imageUrl} alt="" className="h-10 w-16 shrink-0 rounded-md [&_span]:hidden [&_svg]:size-5" />
                    <span className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{vehicle.brand}</span>
                      <span className="flex items-center gap-1.5 font-medium group-hover:text-primary group-hover:underline">
                        {vehicle.model}
                        {vehicle.sketchfabModelId && <Box className="size-3.5 text-muted-foreground" aria-label="Con vista 3D" />}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                {scope === "all" && (
                  <TableCell className="text-muted-foreground">
                    {vehicle.ownerName}
                    {vehicle.owner === myId && (
                      <Badge variant="secondary" className="ml-2">
                        Vos
                      </Badge>
                    )}
                  </TableCell>
                )}
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{formatMileage(vehicle.mileage)}</TableCell>
                <TableCell className="font-medium">{formatPrice(vehicle.price)}</TableCell>
                <TableCell>
                  <AvailabilityBadge available={vehicle.available} />
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)} aria-label="Editar">
                          <PencilIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(vehicle)}
                          aria-label="Eliminar"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2Icon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CarIcon className="size-8" />
                    {debouncedSearch ? "No hay vehículos que coincidan con la búsqueda." : emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        destructive
        icon={<Trash2Icon />}
        title="¿Eliminar esta publicación?"
        description={
          toDelete && (
            <>
              Se va a eliminar{" "}
              <strong className="text-foreground">
                {toDelete.brand} {toDelete.model} ({toDelete.year})
              </strong>{" "}
              del catálogo. Esta acción no se puede deshacer.
            </>
          )
        }
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

// Ruta publica "/vehicles/:id". El id sale de la URL con useParams.
import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useParams } from "react-router";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CarFrontIcon,
  CogIcon,
  FuelIcon,
  GaugeIcon,
  LinkIcon,
  PaletteIcon,
  PencilIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/components/ui/Field";
import { VehicleMedia } from "../components/vehicles/VehicleMedia";
import { AvailabilityBadge, Badge3D } from "../components/vehicles/VehicleCard";

const BackLink = () => (
  <Button asChild variant="ghost" size="sm" className="w-fit text-muted-foreground">
    <Link to="/">
      <ArrowLeftIcon /> Volver al catalogo
    </Link>
  </Button>
);

const SpecTile = ({ icon: Icon, label, value }: { icon: typeof CalendarIcon; label: string; value: string }) => (
  <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  </div>
);

export const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  // skipToken = no pedir nada si no hay id. Cada id es una entrada distinta en la cache.
  const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(id ?? skipToken);
  const { data: session } = useSession();

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <Skeleton className="aspect-video rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <section className="flex flex-col gap-3">
        <BackLink />
        <FormError message={`No se pudo cargar el vehiculo: ${getErrorMessage(error)}`} />
      </section>
    );
  }

  // El dueño edita desde "Mis publicaciones"; un admin (si no es suyo) desde el panel.
  const isOwner = session?.user.id === vehicle.owner;
  const editPath = isOwner
    ? `/mis-publicaciones?edit=${vehicle._id}`
    : session?.user.role === "admin"
      ? `/admin?edit=${vehicle._id}`
      : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el link");
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <BackLink />
      <div className="grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
        {/* key: si se navega a otro vehiculo, la vista vuelve a "Foto" */}
        <VehicleMedia key={vehicle._id} vehicle={vehicle} />

        <Card className="gap-5 p-6 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center gap-2">
            <AvailabilityBadge available={vehicle.available} />
            {vehicle.sketchfabModelId && <Badge3D />}
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">{vehicle.brand}</p>
            <h1 className="text-3xl leading-tight font-bold">{vehicle.model}</h1>
          </div>
          <p className="font-heading text-4xl font-bold text-primary">{formatPrice(vehicle.price)}</p>

          <CardContent className="grid grid-cols-2 gap-2 px-0">
            <SpecTile icon={CalendarIcon} label="Año" value={String(vehicle.year)} />
            <SpecTile icon={GaugeIcon} label="Kilometraje" value={formatMileage(vehicle.mileage)} />
            <SpecTile icon={FuelIcon} label="Combustible" value={FUEL_LABELS[vehicle.fuelType]} />
            <SpecTile icon={CogIcon} label="Transmision" value={TRANSMISSION_LABELS[vehicle.transmission]} />
            <SpecTile icon={CarFrontIcon} label="Carroceria" value={BODY_LABELS[vehicle.bodyType]} />
            <SpecTile icon={PaletteIcon} label="Color" value={vehicle.color || "—"} />
          </CardContent>

          {vehicle.description && <p className="leading-relaxed text-muted-foreground">{vehicle.description}</p>}

          <Separator />
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <UserIcon className="size-4 shrink-0" />
              <span className="truncate">
                Publicado por <strong className="font-medium text-foreground">{vehicle.ownerName}</strong>
              </span>
            </span>
            <span className="shrink-0">{formatDate(vehicle.listedAt)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {editPath && (
              <Button asChild size="lg" className="flex-1">
                <Link to={editPath}>
                  <PencilIcon /> {isOwner ? "Editar mi publicacion" : "Editar (admin)"}
                </Link>
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={copyLink} className="flex-1">
              <LinkIcon /> Copiar link
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

import { Link } from "react-router";
import { Box, CalendarIcon, CogIcon, FuelIcon, GaugeIcon } from "lucide-react";
import type { Vehicle } from "../../types/vehicle";
import { BODY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS, formatMileage, formatPrice } from "../../lib/vehicle-format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleImage } from "./VehicleImage";

export const AvailabilityBadge = ({ available, className }: { available: boolean; className?: string }) => (
  <Badge
    className={cn(
      available ? "bg-emerald-100 text-emerald-800" : "bg-slate-800 text-white",
      className,
    )}
  >
    {available ? "Disponible" : "Vendido"}
  </Badge>
);

export const Badge3D = ({ className }: { className?: string }) => (
  <Badge className={cn("bg-slate-900/80 text-white backdrop-blur", className)}>
    <Box /> 3D · 360°
  </Badge>
);

const Spec = ({ icon: Icon, children }: { icon: typeof CalendarIcon; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1">
    <Icon className="size-3.5" />
    {children}
  </span>
);

export const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
  <Link to={`/vehicles/${vehicle._id}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
    <Card className="h-full gap-0 py-0 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-brand-900/10 group-hover:ring-primary/30">
      <div className="relative aspect-video overflow-hidden">
        <VehicleImage
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className={cn(
            "h-full w-full transition-transform duration-500 group-hover:scale-105",
            !vehicle.available && "grayscale-[60%]",
          )}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {vehicle.sketchfabModelId ? <Badge3D /> : <span />}
          <AvailabilityBadge available={vehicle.available} />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{vehicle.brand}</p>
          <h3 className="font-heading text-lg leading-tight font-semibold text-foreground group-hover:text-primary">
            {vehicle.model}
          </h3>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Spec icon={CalendarIcon}>{vehicle.year}</Spec>
          <Spec icon={GaugeIcon}>{formatMileage(vehicle.mileage)}</Spec>
          <Spec icon={FuelIcon}>{FUEL_LABELS[vehicle.fuelType]}</Spec>
          <Spec icon={CogIcon}>{TRANSMISSION_LABELS[vehicle.transmission]}</Spec>
        </div>
        <div className="mt-auto flex items-end justify-between border-t pt-3">
          <p className="font-heading text-2xl font-bold text-primary">{formatPrice(vehicle.price)}</p>
          <span className="text-xs text-muted-foreground">{BODY_LABELS[vehicle.bodyType]}</span>
        </div>
      </CardContent>
    </Card>
  </Link>
);

// Placeholder mientras carga el catalogo (misma forma que la tarjeta real).
export const VehicleCardSkeleton = () => (
  <Card className="gap-0 py-0">
    <Skeleton className="aspect-video rounded-none" />
    <CardContent className="flex flex-col gap-3 p-4">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-2 h-7 w-28" />
    </CardContent>
  </Card>
);

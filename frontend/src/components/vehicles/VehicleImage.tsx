import { useState } from "react";
import { CarFrontIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Foto del vehiculo, o un placeholder si no tiene imagen o la URL falla.
export const VehicleImage = ({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-50 via-muted to-brand-100 text-brand-500",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <CarFrontIcon className="size-12 opacity-60" strokeWidth={1.5} />
        <span className="text-xs font-medium text-muted-foreground">Sin foto</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("bg-muted object-cover", className)}
    />
  );
};

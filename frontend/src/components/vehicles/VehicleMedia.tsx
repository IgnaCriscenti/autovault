// Foto del vehiculo + (si tiene) vista 3D de Sketchfab en pestañas.
// El visor 3D se monta recien cuando el usuario lo pide: asi la pagina carga rapido.
import { useState } from "react";
import { Box, ExternalLinkIcon, ImageIcon } from "lucide-react";
import type { Vehicle } from "../../types/vehicle";
import { sketchfabModelUrl } from "../../lib/sketchfab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleImage } from "./VehicleImage";
import { Sketchfab3DViewer } from "./Sketchfab3DViewer";

type Mode = "photo" | "3d";

export const VehicleMedia = ({ vehicle }: { vehicle: Vehicle }) => {
  const [mode, setMode] = useState<Mode>("photo");
  const title = `${vehicle.brand} ${vehicle.model}`;
  const uid = vehicle.sketchfabModelId;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-foreground/10">
        {mode === "3d" && uid ? (
          <Sketchfab3DViewer uid={uid} title={title} />
        ) : (
          <>
            <VehicleImage src={vehicle.imageUrl} alt={title} className="h-full w-full" />
            {uid && (
              <Button
                size="lg"
                onClick={() => setMode("3d")}
                className="absolute inset-x-0 bottom-5 mx-auto h-11 w-fit rounded-full bg-slate-900/80 px-6 shadow-xl backdrop-blur hover:bg-slate-900"
              >
                <Box /> Ver en 3D · 360°
              </Button>
            )}
          </>
        )}
      </div>

      {uid && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="photo">
                <ImageIcon /> Foto
              </TabsTrigger>
              <TabsTrigger value="3d">
                <Box /> Vista 3D
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <a
            href={sketchfabModelUrl(uid)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Modelo 3D en Sketchfab <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
};

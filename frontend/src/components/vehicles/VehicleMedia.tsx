// Foto del vehiculo + (si tiene) vista 3D de Sketchfab en pestañas.
// El visor 3D se monta recien cuando el usuario lo pide: asi la pagina carga rapido.
import { useState } from "react";
import type { Vehicle } from "../../types/vehicle";
import { sketchfabModelUrl } from "../../lib/sketchfab";
import { VehicleImage } from "./VehicleImage";
import { Sketchfab3DViewer } from "./Sketchfab3DViewer";

const CubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 2 3 7v10l9 5 9-5V7z" />
    <path d="M3 7l9 5 9-5M12 12v10" />
  </svg>
);

const tabClass = (active: boolean) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
  }`;

export const VehicleMedia = ({ vehicle }: { vehicle: Vehicle }) => {
  const [mode, setMode] = useState<"photo" | "3d">("photo");
  const title = `${vehicle.brand} ${vehicle.model}`;
  const uid = vehicle.sketchfabModelId;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
        {mode === "3d" && uid ? (
          <Sketchfab3DViewer uid={uid} title={title} />
        ) : (
          <>
            <VehicleImage src={vehicle.imageUrl} alt={title} className="h-full w-full" />
            {uid && (
              <button
                type="button"
                onClick={() => setMode("3d")}
                className="absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-2 rounded-full bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
              >
                <CubeIcon /> Ver en 3D · 360°
              </button>
            )}
          </>
        )}
      </div>

      {uid && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Vista del vehiculo">
            <button type="button" role="tab" aria-selected={mode === "photo"} onClick={() => setMode("photo")} className={tabClass(mode === "photo")}>
              Foto
            </button>
            <button type="button" role="tab" aria-selected={mode === "3d"} onClick={() => setMode("3d")} className={tabClass(mode === "3d")}>
              Vista 3D
            </button>
          </div>
          <a
            href={sketchfabModelUrl(uid)}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-500 underline hover:text-slate-700"
          >
            Modelo 3D en Sketchfab ↗
          </a>
        </div>
      )}
    </div>
  );
};

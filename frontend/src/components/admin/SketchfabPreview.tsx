// Vista previa del modelo de Sketchfab que se pego en el formulario: nombre, autor, miniatura,
// boton para usar la miniatura como foto del auto y visor 3D opcional.
import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  extractSketchfabId,
  fetchSketchfabModel,
  isSketchfabId,
  sketchfabModelUrl,
  type SketchfabModelInfo,
} from "../../lib/sketchfab";
import { Sketchfab3DViewer } from "../vehicles/Sketchfab3DViewer";
import { Box, CheckCircle2Icon, ImageIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SketchfabPreviewProps {
  value: string; // lo que el usuario escribio (URL o id)
  currentImageUrl: string;
  onUseThumbnail: (url: string) => void;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; info: SketchfabModelInfo };

export const SketchfabPreview = ({ value, currentImageUrl, onUseThumbnail }: SketchfabPreviewProps) => {
  const uid = extractSketchfabId(useDebouncedValue(value, 500));
  const valid = isSketchfabId(uid);
  const [state, setState] = useState<State>({ status: "idle" });
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    setShow3d(false);
    if (!valid) {
      setState({ status: "idle" });
      return;
    }
    // AbortController: si el usuario cambia la URL antes de que responda, se cancela el pedido viejo.
    const controller = new AbortController();
    setState({ status: "loading" });
    fetchSketchfabModel(uid, controller.signal)
      .then((info) => setState(info ? { status: "ok", info } : { status: "error" }))
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) setState({ status: "error" });
      });
    return () => controller.abort();
  }, [uid, valid]);

  if (state.status === "idle") return null;
  if (state.status === "loading") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Buscando el modelo en Sketchfab...
      </p>
    );
  }
  if (state.status === "error") {
    return <p className="text-sm text-amber-700">No se encontró ese modelo en Sketchfab (¿es público?).</p>;
  }

  const { info } = state;
  const alreadyUsed = info.thumbnailUrl === currentImageUrl;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3">
      <div className="flex flex-wrap items-center gap-3">
        {info.thumbnailUrl && <img src={info.thumbnailUrl} alt="" className="h-16 w-28 rounded-lg object-cover shadow-sm" />}
        <div className="min-w-0 flex-1 text-sm">
          <p className="flex items-center gap-1.5 truncate font-medium">
            <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600" /> {info.name}
          </p>
          <p className="text-muted-foreground">
            por {info.author} ·{" "}
            <a href={sketchfabModelUrl(uid)} target="_blank" rel="noreferrer" className="hover:underline">
              ver en Sketchfab ↗
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {info.thumbnailUrl && (
            <Button
              type="button"
              variant="outline"
              disabled={alreadyUsed}
              onClick={() => onUseThumbnail(info.thumbnailUrl!)}
            >
              <ImageIcon /> {alreadyUsed ? "Miniatura en uso" : "Usar miniatura como foto"}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => setShow3d((v) => !v)}>
            <Box /> {show3d ? "Ocultar 3D" : "Previsualizar 3D"}
          </Button>
        </div>
      </div>
      {show3d && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <Sketchfab3DViewer uid={uid} title={info.name} />
        </div>
      )}
    </div>
  );
};

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
  if (state.status === "loading") return <p className="text-sm text-slate-500">Buscando el modelo en Sketchfab...</p>;
  if (state.status === "error") {
    return <p className="text-sm text-amber-700">No se encontro ese modelo en Sketchfab (¿es publico?).</p>;
  }

  const { info } = state;
  const alreadyUsed = info.thumbnailUrl === currentImageUrl;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-3">
        {info.thumbnailUrl && <img src={info.thumbnailUrl} alt="" className="h-16 w-28 rounded-lg object-cover" />}
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate font-medium text-slate-900">{info.name}</p>
          <p className="text-slate-500">
            por {info.author} ·{" "}
            <a href={sketchfabModelUrl(uid)} target="_blank" rel="noreferrer" className="underline">
              ver en Sketchfab ↗
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {info.thumbnailUrl && (
            <button
              type="button"
              disabled={alreadyUsed}
              onClick={() => onUseThumbnail(info.thumbnailUrl!)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              {alreadyUsed ? "Miniatura en uso como foto" : "Usar miniatura como foto"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShow3d((v) => !v)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            {show3d ? "Ocultar 3D" : "Previsualizar 3D"}
          </button>
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

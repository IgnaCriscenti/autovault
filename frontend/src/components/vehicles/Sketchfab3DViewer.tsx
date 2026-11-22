// Visor 3D de Sketchfab embebido (iframe). Se monta solo cuando se lo necesita: carga varios MB.
import { sketchfabEmbedUrl } from "../../lib/sketchfab";

interface Sketchfab3DViewerProps {
  uid: string;
  title: string;
  className?: string;
}

export const Sketchfab3DViewer = ({ uid, title, className = "" }: Sketchfab3DViewerProps) => (
  <iframe
    title={`Modelo 3D de ${title}`}
    src={sketchfabEmbedUrl(uid)}
    allow="autoplay; fullscreen; xr-spatial-tracking"
    allowFullScreen
    className={`h-full w-full border-0 bg-slate-900 ${className}`}
  />
);

// Utilidades de Sketchfab: ids de modelos, URLs del visor y datos publicos de un modelo.

export const SKETCHFAB_UID_REGEX = /^[a-f0-9]{32}$/;

// Acepta el id o una URL de Sketchfab y devuelve el id (misma logica que el backend).
export function extractSketchfabId(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/([a-f0-9]{32})(?:[/?#]|\/embed|$)/i);
  return match ? match[1].toLowerCase() : trimmed;
}

export const isSketchfabId = (value: string): boolean => SKETCHFAB_UID_REGEX.test(value);

// URL del visor embebible. Parametros: https://sketchfab.com/developers/viewer/initialization
export function sketchfabEmbedUrl(uid: string): string {
  const params = new URLSearchParams({
    autostart: "1", // el iframe se monta recien cuando el usuario pide la vista 3D
    preload: "1",
    ui_theme: "dark",
    ui_hint: "2", // muestra la ayuda "arrastra para rotar"
    dnt: "1", // do not track
  });
  return `https://sketchfab.com/models/${uid}/embed?${params}`;
}

export const sketchfabModelUrl = (uid: string): string => `https://sketchfab.com/3d-models/${uid}`;

export const sketchfabSearchUrl = (query: string): string =>
  `https://sketchfab.com/search?type=models&q=${encodeURIComponent(query)}`;

export interface SketchfabModelInfo {
  name: string;
  author: string;
  thumbnailUrl: string | null;
}

// Datos publicos del modelo (API v3 de Sketchfab, permite CORS). null si no existe.
export async function fetchSketchfabModel(uid: string, signal?: AbortSignal): Promise<SketchfabModelInfo | null> {
  const response = await fetch(`https://api.sketchfab.com/v3/models/${uid}`, { signal });
  if (!response.ok) return null;
  const model = await response.json();
  const images: { url: string; width: number }[] = model.thumbnails?.images ?? [];
  // La miniatura mas grande que no pase de 1280px de ancho (suele ser 1024x576).
  const thumbnail = [...images].sort((a, b) => b.width - a.width).find((img) => img.width <= 1280) ?? images[0];
  return { name: model.name, author: model.user?.displayName ?? model.user?.username ?? "", thumbnailUrl: thumbnail?.url ?? null };
}

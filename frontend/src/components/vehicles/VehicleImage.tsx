import { useState } from "react";

// Foto del vehiculo, o un placeholder si no tiene imagen o la URL falla.
export const VehicleImage = ({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-slate-200 text-brand-600 ${className}`}
        aria-label={alt}
        role="img"
      >
        <svg viewBox="0 0 64 32" className="w-1/3 opacity-60" fill="currentColor" aria-hidden="true">
          <path d="M4 22l4-9c1-3 3-4 6-4h22c3 0 5 1 7 3l6 6 8 2c2 .5 3 2 3 4v2a2 2 0 0 1-2 2h-4a6 6 0 0 0-12 0H22a6 6 0 0 0-12 0H6a2 2 0 0 1-2-2z" />
          <circle cx="16" cy="26" r="4" />
          <circle cx="50" cy="26" r="4" />
        </svg>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
};

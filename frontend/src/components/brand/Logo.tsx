// Logo de AutoVault: isotipo (boveda + auto + cerradura) y, opcional, el nombre "autovault".
// SVG inline (no <img>) para heredar estilos y animar los trazos en el splash de bienvenida.
import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  /** Agrega la clase "logo-draw" a los trazos para animarlos (ver index.css). */
  animated?: boolean;
}

export const LogoMark = ({ className, animated = false }: LogoMarkProps) => {
  // id unico por instancia: si hay dos logos en pantalla, sus gradientes no se pisan.
  const gradientId = `av-steel-${useId().replace(/:/g, "")}`;
  const stroke = `url(#${gradientId})`;
  const draw = animated ? "logo-draw" : undefined;

  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7fb0d6" />
          <stop offset="0.55" stopColor="#4a7fae" />
          <stop offset="1" stopColor="#2c5680" />
        </linearGradient>
      </defs>
      <path className={draw} pathLength={1} d="M14 55V24.5L22.5 11H41.5L50 24.5V55" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path className={draw} pathLength={1} d="M20 55V27.5L26 18.5H38L44 27.5V55" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <path className={draw} pathLength={1} d="M5 44.5V40.5L10 35.5L21.5 33L28 26.5H38.5L46.5 33L56.5 35L59.5 40V44.5" stroke="#34465a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 44.5H11.5M24.5 44.5H39.5M52.5 44.5H59.5" stroke="#34465a" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M11.5 44.5A6.5 6.5 0 0 1 24.5 44.5M39.5 44.5A6.5 6.5 0 0 1 52.5 44.5" stroke="#34465a" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="18" cy="46" r="3.6" fill="#34465a" />
      <circle cx="46" cy="46" r="3.6" fill="#34465a" />
      <circle cx="32" cy="36.5" r="4.6" fill="#ffffff" stroke={stroke} strokeWidth="2.4" />
      <circle cx="32" cy="36.5" r="1.5" fill="#2c5680" />
    </svg>
  );
};

interface LogoProps {
  className?: string;
  markClassName?: string;
  /** "sm" para el header, "lg" para el splash. */
  size?: "sm" | "lg";
  tagline?: boolean;
}

export const Logo = ({ className, markClassName, size = "sm", tagline = false }: LogoProps) => (
  <span className={cn("inline-flex items-center gap-2", size === "lg" && "flex-col gap-3", className)}>
    <LogoMark className={cn(size === "sm" ? "size-9" : "size-28", markClassName)} animated={size === "lg"} />
    <span className={cn("flex flex-col leading-none", size === "lg" && "items-center")}>
      <span className={cn("font-heading font-bold tracking-tight lowercase", size === "sm" ? "text-2xl" : "text-6xl")}>
        <span className="text-slate-700">auto</span>
        <span className="bg-gradient-to-br from-[#5b8fbd] to-[#2c5680] bg-clip-text text-transparent">vault</span>
      </span>
      {tagline && (
        <span
          className={cn(
            "font-medium tracking-[0.3em] text-slate-500 uppercase",
            size === "sm" ? "mt-1 text-[0.55rem]" : "mt-3 text-sm",
          )}
        >
          Automotive showcase
        </span>
      )}
    </span>
  </span>
);

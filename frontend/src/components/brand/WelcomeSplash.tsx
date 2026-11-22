// Splash de bienvenida: pantalla completa con el logo dibujándose y un saludo, ~2 s.
// Aparece solo justo después de iniciar sesión (ver lib/welcome.ts). Un clic lo saltea.
import { useEffect, useState } from "react";
import { useSession } from "../../lib/auth-client";
import { consumeWelcome } from "../../lib/welcome";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export const WelcomeSplash = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Cuando aparece la sesión, si había un login "pendiente de bienvenida", se muestra.
  useEffect(() => {
    if (user && consumeWelcome()) {
      setLeaving(false);
      setVisible(true);
    }
  }, [user?.id]);

  // Duración: 2,2 s (0,8 s si el sistema pide menos movimiento). Los últimos 400 ms son el fade-out.
  useEffect(() => {
    if (!visible) return;
    const total = reducedMotion() ? 800 : 2200;
    const fadeTimer = setTimeout(() => setLeaving(true), total - 400);
    const hideTimer = setTimeout(() => setVisible(false), total);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible || !user) return null;

  const firstName = user.name.split(" ")[0];

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => setVisible(false)}
      className={cn(
        "fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center gap-8 bg-gradient-to-br from-white via-brand-50 to-brand-100",
        "animate-in duration-300 fade-in",
        leaving && "animate-out duration-400 fill-mode-forwards fade-out",
      )}
    >
      <div className="animate-in duration-700 ease-out zoom-in-90 fade-in">
        <Logo size="lg" tagline />
      </div>
      <p className="animate-in font-heading text-2xl font-semibold text-foreground delay-500 duration-500 fill-mode-backwards fade-in slide-in-from-bottom-2">
        ¡Hola, {firstName}! 👋
      </p>
      <span className="absolute bottom-8 text-xs text-muted-foreground">Tocá para continuar</span>
    </div>
  );
};

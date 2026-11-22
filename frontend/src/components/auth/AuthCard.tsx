// Marco de las pantallas de login / registro: panel de marca (desktop) + tarjeta con el formulario.
import type { ReactNode } from "react";
import { Box, CarIcon, ShieldCheckIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PERKS = [
  { icon: Box, text: "Recorre cada auto en 3D, 360°" },
  { icon: CarIcon, text: "Publica tu auto y gestionalo desde un solo lugar" },
  { icon: ShieldCheckIcon, text: "Ingresa con email, Google o GitHub" },
];

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const AuthCard = ({ title, description, children }: AuthCardProps) => (
  <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-card shadow-xl ring-1 ring-foreground/10 lg:grid-cols-2">
    <div className="relative hidden flex-col justify-between gap-10 bg-gradient-to-br from-[#16263a] via-[#244465] to-[#3f72a0] p-10 text-white lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div className="relative w-fit rounded-2xl bg-white/90 px-4 py-3 shadow-lg">
        <Logo tagline />
      </div>
      <div className="relative flex flex-col gap-4">
        <p className="font-heading text-3xl leading-tight font-bold">Tu proximo auto, a un clic (y en 3D).</p>
        <ul className="flex flex-col gap-3 text-white/80">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                <Icon className="size-4 text-brand-200" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <Card className="rounded-none py-10 shadow-none ring-0 sm:px-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  </section>
);

export const Divider = ({ label = "o continua con" }: { label?: string }) => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <span className="h-px flex-1 bg-border" />
    {label}
    <span className="h-px flex-1 bg-border" />
  </div>
);

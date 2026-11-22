// Portada del catalogo: propuesta de valor + auto destacado (el mas caro con vista 3D).
import { Link } from "react-router";
import { ArrowRightIcon, Box, CarIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { useGetVehiclesQuery } from "../../store/api";
import { formatPrice } from "../../lib/vehicle-format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const HIGHLIGHTS = [
  { icon: Box, text: "Vista 3D 360°" },
  { icon: CarIcon, text: "Publicá tu auto gratis" },
  { icon: ShieldCheckIcon, text: "Concesionaria y particulares" },
];

export const HomeHero = ({ onBrowse }: { onBrowse: () => void }) => {
  const { data, isLoading } = useGetVehiclesQuery({
    limit: 1,
    has3d: true,
    available: true,
    sortBy: "price",
    sortOrder: "desc",
  });
  const featured = data?.data[0];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16263a] via-[#244465] to-[#3f72a0] px-6 py-10 text-white shadow-xl shadow-brand-900/20 sm:px-10 sm:py-12">
      {/* Grilla de puntos decorativa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_right,transparent,black)]"
      />
      <div className="relative grid items-center gap-10 md:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-5">
          <Badge className="bg-white/15 text-white backdrop-blur">
            <SparklesIcon /> Nuevo: recorré los autos en 3D
          </Badge>
          <h1 className="text-4xl leading-[1.1] font-bold sm:text-5xl">
            Encontrá tu próximo auto. <span className="text-brand-200">Miralo en 3D</span> antes de visitarlo.
          </h1>
          <p className="max-w-lg text-base text-white/75">
            0 km y usados seleccionados por la concesionaria y por particulares. Filtrá, compará y girá cada modelo
            360° desde tu casa.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={onBrowse} className="h-11 bg-white px-5 text-brand-900 hover:bg-white/90">
              Ver catálogo <ArrowRightIcon />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-white/30 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/mis-publicaciones">Publicá tu auto</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                <Icon className="size-4 text-brand-200" /> {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Auto destacado */}
        <div className="hidden md:block">
          {isLoading ? (
            <Skeleton className="aspect-video w-full rounded-2xl bg-white/10" />
          ) : featured ? (
            <Link to={`/vehicles/${featured._id}`} className="group relative block">
              <div className="absolute -inset-4 rounded-[2rem] bg-brand-200/20 blur-2xl transition group-hover:bg-brand-200/30" />
              <img
                src={featured.imageUrl}
                alt={`${featured.brand} ${featured.model}`}
                className="relative aspect-video w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/20 transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute right-4 -bottom-5 left-4 flex items-center justify-between gap-3 rounded-xl bg-white/90 px-4 py-3 text-foreground shadow-lg backdrop-blur">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Destacado</p>
                  <p className="truncate font-heading font-semibold">
                    {featured.brand} {featured.model}
                  </p>
                </div>
                <p className="shrink-0 font-heading text-lg font-bold text-primary">{formatPrice(featured.price)}</p>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
};

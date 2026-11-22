import { Link } from "react-router";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const NotFound = () => (
  <section className="flex flex-col items-center gap-4 py-16 text-center">
    <LogoMark className="size-20 opacity-80" />
    <p className="font-heading text-7xl font-bold text-primary">404</p>
    <h1 className="text-2xl font-semibold">Esta pagina no esta en la boveda</h1>
    <p className="text-muted-foreground">Puede que el link este mal o que la publicacion se haya eliminado.</p>
    <Button asChild size="lg">
      <Link to="/">Volver al catalogo</Link>
    </Button>
  </section>
);

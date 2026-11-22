// Layout general: header (logo, navegacion, menu de usuario / menu movil) + contenido + footer.
// Se monta una sola vez; al navegar solo cambia lo que renderiza <Outlet />.
import { Link, NavLink, Outlet } from "react-router";
import { MenuIcon } from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "../lib/auth-client";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "@/components/layout/UserMenu";

const REPO_URL = "https://github.com/IgnaCriscenti/autovault";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const links = [
    { to: "/", label: "Catalogo", end: true, show: true },
    { to: "/mis-publicaciones", label: "Mis publicaciones", end: false, show: !!user },
    { to: "/admin", label: "Admin", end: false, show: isAdmin },
  ].filter((link) => link.show);

  // signOut borra la sesion EN LA BASE (no solo la cookie). Recarga completa para limpiar caches.
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message ?? "No se pudo cerrar sesion");
      return;
    }
    window.location.replace("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="AutoVault, ir al inicio" className="shrink-0">
            <Logo />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isPending ? null : user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                  <Link to="/login">Ingresar</Link>
                </Button>
                <Button asChild size="lg">
                  <Link to="/register">Crear cuenta</Link>
                </Button>
              </>
            )}

            {/* Menu movil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Abrir menu">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4">
                  {links.map(({ to, label, end }) => (
                    <SheetClose asChild key={to}>
                      <NavLink to={to} end={end} className={navLinkClass}>
                        {label}
                      </NavLink>
                    </SheetClose>
                  ))}
                  {!user && (
                    <SheetClose asChild>
                      <NavLink to="/login" className={navLinkClass}>
                        Ingresar
                      </NavLink>
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark className="size-6" />
            <span>AutoVault · TP2 Metodologias y Desarrollos Web (UAI)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacidad" className="hover:text-foreground">
              Privacidad
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Codigo en GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Layout generico: header + contenido. Se monta una sola vez; al navegar solo cambia el <Outlet />.
import { Link, NavLink, Outlet } from "react-router";
import { signOut, useSession } from "../lib/auth-client";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm transition hover:bg-white/10 ${isActive ? "bg-white/15" : ""}`;

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  // signOut borra la sesion EN LA BASE (no solo la cookie). Recarga completa para limpiar caches.
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(error.message ?? "No se pudo cerrar sesion");
      return;
    }
    window.location.replace("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <header className="bg-brand-900 px-6 py-4 text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Auto<span className="text-brand-100">Vault</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Catalogo
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
            {isPending ? null : user ? (
              <>
                <span className="px-2 text-sm text-white/70">
                  {user.name}
                  {user.role === "admin" && (
                    <span className="ml-1 rounded bg-amber-400 px-1.5 py-0.5 text-xs font-semibold text-amber-950">
                      admin
                    </span>
                  )}
                </span>
                <button type="button" onClick={handleLogout} className={navLinkClass({ isActive: false })}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Ingresar
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded bg-white px-3 py-1.5 text-sm font-medium text-brand-900 hover:bg-brand-50"
                >
                  Crear cuenta
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        AutoVault · TP2 Metodologias y Desarrollos Web
      </footer>
    </div>
  );
};

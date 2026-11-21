// Layout generico: header + contenido. Se monta una sola vez; al navegar solo cambia el <Outlet />.
import { Link, NavLink, Outlet } from "react-router";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm transition hover:bg-white/10 ${isActive ? "bg-white/15" : ""}`;

export const Layout = () => (
  <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
    <header className="bg-brand-900 px-6 py-4 text-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Auto<span className="text-brand-100">Vitrina</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Catalogo
          </NavLink>
        </nav>
      </div>
    </header>
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      <Outlet />
    </main>
    <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      AutoVitrina · TP2 Metodologias y Desarrollos Web
    </footer>
  </div>
);

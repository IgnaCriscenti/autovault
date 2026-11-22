// Encabezado del panel de admin: título + pestañas (Vehículos / Usuarios).
import { NavLink } from "react-router";
import { CarIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4",
    isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
  );

export const AdminHeader = ({ description }: { description: string }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
        <ShieldCheckIcon className="size-4" /> Administración
      </p>
      <h1 className="text-3xl font-bold">Panel de administración</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
    <nav className="inline-flex rounded-lg bg-muted p-1" aria-label="Secciones de administración">
      <NavLink to="/admin" end className={tabClass}>
        <CarIcon /> Vehículos
      </NavLink>
      <NavLink to="/admin/users" className={tabClass}>
        <UsersIcon /> Usuarios
      </NavLink>
    </nav>
  </div>
);

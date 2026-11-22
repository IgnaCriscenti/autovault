import { NavLink } from "react-router";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-4 py-2 text-sm font-medium transition ${
    isActive ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
  }`;

// Navegacion entre las secciones del panel de admin.
export const AdminTabs = () => (
  <nav className="flex gap-2 border-b border-slate-200" aria-label="Secciones de administracion">
    <NavLink to="/admin" end className={tabClass}>
      Vehiculos
    </NavLink>
    <NavLink to="/admin/users" className={tabClass}>
      Usuarios
    </NavLink>
  </nav>
);

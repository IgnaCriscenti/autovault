// Guarda de rutas: sin sesion -> /login; con sesion pero sin el rol pedido -> pantalla "sin permisos".
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";
import type { UserRole } from "../types/auth";

export const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  // isPending: true hasta que responde /api/auth/get-session (por ej. justo despues de un F5).
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return <p className="text-slate-500">Verificando sesion...</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(session.user.role as UserRole)) {
    return (
      <section className="mx-auto mt-8 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-amber-900">Sin permisos</h2>
        <p className="mt-1 text-sm text-amber-800">Esta seccion es solo para administradores.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-700 underline">
          Volver al catalogo
        </Link>
      </section>
    );
  }

  return <Outlet />;
};

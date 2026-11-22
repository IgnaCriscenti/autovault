// Guarda de rutas: sin sesión -> /login; con sesión pero sin el rol pedido -> pantalla "Sin permisos".
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { useSession } from "../lib/auth-client";
import type { UserRole } from "../types/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  // isPending: true hasta que responde /api/auth/get-session (por ej. justo después de un F5).
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Verificando sesión...
      </p>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(session.user.role as UserRole)) {
    return (
      <Card className="mx-auto mt-8 max-w-md items-center gap-3 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlertIcon className="size-7" />
        </span>
        <h1 className="text-xl font-semibold">Sin permisos</h1>
        <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
        <Button asChild className="mt-2">
          <Link to="/">Volver al catálogo</Link>
        </Button>
      </Card>
    );
  }

  return <Outlet />;
};

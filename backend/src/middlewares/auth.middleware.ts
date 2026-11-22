// Protege rutas: Better Auth lee la cookie de sesion y busca la sesion en Mongo.
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { UserRole } from "../types/auth.types.js";

// 401 si no hay sesion valida. Si la hay, deja el usuario en req.user.
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session) {
      res.status(401).json({ error: { message: "Tenés que iniciar sesión" } });
      return;
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error("[auth] error reading session:", error);
    res.status(500).json({ error: { message: "No se pudo verificar la sesión" } });
  }
}

// 403 si el usuario no tiene alguno de los roles permitidos. Siempre va DESPUES de authMiddleware.
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { message: "Tenés que iniciar sesión" } });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: { message: "No tenés permisos para realizar esta acción" } });
      return;
    }

    next();
  };
}

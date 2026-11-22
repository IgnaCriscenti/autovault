// Registros propios: un usuario solo puede editar/eliminar los vehiculos que publico; el admin, todos.
// Va DESPUES de authMiddleware (necesita req.user) y de validateObjectId.
import { Request, Response, NextFunction } from "express";
import { findVehicleById } from "../services/vehicles.service.js";

export async function requireVehicleOwnerOrAdmin(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const vehicle = await findVehicleById(req.params.id);

    if (!vehicle) {
      res.status(404).json({ error: { message: "Vehiculo no encontrado" } });
      return;
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = vehicle.owner === req.user?.id;
    if (!isAdmin && !isOwner) {
      res.status(403).json({ error: { message: "Solo podes modificar tus propias publicaciones" } });
      return;
    }

    next();
  } catch (error) {
    console.error("[ownership] error checking vehicle owner:", error);
    res.status(500).json({ error: { message: "No se pudo verificar el vehiculo" } });
  }
}

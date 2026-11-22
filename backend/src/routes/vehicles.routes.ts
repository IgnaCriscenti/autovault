// Mapeo (metodo HTTP + ruta) -> middlewares -> controller. Sin logica de negocio.
import { Router } from "express";
import {
  listVehicles,
  listMyVehicles,
  listBrands,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicles.controller.js";
import { validateBody, validateObjectId, validateQuery } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireVehicleOwnerOrAdmin } from "../middlewares/ownership.middleware.js";
import { createVehicleSchema, listVehiclesSchema, updateVehicleSchema } from "../schemas/vehicle.schema.js";

const router = Router();
// Registros propios: cualquier usuario logueado publica (queda como dueño);
// editar/eliminar solo el dueño o un admin. Orden: sesion (401) -> id (400) -> existe/dueño (404/403) -> body (400).
const ownerOrAdmin = [authMiddleware, validateObjectId, requireVehicleOwnerOrAdmin];

// Lectura: publica (el catalogo muestra todas las publicaciones)
router.get("/", validateQuery(listVehiclesSchema), listVehicles);
router.get("/brands", listBrands); // antes de "/:id", si no "brands" se tomaria como id
router.get("/mine", authMiddleware, validateQuery(listVehiclesSchema), listMyVehicles);
router.get("/:id", validateObjectId, getVehicleById);

// Escritura
router.post("/", authMiddleware, validateBody(createVehicleSchema), createVehicle);
router.put("/:id", ownerOrAdmin, validateBody(updateVehicleSchema), updateVehicle);
router.patch("/:id", ownerOrAdmin, validateBody(updateVehicleSchema), updateVehicle);
router.delete("/:id", ownerOrAdmin, deleteVehicle);

export default router;

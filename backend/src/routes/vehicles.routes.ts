// Mapeo (metodo HTTP + ruta) -> middlewares -> controller. Sin logica de negocio.
import { Router } from "express";
import {
  listVehicles,
  listBrands,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicles.controller.js";
import { validateBody, validateObjectId, validateQuery } from "../middlewares/validate.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import { createVehicleSchema, listVehiclesSchema, updateVehicleSchema } from "../schemas/vehicle.schema.js";

const router = Router();
// Orden: primero la sesion (401), despues el rol (403), despues los datos (400).
const onlyAdmin = [authMiddleware, requireRole("admin")];

// Lectura: publica
router.get("/", validateQuery(listVehiclesSchema), listVehicles);
router.get("/brands", listBrands); // antes de "/:id", si no "brands" se tomaria como id
router.get("/:id", validateObjectId, getVehicleById);

// Escritura: solo admin
router.post("/", onlyAdmin, validateBody(createVehicleSchema), createVehicle);
router.put("/:id", onlyAdmin, validateObjectId, validateBody(updateVehicleSchema), updateVehicle);
router.patch("/:id", onlyAdmin, validateObjectId, validateBody(updateVehicleSchema), updateVehicle);
router.delete("/:id", onlyAdmin, validateObjectId, deleteVehicle);

export default router;

// Agrupa todos los routers de la v1. Las entidades nuevas se montan aca, no en server.ts.
import { Router } from "express";
import vehiclesRouter from "./vehicles.routes.js";

const router = Router();

router.use("/vehicles", vehiclesRouter);

export default router;

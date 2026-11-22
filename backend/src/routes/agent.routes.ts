// POST /api/v1/agent/chat — chat con el asesor virtual (respuesta por SSE).
// authMiddleware obligatorio: cada mensaje gasta cuota de Groq, no puede quedar abierto a cualquiera,
// y las tools necesitan saber quien es el usuario (sus publicaciones, permisos).
import { Router } from "express";
import { chat } from "../controllers/agent.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { chatSchema } from "../schemas/agent.schema.js";

const router = Router();

router.post("/chat", authMiddleware, validateBody(chatSchema), chat);

export default router;

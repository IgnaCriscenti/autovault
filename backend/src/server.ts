// dotenv primero: los modulos que siguen leen variables de entorno apenas se importan.
import "dotenv/config";
import express, { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import v1Router from "./routes/index.js";
import { connectMongoDB } from "./config/db.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Render (y cualquier proxy) agrega X-Forwarded-*: confiar en el para IPs y protocolo correctos.
app.set("trust proxy", 1);

// Sin CORS: el front llama a /api en su mismo origen (proxy de Vite en local,
// rewrite del Static Site en Render), asi que la cookie de sesion es first-party.

// Better Auth ANTES de express.json(): su handler lee el body crudo.
// "*splat" es el comodin de Express 5.
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use("/api/v1", v1Router);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
});

// Cualquier ruta /api que no exista: 404 en JSON (no el HTML por defecto de Express).
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ error: { message: "Recurso no encontrado" } });
});

async function startServer(): Promise<void> {
  await connectMongoDB();
  app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
}

startServer().catch((error: unknown) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});

// Better Auth: guarda usuarios, sesiones y cuentas OAuth en NUESTRO Mongo
// (colecciones user, session, account, verification).
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { requireEnv } from "./require-env.js";

// Better Auth usa el driver nativo de Mongo (independiente de la conexion de mongoose).
// Pasarlo como `client` habilita transacciones (Atlas = replica set).
const client = new MongoClient(requireEnv("MONGODB_URI"));

const VALID_ROLES = ["user", "admin"];

// Reglas extra sobre los endpoints del plugin admin (Better Auth no las trae por defecto):
// - solo se aceptan los roles "user" y "admin" (no cualquier texto)
// - un admin no puede cambiarse su propio rol (evita quedarse sin ningun admin por error)
const roleRulesMiddleware = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/admin/set-role" && ctx.path !== "/admin/create-user") return;

  const role: unknown = ctx.body?.role;
  if (role !== undefined && (typeof role !== "string" || !VALID_ROLES.includes(role))) {
    throw new APIError("BAD_REQUEST", { message: `Rol inválido. Opciones: ${VALID_ROLES.join(", ")}` });
  }

  if (ctx.path === "/admin/set-role") {
    const session = await getSessionFromCtx(ctx);
    if (session && session.user.id === ctx.body?.userId) {
      throw new APIError("BAD_REQUEST", { message: "No podés cambiar tu propio rol" });
    }
  }
});

export const auth = betterAuth({
  // URL publica que ve el navegador: la del FRONT, porque /api llega al back por el proxy/rewrite.
  // El secret se lee solo de BETTER_AUTH_SECRET.
  baseURL: requireEnv("BETTER_AUTH_URL"),
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true, // hashea con scrypt; minimo 8 caracteres por defecto
  },
  socialProviders: {
    github: {
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
    },
    google: {
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      // Siempre muestra el selector de cuentas de Google (util si hay varias cuentas en el navegador).
      prompt: "select_account",
    },
  },
  // Si alguien registrado con email+password entra con GitHub o Google (mismo email), se unen las
  // cuentas. Seguro porque ambos proveedores solo devuelven emails verificados.
  account: {
    accountLinking: { trustedProviders: ["github", "google"] },
  },
  // admin(): agrega user.role ("user" por defecto) y endpoints para gestionar usuarios y roles
  // (/admin/list-users, /admin/set-role, /admin/create-user...), solo accesibles para rol "admin".
  plugins: [admin()],
  hooks: {
    before: roleRulesMiddleware,
  },
});

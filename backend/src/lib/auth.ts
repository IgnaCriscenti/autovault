// Better Auth: guarda usuarios, sesiones y cuentas OAuth en NUESTRO Mongo
// (colecciones user, session, account, verification).
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { requireEnv } from "./require-env.js";

// Better Auth usa el driver nativo de Mongo (independiente de la conexion de mongoose).
// Pasarlo como `client` habilita transacciones (Atlas = replica set).
const client = new MongoClient(requireEnv("MONGODB_URI"));

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
  },
  // Si alguien registrado con email+password entra con GitHub (mismo email), se unen las cuentas.
  account: {
    accountLinking: { trustedProviders: ["github"] },
  },
  // admin(): agrega user.role ("user" por defecto) y endpoints para gestionar usuarios y roles.
  plugins: [admin()],
});

// Cliente de Better Auth. Sin baseURL: el front y la API comparten origen
// (proxy de Vite en local, rewrite /api/* del Static Site en Render).
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

// useSession pide /api/auth/get-session y lo cachea: al recargar (F5) la sesion se recupera de la cookie.
export const { useSession, signIn, signUp, signOut } = authClient;

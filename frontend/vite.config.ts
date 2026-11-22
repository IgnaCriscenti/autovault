import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Alias "@/..." -> src/ (mismo que en tsconfig; lo usan los componentes de shadcn/ui).
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  // /api va al backend como si fuera el mismo origen: es el mismo truco que el rewrite de Render.
  // Asi la cookie de sesion es first-party y no hace falta CORS.
  server: {
    proxy: { "/api": "http://localhost:3000" },
  },
});

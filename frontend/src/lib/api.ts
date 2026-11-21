import axios from "axios";

// Ruta relativa: mismo origen que el front, el navegador manda la cookie de sesion solo.
// En local la resuelve el proxy de Vite; en Render, el rewrite /api/* del Static Site.
export const api = axios.create({ baseURL: "/api/v1" });

// La API responde los errores como { error: { message, details? } }.
// Los errores de RTK Query (axiosBaseQuery) ya llegan como string.
export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (axios.isAxiosError(err)) {
    const error = err.response?.data?.error;
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (!err.response) return "No se pudo conectar con el servidor";
    return err.message;
  }
  return "Error desconocido";
};

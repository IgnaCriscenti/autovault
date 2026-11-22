import { z } from "zod";

// Los limites de largo no son esteticos: cada caracter son tokens que gastan la cuota de Groq.
export const MAX_HISTORY = 8;

const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

export const chatSchema = z.object({
  message: z.string({ error: "El mensaje es obligatorio" }).trim().min(1, "El mensaje es obligatorio").max(1000, "Máximo 1000 caracteres"),
  // Ultimos mensajes de la conversacion (los manda el front) para entender preguntas de seguimiento
  // ("¿y el más barato de esos?"). Solo es texto: los permisos los chequean las tools, no el historial.
  history: z.array(historyMessageSchema).max(MAX_HISTORY, `Máximo ${MAX_HISTORY} mensajes de historial`).default([]),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type ChatHistoryMessage = z.infer<typeof historyMessageSchema>;

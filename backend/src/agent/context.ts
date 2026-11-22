// Contexto del agente: el usuario logueado. El controller lo arma con req.user y LangChain se lo pasa
// a cada tool en runtime.context. NO va en los mensajes: el LLM no lo ve ni lo puede falsificar.
import { z } from "zod";

export const agentContextSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  }),
});

export type AgentContext = z.infer<typeof agentContextSchema>;

// La misma regla que requireVehicleOwnerOrAdmin en la API REST, pero adentro de la tool:
// el prompt se puede saltear con un mensaje ingenioso; este if no.
export function canModifyVehicle(owner: string, context: AgentContext | undefined): boolean {
  if (!context) return false;
  return context.user.role === "admin" || context.user.id === owner;
}

// El agente: modelo + prompt + tools.
// createAgent arma el loop ReAct (Reason + Act):
//   1. manda los mensajes al LLM
//   2. si el LLM pide una tool -> la ejecuta y agrega el resultado como ToolMessage
//   3. vuelve a 1 hasta que el LLM responde texto sin pedir tools
import { createAgent, type BaseMessage } from "langchain";
import { llm } from "./llm.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import { tools } from "./tools/index.js";
import type { DeletionRequest } from "./tools/vehicles.tools.js";
import { AgentContext, agentContextSchema } from "./context.js";
import { ChatHistoryMessage } from "../schemas/agent.schema.js";

// Lo que el agente le cuenta al controller mientras trabaja. No sabe nada de SSE ni de HTTP.
export type AgentEvent =
  | { type: "token"; text: string } // un pedazo de la respuesta final
  | { type: "tool"; name: string; args: Record<string, unknown> } // el modelo pidio esta tool
  | ({ type: "confirm_delete" } & DeletionRequest); // el front tiene que preguntar "¿Eliminar...? Sí / No"

// contextSchema: el usuario logueado llega a cada tool en runtime.context (no va en los mensajes).
const agent = createAgent({ model: llm, tools, systemPrompt: SYSTEM_PROMPT, contextSchema: agentContextSchema });

// async generator: va entregando eventos a medida que llegan (for await ... of del lado del controller).
export async function* streamAgent(
  message: string,
  history: ChatHistoryMessage[],
  context: AgentContext,
  signal: AbortSignal
): AsyncGenerator<AgentEvent> {
  console.log(`[agent] mensaje: "${message}" (usuario ${context.user.id}, rol ${context.user.role}, historial ${history.length})`);

  // Dos modos de streaming a la vez; cada item llega como [modo, payload]:
  //   "messages" -> cada TOKEN apenas lo genera el modelo     -> para mostrar el texto en vivo
  //   "updates"  -> cada MENSAJE COMPLETO al terminar un paso -> para saber que tools pidio y con que args
  // recursionLimit corta el loop si el modelo se queda llamando tools sin parar.
  // signal: si el usuario cancela o cierra la pestaña, se corta la llamada a Groq.
  const stream = await agent.stream(
    { messages: [...history, { role: "user", content: message }] },
    { streamMode: ["messages", "updates"], recursionLimit: 12, signal, context }
  );

  for await (const [mode, payload] of stream) {
    if (mode === "messages") {
      const [chunk] = payload as [BaseMessage, unknown];
      // Solo el texto del modelo va al usuario. Los ToolMessage (resultado crudo) los lee el modelo.
      if (chunk.type === "ai" && chunk.text) yield { type: "token", text: chunk.text };
      continue;
    }

    // "updates": { nombreDelNodo: { messages: [...] } } cada vez que termina un paso del loop.
    for (const update of Object.values(payload as Record<string, { messages?: BaseMessage[] }>)) {
      for (const msg of update?.messages ?? []) {
        const calls = msg.type === "ai" && "tool_calls" in msg && Array.isArray(msg.tool_calls) ? msg.tool_calls : [];
        for (const call of calls) yield { type: "tool", name: call.name, args: call.args };

        // Pedido de confirmacion: el artifact de la tool (que el modelo no ve) va directo al front.
        if (msg.type === "tool" && "artifact" in msg && msg.name === "request_vehicle_deletion" && msg.artifact) {
          yield { type: "confirm_delete", ...(msg.artifact as DeletionRequest) };
        }
      }
    }
  }
}

// Controller del chat: HTTP <-> agente, respondiendo con Server-Sent Events (SSE).
// En vez de un JSON al final, la respuesta queda ABIERTA y se van escribiendo eventos:
//
//   event: tool    data: {"type":"tool","name":"search_vehicles","args":{...}}
//   event: token   data: {"type":"token","text":"Encontré "}
//   event: token   data: {"type":"token","text":"3 SUVs"}
//   event: done    data: {}
//
// Cada evento termina con una linea en blanco (\n\n). Asi el front muestra el texto a medida que el
// modelo lo genera, en vez de esperar todo el loop (LLM -> tool -> LLM).
import { Request, Response } from "express";
import { streamAgent } from "../agent/agent.js";
import { ChatInput } from "../schemas/agent.schema.js";

function sendEvent(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// 429 = limite del plan gratuito de Groq (tokens por minuto): se resuelve esperando unos segundos.
function errorMessage(error: unknown): string {
  const status = (error as { status?: unknown })?.status;
  if (status === 429) {
    return "El asesor recibió muchas consultas seguidas (límite del plan gratuito). Esperá unos segundos y probá de nuevo.";
  }
  return "El asesor no pudo responder. Probá de nuevo en unos segundos.";
}

export async function chat(req: Request<{}, {}, ChatInput>, res: Response): Promise<void> {
  const startedAt = Date.now();

  // Si el usuario cancela o cierra la pestaña, se corta el agente (y la llamada a Groq).
  const abort = new AbortController();
  res.on("close", () => abort.abort());

  // Headers SSE. A partir de aca el status ya es 200: los errores se mandan como evento, no como 500.
  // (Auth y validacion corren ANTES, en la ruta: esos si responden 401/400 con JSON normal.)
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform", // que ningun proxy guarde ni comprima la respuesta
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // proxies tipo nginx: mandar cada write al instante
  });
  res.flushHeaders();

  try {
    // El usuario sale de la SESION (authMiddleware), nunca del body: el cliente no puede decir "soy admin".
    const user = req.user!;
    const context = { user: { id: user.id, name: user.name, role: user.role ?? "user" } };

    for await (const event of streamAgent(req.body.message, req.body.history, context, abort.signal)) {
      if (event.type === "tool") console.log(`[agent] tool ${event.name} ${JSON.stringify(event.args)}`);
      sendEvent(res, event.type, event);
    }
    sendEvent(res, "done", {});
    console.log(`[agent] respuesta completa en ${Date.now() - startedAt} ms`);
  } catch (error) {
    // Si se aborto, el cliente ya no esta: no hay a quien avisarle.
    if (!abort.signal.aborted) {
      // El detalle queda en el log; al usuario se le muestra un mensaje claro.
      console.error("[agent] error:", error);
      sendEvent(res, "error", { message: errorMessage(error) });
    }
  } finally {
    res.end();
  }
}

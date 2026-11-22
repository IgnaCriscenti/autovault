// El modelo (el "cerebro" del agente). ChatGroq habla con la API de Groq.
// temperature 0: respuestas deterministas, lo que queremos para elegir bien las tools.
// streaming: true -> Groq manda la respuesta token por token en vez de toda junta al final.
import { ChatGroq } from "@langchain/groq";
import { requireEnv } from "../lib/require-env.js";

// El mas barato de Groq con tool calling y disponible en el plan gratuito.
// Se puede cambiar con GROQ_MODEL sin tocar codigo.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export const llm = new ChatGroq({
  apiKey: requireEnv("GROQ_API_KEY"),
  model: MODEL,
  temperature: 0,
  streaming: true,
});

console.log(`[agent] Groq listo: model=${MODEL}`);

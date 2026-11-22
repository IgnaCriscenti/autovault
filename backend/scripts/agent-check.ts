// Prueba las tools del agente SIN Groq: un modelo falso "decide" que tools llamar.
// Sirve para verificar tools + permisos + Mongo sin gastar cuota. Correr: npm run agent:check
// Solo LEE la base: las pruebas de escritura usan un usuario que no es dueño (deben ser rechazadas).
import "dotenv/config";
import "../src/config/dns.js";
import assert from "node:assert/strict";
import { createAgent, FakeToolCallingModel, type ToolMessage } from "langchain";
import { connectMongoDB, disconnectMongoDB } from "../src/config/db.js";
import { tools } from "../src/agent/tools/index.js";
import { AgentContext, agentContextSchema } from "../src/agent/context.js";
import Vehicle from "../src/models/Vehicle.js";

type ToolCall = { name: string; args: Record<string, unknown> };

// Corre el agente con un modelo falso que pide `toolCalls` y devuelve los ToolMessage.
async function runToolMessages(toolCalls: ToolCall[], context: AgentContext) {
  // Turno 1: pide las tools. Turno 2: sin tool calls -> el agente termina.
  const model = new FakeToolCallingModel({ toolCalls: [toolCalls.map((c, i) => ({ ...c, id: `call_${i}` })), []] });
  const agent = createAgent({ model, tools, contextSchema: agentContextSchema });
  const { messages } = await agent.invoke({ messages: [{ role: "user", content: "check" }] }, { context });
  return messages.filter((m) => m.type === "tool") as ToolMessage[];
}

// Lo mismo, pero solo los textos (lo que lee el modelo).
const runWithFakeModel = async (toolCalls: ToolCall[], context: AgentContext) =>
  (await runToolMessages(toolCalls, context)).map((m) => m.text);

// Un usuario que no publico nada (id que no existe en la base).
const stranger: AgentContext = { user: { id: "000000000000000000000000", name: "Test", role: "user" } };

await connectMongoDB();
try {
  // 1. Busqueda con filtros (y otros en null, como los manda gpt-oss): los null se ignoran.
  const [searchResult] = await runWithFakeModel(
    [{ name: "search_vehicles", args: { bodyType: "suv", maxPrice: 100000, brand: null, search: "", has3d: null } }],
    stranger
  );
  const search = JSON.parse(searchResult);
  assert.equal(typeof search.total, "number");
  assert.ok(search.vehicles.every((v: { body: string }) => v.body === "SUV"), "solo deberia traer SUVs");
  console.log(`[agent-check] OK: search_vehicles encontró ${search.total} SUVs de hasta US$ 100.000`);

  // 2. Filtros contradictorios: la tool devuelve el error como texto (no rompe el agente).
  const [invalid] = await runWithFakeModel([{ name: "search_vehicles", args: { minPrice: 50000, maxPrice: 1000 } }], stranger);
  assert.ok(invalid.startsWith("Filtros inválidos"), invalid);
  console.log("[agent-check] OK: filtros inválidos vuelven como texto");

  // 3. Permisos: alguien que no es dueño ni admin NO puede modificar ni eliminar.
  const vehicle = await Vehicle.findOne().lean();
  assert.ok(vehicle, "la base deberia tener vehiculos (correr npm run seed)");
  const id = vehicle._id.toString();
  const denied = await runWithFakeModel(
    [
      { name: "set_vehicle_availability", args: { id, available: !vehicle.available } },
      { name: "request_vehicle_deletion", args: { id } },
    ],
    stranger
  );
  assert.ok(denied.every((r) => r.startsWith("Permiso denegado")), "un usuario que no es dueño no deberia poder modificar");
  const after = await Vehicle.findById(id).lean();
  assert.equal(after?.available, vehicle.available, "el vehiculo no deberia haber cambiado");
  console.log("[agent-check] OK: un usuario que no es dueño no puede modificar ni eliminar");

  // 3 bis. Eliminar lo decide el humano: aun siendo el dueño, la tool NO borra, solo pide confirmacion
  // (el artifact es lo que el front usa para mostrar el cartel "¿Eliminar...? Sí / No").
  const owner: AgentContext = { user: { id: vehicle.owner, name: "Dueño", role: "user" } };
  const [request] = await runToolMessages([{ name: "request_vehicle_deletion", args: { id } }], owner);
  assert.deepEqual(request.artifact, { vehicleId: id, vehicle: `${vehicle.brand} ${vehicle.model} ${vehicle.year}` });
  assert.ok(await Vehicle.exists({ _id: id }), "la tool no deberia eliminar: la decision es del usuario");
  console.log("[agent-check] OK: request_vehicle_deletion pide confirmación y no elimina");

  // 4. "Mis publicaciones" usa el usuario del contexto, no algo que mande el modelo.
  const [mine] = await runWithFakeModel([{ name: "list_my_vehicles", args: {} }], stranger);
  assert.equal(JSON.parse(mine).total, 0);
  console.log("[agent-check] OK: list_my_vehicles solo trae las del usuario logueado");
} finally {
  await disconnectMongoDB();
}

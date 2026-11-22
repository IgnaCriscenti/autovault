// Tools de vehiculos (las "manos" del agente).
// Una tool = funcion + nombre + descripcion + schema Zod. El LLM NO ejecuta nada: lee la descripcion,
// decide llamarla y devuelve los argumentos; LangChain los valida con Zod y ejecuta la funcion.
// Cada tool es un "controller cuyo cliente es el LLM": no tiene logica de negocio, llama al MISMO
// service que usa la API REST. Las de escritura chequean permisos ADENTRO de la tool (dueño o admin),
// igual que requireVehicleOwnerOrAdmin en la API.
import { tool, type ToolRuntime } from "langchain";
import { z } from "zod";
import { Types, isValidObjectId } from "mongoose";
import * as vehiclesService from "../../services/vehicles.service.js";
import { ALLOWED_SORT_FIELDS, listVehiclesSchema } from "../../schemas/vehicle.schema.js";
import { IVehicle } from "../../models/Vehicle.js";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from "../../constants/vehicle.js";
import { AgentContext, canModifyVehicle } from "../context.js";
import { BODY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "../labels.js";
import { withoutNulls } from "./without-nulls.js";

// Pocos resultados por llamada: cada vehiculo son tokens que el modelo lee (y que gastan la cuota).
const MAX_RESULTS = 10;

const FORBIDDEN = "Permiso denegado: solo el usuario que publicó el vehículo o un administrador pueden modificarlo.";
const NOT_FOUND = "No existe un vehículo con ese id.";
const INVALID_ID = "El id no es válido.";

type VehicleLike = IVehicle & { _id: Types.ObjectId; ownerName?: string };

// Numeros con punto de miles (38.000), como se escriben en Argentina.
const thousands = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

// Solo lo que el modelo necesita, con los valores ya en español y formateados (menos instrucciones
// en el prompt y el modelo no tiene que formatear: lo copia tal cual).
// link: la ruta del detalle en el front, para que el modelo la ponga como link en la respuesta.
function toPublic(v: VehicleLike) {
  const id = v._id.toString();
  return {
    id,
    vehicle: `${v.brand} ${v.model} ${v.year}`,
    //   = espacio que no corta linea: "US$ 42.000" no se parte en dos renglones en las tablas.
    price: `US$ ${thousands.format(v.price)}`,
    mileage: `${thousands.format(v.mileage)} km`,
    fuel: FUEL_LABELS[v.fuelType],
    transmission: TRANSMISSION_LABELS[v.transmission],
    body: BODY_LABELS[v.bodyType],
    color: v.color || undefined,
    available: v.available,
    has3d: Boolean(v.sketchfabModelId),
    publishedBy: v.ownerName,
    link: `/vehicles/${id}`,
  };
}

// Los booleanos de la API llegan como query string ("true"/"false"): se convierten para reusar el schema.
const toQueryBoolean = (value: boolean | undefined) => (value === undefined ? undefined : String(value));

// Mensaje de Zod legible para el modelo (ej: "El precio mínimo no puede ser mayor al máximo").
const zodMessage = (error: z.ZodError) => error.issues.map((issue) => issue.message).join("; ");

// ── Lectura ──────────────────────────────────────────────────────────────────────────────────

export const searchVehiclesTool = tool(
  async (args) => {
    console.log(`[agent tool] search_vehicles args: ${JSON.stringify(args)}`);
    const { available, has3d, ...rest } = withoutNulls(args);
    // listVehiclesSchema es el MISMO de GET /vehicles: completa page y orden con sus defaults.
    const parsed = listVehiclesSchema.safeParse({
      ...rest,
      available: toQueryBoolean(available),
      has3d: toQueryBoolean(has3d),
      limit: MAX_RESULTS,
    });
    if (!parsed.success) return `Filtros inválidos: ${zodMessage(parsed.error)}`;

    const { data, meta } = await vehiclesService.listVehicles(parsed.data);
    console.log(`[agent tool] search_vehicles -> ${data.length} de ${meta.total} vehículos`);
    return JSON.stringify({ total: meta.total, shown: data.length, vehicles: data.map(toPublic) });
  },
  {
    name: "search_vehicles",
    description:
      "Busca vehículos en el catálogo de la concesionaria. Todos los filtros son opcionales y se combinan. " +
      `Devuelve el total de coincidencias y hasta ${MAX_RESULTS} resultados. Precios en dólares (USD).`,
    // .nullish(): el modelo puede mandar null en los filtros que no usa (ver without-nulls.ts).
    schema: z.object({
      search: z
        .string()
        .max(100)
        .nullish()
        .describe("Palabras a buscar en marca, modelo, color o descripción. Ej: 'hilux', 'rojo', 'techo solar'"),
      brand: z.string().max(50).nullish().describe("Marca exacta. Ej: 'Toyota'"),
      fuelType: z
        .enum(FUEL_TYPES)
        .nullish()
        .describe("gasoline = nafta, diesel, cng = GNC, hybrid = híbrido, electric = eléctrico"),
      transmission: z.enum(TRANSMISSIONS).nullish().describe("manual o automatic (automática)"),
      bodyType: z
        .enum(BODY_TYPES)
        .nullish()
        .describe("sedan, hatchback, suv, pickup (camioneta), coupe, van (utilitario)"),
      minPrice: z.number().min(0).nullish().describe("Precio mínimo en USD"),
      maxPrice: z.number().min(0).nullish().describe("Precio máximo en USD"),
      minYear: z.number().int().nullish().describe("Año mínimo del modelo"),
      maxYear: z.number().int().nullish().describe("Año máximo del modelo"),
      available: z.boolean().nullish().describe("true = solo disponibles para la venta, false = solo vendidos/reservados"),
      has3d: z.boolean().nullish().describe("true = solo los que tienen vista 3D interactiva"),
      sortBy: z.enum(ALLOWED_SORT_FIELDS).nullish().describe("Campo para ordenar. Por defecto, los más recientes"),
      sortOrder: z.enum(["asc", "desc"]).nullish().describe("asc = de menor a mayor, desc = de mayor a menor"),
    }),
  }
);

export const getVehicleDetailTool = tool(
  async ({ id }) => {
    console.log(`[agent tool] get_vehicle_detail id=${id}`);
    if (!isValidObjectId(id)) return INVALID_ID;

    const vehicle = await vehiclesService.getVehicleDetail(id);
    if (!vehicle) return NOT_FOUND;
    return JSON.stringify({
      ...toPublic(vehicle),
      description: vehicle.description || undefined,
      listedAt: vehicle.listedAt.toISOString().slice(0, 10),
    });
  },
  {
    name: "get_vehicle_detail",
    description:
      "Trae el detalle completo de un vehículo (incluye la descripción). Usala cuando pregunten por uno " +
      "en particular; el id se obtiene antes con search_vehicles o list_my_vehicles.",
    schema: z.object({ id: z.string().describe("El id del vehículo (24 caracteres hexadecimales)") }),
  }
);

export const listBrandsTool = tool(
  async () => {
    console.log("[agent tool] list_brands");
    return JSON.stringify(await vehiclesService.listBrands());
  },
  {
    name: "list_brands",
    description: "Lista las marcas que hay en el catálogo.",
    schema: z.object({}),
  }
);

// runtime.context = { user } que armo el controller con la sesion (ver agent/context.ts).
export const listMyVehiclesTool = tool(
  async (_args, runtime: ToolRuntime<unknown, AgentContext>) => {
    const userId = runtime.context.user.id;
    console.log(`[agent tool] list_my_vehicles user=${userId}`);
    const input = listVehiclesSchema.parse({ limit: 50 });
    const { data, meta } = await vehiclesService.listVehicles(input, userId);
    return JSON.stringify({ total: meta.total, shown: data.length, vehicles: data.map(toPublic) });
  },
  {
    name: "list_my_vehicles",
    description: "Lista los vehículos que publicó el usuario que está chateando (sus publicaciones).",
    schema: z.object({}),
  }
);

// ── Escritura ────────────────────────────────────────────────────────────────────────────────
// Los errores se DEVUELVEN como texto (no se tiran): asi el LLM los lee y le explica al usuario
// que paso, en vez de cortar todo el agente.

export const setVehicleAvailabilityTool = tool(
  async ({ id, available }, runtime: ToolRuntime<unknown, AgentContext>) => {
    console.log(`[agent tool] set_vehicle_availability id=${id} available=${available} por ${runtime.context.user.id}`);
    if (!isValidObjectId(id)) return INVALID_ID;

    const vehicle = await vehiclesService.findVehicleById(id);
    if (!vehicle) return NOT_FOUND;
    if (!canModifyVehicle(vehicle.owner, runtime.context)) return FORBIDDEN;

    const updated = await vehiclesService.updateVehicle(id, { available });
    if (!updated) return NOT_FOUND;
    const state = available ? "disponible" : "no disponible (vendido o reservado)";
    return `Listo: ${updated.brand} ${updated.model} ${updated.year} quedó como ${state}.`;
  },
  {
    name: "set_vehicle_availability",
    description:
      "Marca un vehículo como disponible o como no disponible (vendido/reservado). Usala SOLO si el usuario " +
      "lo pide explícitamente. Primero buscá el vehículo para obtener el id; si hay más de uno que coincide, " +
      "no lo modifiques: mostrá las opciones y pedí que aclare cuál.",
    schema: z.object({
      id: z.string().describe("El id del vehículo"),
      available: z.boolean().describe("true = disponible, false = vendido o reservado"),
    }),
  }
);

// Eliminar NO se puede deshacer: la decision es del humano, no del modelo.
// Esta tool NO elimina: verifica que exista y que el usuario pueda borrarlo, y le pide al front que
// muestre un cartel "¿Eliminar...? Sí / No". Si el usuario confirma, el FRONT llama a
// DELETE /api/v1/vehicles/:id (la misma API, con los mismos permisos que "Mis publicaciones").
//
// responseFormat "content_and_artifact": la tool devuelve [texto, artifact].
//   - el texto lo lee el modelo (para explicarle al usuario que tiene que confirmar)
//   - el artifact NO lo ve el modelo: el agente lo reenvia al front como evento SSE "confirm_delete"
export type DeletionRequest = { vehicleId: string; vehicle: string };

export const requestVehicleDeletionTool = tool(
  async ({ id }, runtime: ToolRuntime<unknown, AgentContext>): Promise<[string, DeletionRequest | null]> => {
    console.log(`[agent tool] request_vehicle_deletion id=${id} por ${runtime.context.user.id}`);
    if (!isValidObjectId(id)) return [INVALID_ID, null];

    const vehicle = await vehiclesService.findVehicleById(id);
    if (!vehicle) return [NOT_FOUND, null];
    if (!canModifyVehicle(vehicle.owner, runtime.context)) return [FORBIDDEN, null];

    const name = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    return [
      `Cartel de confirmación abierto en la pantalla del usuario. Todavía NO se eliminó: decide el usuario. ` +
        `Respondé solo esta línea: "Te abrí un cartel para que confirmes si querés eliminar ${name}."`,
      { vehicleId: id, vehicle: name },
    ];
  },
  {
    name: "request_vehicle_deletion",
    description:
      "Pide al usuario que confirme en pantalla la eliminación de una publicación (no la elimina: decide el " +
      "usuario con Sí / No). Usala SOLO si el usuario pide explícitamente eliminar/borrar una publicación. " +
      "Primero buscá el vehículo para obtener el id; si hay más de uno que coincide, no la llames: mostrá " +
      "las opciones y pedí que aclare cuál.",
    schema: z.object({ id: z.string().describe("El id del vehículo a eliminar") }),
    responseFormat: "content_and_artifact",
  }
);

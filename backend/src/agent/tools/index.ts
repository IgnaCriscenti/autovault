// Junta todas las tools. Para darle una capacidad nueva al agente: crear la tool y sumarla aca.
// Lo que NO esta en esta lista, el modelo no lo puede hacer (ej: crear vehiculos, cambiar precios
// o eliminar por su cuenta: para eliminar solo puede PEDIR la confirmacion del usuario).
import {
  searchVehiclesTool,
  getVehicleDetailTool,
  listBrandsTool,
  listMyVehiclesTool,
  setVehicleAvailabilityTool,
  requestVehicleDeletionTool,
} from "./vehicles.tools.js";

export const tools = [
  searchVehiclesTool,
  getVehicleDetailTool,
  listBrandsTool,
  listMyVehiclesTool,
  setVehicleAvailabilityTool,
  requestVehicleDeletionTool,
];

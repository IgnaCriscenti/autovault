// Controller = capa HTTP: lee req, llama al service y traduce el resultado a status + JSON.
// Los ids y bodies ya llegan validados por los middlewares de la ruta.
import { Request, Response } from "express";
import * as vehiclesService from "../services/vehicles.service.js";
import { CreateVehicleInput, ListVehiclesInput, UpdateVehicleInput } from "../schemas/vehicle.schema.js";

const NOT_FOUND = { error: { message: "Vehiculo no encontrado" } };

// Errores de validacion de Mongoose (ej: un enum invalido que se escapo de Zod) -> 400, el resto -> 500.
function handleError(res: Response, error: unknown, action: string): void {
  if (error instanceof Error && error.name === "ValidationError") {
    res.status(400).json({ error: { message: error.message } });
    return;
  }
  console.error(`[vehicles] error ${action}:`, error);
  res.status(500).json({ error: { message: `No se pudo ${action} el vehiculo` } });
}

// GET /api/v1/vehicles
export async function listVehicles(_req: Request, res: Response): Promise<void> {
  try {
    const query = res.locals.query as ListVehiclesInput;
    res.status(200).json(await vehiclesService.listVehicles(query));
  } catch (error) {
    handleError(res, error, "listar");
  }
}

// GET /api/v1/vehicles/brands
export async function listBrands(_req: Request, res: Response): Promise<void> {
  try {
    res.status(200).json(await vehiclesService.listBrands());
  } catch (error) {
    console.error("[vehicles] error listing brands:", error);
    res.status(500).json({ error: { message: "No se pudieron obtener las marcas" } });
  }
}

// GET /api/v1/vehicles/:id
export async function getVehicleById(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const vehicle = await vehiclesService.findVehicleById(req.params.id);
    if (!vehicle) {
      res.status(404).json(NOT_FOUND);
      return;
    }
    res.status(200).json(vehicle);
  } catch (error) {
    handleError(res, error, "obtener");
  }
}

// POST /api/v1/vehicles
export async function createVehicle(req: Request<{}, {}, CreateVehicleInput>, res: Response): Promise<void> {
  try {
    res.status(201).json(await vehiclesService.createVehicle(req.body));
  } catch (error) {
    handleError(res, error, "crear");
  }
}

// PUT / PATCH /api/v1/vehicles/:id
export async function updateVehicle(
  req: Request<{ id: string }, {}, UpdateVehicleInput>,
  res: Response
): Promise<void> {
  try {
    const vehicle = await vehiclesService.updateVehicle(req.params.id, req.body);
    if (!vehicle) {
      res.status(404).json(NOT_FOUND);
      return;
    }
    res.status(200).json(vehicle);
  } catch (error) {
    handleError(res, error, "actualizar");
  }
}

// DELETE /api/v1/vehicles/:id
export async function deleteVehicle(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const vehicle = await vehiclesService.deleteVehicle(req.params.id);
    if (!vehicle) {
      res.status(404).json(NOT_FOUND);
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "eliminar");
  }
}

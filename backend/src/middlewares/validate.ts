// Middlewares genericos de validacion: reciben un schema de Zod y responden 400 con errores claros.
import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { z, ZodType } from "zod";

function sendValidationError(res: Response, error: z.ZodError): void {
  const { formErrors, fieldErrors } = z.flattenError(error);
  res.status(400).json({
    error: {
      message: formErrors[0] ?? "Los datos enviados no son válidos",
      details: fieldErrors, // ej: { price: ["El precio debe ser mayor a 0"] }
    },
  });
}

// Valida req.body y lo reemplaza por la version parseada (con trims, defaults y coerciones).
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) return sendValidationError(res, result.error);
    req.body = result.data;
    next();
  };
}

// Valida req.query. En Express 5 req.query es de solo lectura: el resultado va a res.locals.query.
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) return sendValidationError(res, result.error);
    res.locals.query = result.data;
    next();
  };
}

// 400 si el :id de la URL no es un ObjectId de Mongo (evita un CastError -> 500).
export function validateObjectId(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: { message: "El id enviado no es válido" } });
    return;
  }
  next();
}

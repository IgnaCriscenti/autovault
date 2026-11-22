import { Schema, model, HydratedDocument, Model } from "mongoose";
import {
  BODY_TYPES,
  FUEL_TYPES,
  MIN_YEAR,
  TRANSMISSIONS,
  type BodyType,
  type FuelType,
  type Transmission,
} from "../constants/vehicle.js";

export interface IVehicle {
  brand: string;
  model: string;
  year: number;
  price: number; // en USD
  mileage: number; // en km
  fuelType: FuelType;
  transmission: Transmission;
  bodyType: BodyType;
  color?: string;
  description?: string;
  imageUrl?: string;
  available: boolean;
  listedAt: Date;
  owner: string; // id (Better Auth) del usuario que publico el vehiculo
}

// HydratedDocument en vez de `extends Document`: el campo `model` choca con una propiedad
// interna de Document de Mongoose si se extiende la interfaz.
export type IVehicleDocument = HydratedDocument<IVehicle>;

const vehicleSchema = new Schema<IVehicle>(
  {
    brand: { type: String, required: true, trim: true, maxlength: 50 },
    model: { type: String, required: true, trim: true, maxlength: 80 },
    year: { type: Number, required: true, min: MIN_YEAR },
    price: { type: Number, required: true, min: 0 },
    mileage: { type: Number, required: true, min: 0, default: 0 },
    fuelType: { type: String, required: true, enum: FUEL_TYPES },
    transmission: { type: String, required: true, enum: TRANSMISSIONS },
    bodyType: { type: String, required: true, enum: BODY_TYPES },
    color: { type: String, trim: true, maxlength: 30 },
    description: { type: String, trim: true, maxlength: 2000 },
    imageUrl: { type: String, trim: true },
    available: { type: Boolean, default: true },
    listedAt: { type: Date, default: () => new Date() },
    // Se asigna SIEMPRE desde la sesion en el backend (nunca desde el body). Indexado para "mis publicaciones".
    owner: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const Vehicle: Model<IVehicle> = model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;

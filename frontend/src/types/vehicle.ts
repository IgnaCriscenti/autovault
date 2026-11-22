export const FUEL_TYPES = ["gasoline", "diesel", "cng", "hybrid", "electric"] as const;
export const TRANSMISSIONS = ["manual", "automatic"] as const;
export const BODY_TYPES = ["sedan", "hatchback", "suv", "pickup", "coupe", "van"] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BodyType = (typeof BODY_TYPES)[number];

export interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  bodyType: BodyType;
  color?: string;
  description?: string;
  imageUrl?: string;
  available: boolean;
  listedAt: string;
  owner: string; // id del usuario que lo publico
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

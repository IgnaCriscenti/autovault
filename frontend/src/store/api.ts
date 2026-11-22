// RTK Query: estado del SERVIDOR (vehiculos). Cada endpoint genera un hook con cache incluida.
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, getErrorMessage } from "../lib/api";
import type { BodyType, FuelType, Paginated, Transmission, Vehicle } from "../types/vehicle";
import type { VehicleFormValues } from "../schemas/vehicle.schema";

// Query params de GET /vehicles. Los undefined no se mandan (axios los omite).
export interface VehiclesQuery {
  page?: number;
  limit?: number;
  sortBy?: "listedAt" | "price" | "year" | "mileage" | "brand";
  sortOrder?: "asc" | "desc";
  search?: string;
  brand?: string;
  bodyType?: BodyType;
  fuelType?: FuelType;
  transmission?: Transmission;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  available?: boolean;
  has3d?: boolean;
}

// Usa la instancia de axios compartida. El error se guarda ya como string, listo para mostrar.
const axiosBaseQuery: BaseQueryFn<AxiosRequestConfig, unknown, string> = async (config) => {
  try {
    const { data } = await http.request(config);
    return { data };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
};

export const vehiclesApi = createApi({
  reducerPath: "vehiclesApi",
  baseQuery: axiosBaseQuery,
  // Las queries "proveen" el tag y las mutations lo "invalidan" -> RTK Query vuelve a pedir solo.
  tagTypes: ["Vehicles"],
  endpoints: (build) => ({
    getVehicles: build.query<Paginated<Vehicle>, VehiclesQuery>({
      query: (params) => ({ url: "/vehicles", params }),
      providesTags: ["Vehicles"],
    }),
    // Publicaciones del usuario logueado (requiere sesion).
    getMyVehicles: build.query<Paginated<Vehicle>, VehiclesQuery>({
      query: (params) => ({ url: "/vehicles/mine", params }),
      providesTags: ["Vehicles"],
    }),
    getBrands: build.query<string[], void>({
      query: () => ({ url: "/vehicles/brands" }),
      providesTags: ["Vehicles"],
    }),
    getVehicleById: build.query<Vehicle, string>({
      query: (id) => ({ url: `/vehicles/${id}` }),
      providesTags: ["Vehicles"],
    }),
    createVehicle: build.mutation<Vehicle, VehicleFormValues>({
      query: (data) => ({ url: "/vehicles", method: "POST", data }),
      invalidatesTags: ["Vehicles"],
    }),
    updateVehicle: build.mutation<Vehicle, { id: string; values: VehicleFormValues }>({
      query: ({ id, values }) => ({ url: `/vehicles/${id}`, method: "PUT", data: values }),
      invalidatesTags: ["Vehicles"],
    }),
    deleteVehicle: build.mutation<void, string>({
      query: (id) => ({ url: `/vehicles/${id}`, method: "DELETE" }),
      invalidatesTags: ["Vehicles"],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetMyVehiclesQuery,
  useGetBrandsQuery,
  useGetVehicleByIdQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehiclesApi;

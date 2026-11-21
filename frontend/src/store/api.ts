// RTK Query: estado del SERVIDOR (vehiculos). Cada endpoint genera un hook con cache incluida.
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, getErrorMessage } from "../lib/api";
import type { Paginated, Vehicle } from "../types/vehicle";

export interface VehiclesQuery {
  page?: number;
  limit?: number;
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
    getVehicleById: build.query<Vehicle, string>({
      query: (id) => ({ url: `/vehicles/${id}` }),
      providesTags: ["Vehicles"],
    }),
  }),
});

export const { useGetVehiclesQuery, useGetVehicleByIdQuery } = vehiclesApi;

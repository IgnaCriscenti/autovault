// RTK Query para la gestion de usuarios (solo admin). En vez de axios usa el cliente de Better Auth
// (plugin admin): cada endpoint tiene un queryFn que llama a authClient.admin.*.
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { authClient } from "../lib/auth-client";
import type { UserRole } from "../types/auth";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  createdAt: string; // ISO (en el store solo van valores serializables, no Date)
}

export interface UsersQuery {
  page: number;
  limit: number;
  search?: string;
  searchField?: "email" | "name";
}

export interface UsersPage {
  users: AdminUser[];
  total: number;
  totalPages: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

type BetterAuthError = { message?: string; status?: number } | null;

const errorMessage = (error: BetterAuthError, fallback: string): string => {
  if (error?.status === 403) return "No tenes permisos para gestionar usuarios";
  return error?.message ?? fallback;
};

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fakeBaseQuery<string>(),
  tagTypes: ["Users"],
  endpoints: (build) => ({
    listUsers: build.query<UsersPage, UsersQuery>({
      queryFn: async ({ page, limit, search, searchField = "email" }) => {
        const { data, error } = await authClient.admin.listUsers({
          query: {
            limit,
            offset: (page - 1) * limit,
            sortBy: "createdAt",
            sortDirection: "desc",
            ...(search && { searchValue: search, searchField, searchOperator: "contains" as const }),
          },
        });
        if (error || !data) return { error: errorMessage(error, "No se pudieron cargar los usuarios") };

        const users: AdminUser[] = data.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role === "admin" ? "admin" : "user") as UserRole,
          image: u.image,
          createdAt: new Date(u.createdAt).toISOString(),
        }));
        return { data: { users, total: data.total, totalPages: Math.ceil(data.total / limit) } };
      },
      providesTags: ["Users"],
    }),

    setRole: build.mutation<void, { userId: string; role: UserRole }>({
      queryFn: async ({ userId, role }) => {
        const { error } = await authClient.admin.setRole({ userId, role });
        return error ? { error: errorMessage(error, "No se pudo cambiar el rol") } : { data: undefined };
      },
      invalidatesTags: ["Users"],
    }),

    createUser: build.mutation<void, CreateUserInput>({
      queryFn: async (input) => {
        const { error } = await authClient.admin.createUser(input);
        if (!error) return { data: undefined };
        const exists = error.message?.toLowerCase().includes("already exists");
        return { error: exists ? "Ya existe un usuario con ese email" : errorMessage(error, "No se pudo crear el usuario") };
      },
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useListUsersQuery, useSetRoleMutation, useCreateUserMutation } = usersApi;

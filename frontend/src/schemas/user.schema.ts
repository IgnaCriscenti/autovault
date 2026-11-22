import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres" }).max(80),
  email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
  password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }).max(128),
  role: z.enum(["user", "admin"], { error: "Elegi un rol" }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const emptyUser: CreateUserFormValues = { name: "", email: "", password: "", role: "user" };

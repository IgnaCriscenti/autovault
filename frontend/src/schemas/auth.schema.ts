import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres" }).max(80),
    email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
    // Better Auth exige minimo 8 caracteres.
    password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }).max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Crea el usuario (siempre con rol "user") y Better Auth abre la sesión en el mismo paso.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router";
import { Loader2Icon } from "lucide-react";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";
import { signUp, useSession } from "../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/Field";
import { AuthCard, Divider } from "../components/auth/AuthCard";
import { SocialButtons } from "../components/auth/SocialButtons";

export const Register = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  if (session && !isSubmitting) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async ({ name, email, password }: RegisterFormValues) => {
    const { error } = await signUp.email({ name, email, password });
    if (error) {
      setError("root.server", {
        message:
          error.code === "USER_ALREADY_EXISTS" || error.status === 422
            ? "Ya existe una cuenta con ese email"
            : (error.message ?? "No se pudo crear la cuenta"),
      });
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <AuthCard title="Crear cuenta" description="Registrate gratis para publicar tu auto.">
      <SocialButtons callbackURL="/" />
      <Divider label="o con tu email" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Field label="Nombre" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Field label="Email" type="email" autoComplete="email" placeholder="vos@email.com" error={errors.email?.message} {...register("email")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres"
            error={errors.password?.message}
            {...register("password")}
          />
          <Field
            label="Repetir contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>
        <FormError message={errors.root?.server?.message} />
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-10">
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Ingresar
        </Link>
      </p>
    </AuthCard>
  );
};

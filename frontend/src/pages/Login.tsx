import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { Loader2Icon } from "lucide-react";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { signIn, useSession } from "../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/Field";
import { AuthCard, Divider } from "../components/auth/AuthCard";
import { SocialButtons } from "../components/auth/SocialButtons";

export const Login = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // A dónde volver después del login (lo deja ProtectedRoute en el state).
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  const oauthError = new URLSearchParams(location.search).get("error");

  if (session && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    // Better Auth no tira excepción: devuelve { data, error }. Si sale bien setea la cookie.
    const { error } = await signIn.email(credentials);
    if (error) {
      setError("root.server", {
        message: error.status === 401 ? "Email o contraseña incorrectos" : (error.message ?? "No se pudo iniciar sesión"),
      });
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <AuthCard title="Iniciar sesión" description="Bienvenido de nuevo. Ingresá para gestionar tus publicaciones.">
      {oauthError && (
        <FormError
          message={
            oauthError === "account_not_linked"
              ? "Ya existe una cuenta con ese email. Ingresá con tu contraseña."
              : "No se pudo iniciar sesión con el proveedor externo."
          }
        />
      )}
      <SocialButtons callbackURL={from} />
      <Divider label="o con tu email" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Field label="Email" type="email" autoComplete="email" placeholder="vos@email.com" error={errors.email?.message} {...register("email")} />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormError message={errors.root?.server?.message} />
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-10">
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </AuthCard>
  );
};

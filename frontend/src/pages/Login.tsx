import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { signIn, useSession } from "../lib/auth-client";
import { Field, FormError } from "../components/ui/Field";
import { AuthCard, Divider, primaryButton } from "../components/auth/AuthCard";
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

  // A donde volver despues del login (lo deja ProtectedRoute en el state).
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  const oauthError = new URLSearchParams(location.search).get("error");

  if (session && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    // Better Auth no tira excepcion: devuelve { data, error }. Si sale bien setea la cookie.
    const { error } = await signIn.email(credentials);
    if (error) {
      setError("root.server", {
        message: error.status === 401 ? "Email o contraseña incorrectos" : (error.message ?? "No se pudo iniciar sesion"),
      });
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <AuthCard title="Iniciar sesion">
      {oauthError && (
        <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          {oauthError === "account_not_linked"
            ? "Ya existe una cuenta con ese email. Ingresa con tu contraseña."
            : "No se pudo iniciar sesion con el proveedor externo."}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormError message={errors.root?.server?.message} />
        <button type="submit" disabled={isSubmitting} className={primaryButton}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <Divider />
      <SocialButtons callbackURL={from} />
      <p className="mt-4 text-center text-sm text-slate-600">
        ¿No tenes cuenta?{" "}
        <Link to="/register" className="font-medium text-brand-700 underline">
          Crear cuenta
        </Link>
      </p>
    </AuthCard>
  );
};

// Alta de usuarios por el admin (authClient.admin.createUser), con React Hook Form + Zod.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, emptyUser, type CreateUserFormValues } from "../../schemas/user.schema";
import { useCreateUserMutation } from "../../store/usersApi";
import { getErrorMessage } from "../../lib/api";
import { Field, FieldWrapper, FormError, inputClass } from "../ui/Field";

export const CreateUserForm = ({ onCreated }: { onCreated: () => void }) => {
  const [createUser] = useCreateUserMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema), defaultValues: emptyUser });

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      await createUser(values).unwrap();
      reset(emptyUser);
      onCreated();
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">Nuevo usuario</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Nombre *" autoComplete="off" error={errors.name?.message} {...register("name")} />
        <Field label="Email *" type="email" autoComplete="off" error={errors.email?.message} {...register("email")} />
        <Field
          label="Contraseña *"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FieldWrapper label="Rol *" error={errors.role?.message}>
          <select className={inputClass} {...register("role")}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </FieldWrapper>
      </div>
      <FormError message={errors.root?.server?.message} />
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creando..." : "Crear usuario"}
        </button>
      </div>
    </form>
  );
};

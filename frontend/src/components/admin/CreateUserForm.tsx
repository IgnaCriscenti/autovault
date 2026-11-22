// Alta de usuarios por el admin (authClient.admin.createUser), con React Hook Form + Zod.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, UserPlusIcon } from "lucide-react";
import { createUserSchema, emptyUser, type CreateUserFormValues } from "../../schemas/user.schema";
import { useCreateUserMutation } from "../../store/usersApi";
import { getErrorMessage } from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldWrapper, FormError } from "@/components/ui/Field";

export const CreateUserForm = ({ onCreated }: { onCreated: (email: string) => void }) => {
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
      onCreated(values.email);
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <UserPlusIcon className="size-4 text-primary" /> Nuevo usuario
        </CardTitle>
        <CardDescription>La persona podrá ingresar con este email y contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Nombre *" autoComplete="off" error={errors.name?.message} {...register("name")} />
            <Field label="Email *" type="email" autoComplete="off" error={errors.email?.message} {...register("email")} />
            <Field
              label="Contraseña *"
              type="password"
              autoComplete="new-password"
              hint="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register("password")}
            />
            <FieldWrapper label="Rol *" error={errors.role?.message}>
              <NativeSelect className="w-full [&_select]:h-9 [&_select]:bg-background" {...register("role")}>
                <NativeSelectOption value="user">Usuario</NativeSelectOption>
                <NativeSelectOption value="admin">Administrador</NativeSelectOption>
              </NativeSelect>
            </FieldWrapper>
          </div>
          <FormError message={errors.root?.server?.message} />
          <div>
            <Button type="submit" size="lg" disabled={isSubmitting} className="h-10 px-5">
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {isSubmitting ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

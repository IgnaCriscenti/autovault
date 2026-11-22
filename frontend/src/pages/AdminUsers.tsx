// Ruta "/admin/users" (solo rol admin): listado de usuarios, cambio de rol (authClient.admin.setRole)
// y alta de usuarios. Un admin no puede cambiar su propio rol (también lo bloquea el backend).
import { useEffect, useState } from "react";
import { SearchIcon, ShieldCheckIcon, ShieldOffIcon, UserPlusIcon, UsersIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../lib/auth-client";
import { getErrorMessage } from "../lib/api";
import { formatDate } from "../lib/vehicle-format";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useListUsersQuery, useSetRoleMutation, type AdminUser } from "../store/usersApi";
import type { UserRole } from "../types/auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormError } from "@/components/ui/Field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminHeader } from "../components/admin/AdminHeader";
import { CreateUserForm } from "../components/admin/CreateUserForm";
import { UserAvatar } from "../components/layout/UserMenu";

const PAGE_SIZE = 10;
const ROLE_LABELS: Record<UserRole, string> = { user: "Usuario", admin: "Administrador" };

interface PendingRoleChange {
  user: AdminUser;
  role: UserRole;
}

export const AdminUsers = () => {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<"email" | "name">("email");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [pending, setPending] = useState<PendingRoleChange | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const { data, isLoading, isFetching, error } = useListUsersQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    searchField,
  });
  const [setRole, { isLoading: changingRole }] = useSetRoleMutation();
  const users = data?.users ?? [];

  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  const confirmRoleChange = async () => {
    if (!pending) return;
    const { user, role } = pending;
    setPending(null);
    try {
      await setRole({ userId: user.id, role }).unwrap();
      toast.success("Rol actualizado", { description: `${user.name} ahora es ${ROLE_LABELS[role].toLowerCase()}.` });
    } catch (err) {
      toast.error("No se pudo cambiar el rol", { description: getErrorMessage(err) });
    }
  };

  const promoting = pending?.role === "admin";

  return (
    <section className="flex flex-col gap-6">
      <AdminHeader description="Usuarios registrados y sus roles." />

      <div className="flex flex-wrap items-center gap-3">
        <NativeSelect
          aria-label="Buscar por"
          value={searchField}
          onChange={(e) => {
            setSearchField(e.target.value as "email" | "name");
            setPage(1);
          }}
          className="[&_select]:h-9 [&_select]:bg-background"
        >
          <NativeSelectOption value="email">Email</NativeSelectOption>
          <NativeSelectOption value="name">Nombre</NativeSelectOption>
        </NativeSelect>
        <div className="relative flex-1 sm:max-w-80">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchField === "email" ? "Buscar por email..." : "Buscar por nombre..."}
            aria-label="Buscar usuarios"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 bg-background pl-9"
          />
        </div>
        {data && (
          <Badge variant="secondary">
            <UsersIcon /> {data.total} usuarios
          </Badge>
        )}
        <Button
          variant={showCreate ? "outline" : "default"}
          size="lg"
          onClick={() => setShowCreate((v) => !v)}
          className="ml-auto"
        >
          {showCreate ? <XIcon /> : <UserPlusIcon />} {showCreate ? "Cerrar" : "Nuevo usuario"}
        </Button>
      </div>

      {showCreate && (
        <CreateUserForm
          onCreated={(email) => {
            setShowCreate(false);
            toast.success("Usuario creado", { description: `${email} ya puede ingresar.` });
          }}
        />
      )}

      {error && <FormError message={getErrorMessage(error)} />}

      <Card className={cn("py-0 transition-opacity", isFetching && !isLoading && "opacity-60")}>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="pl-4">Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead className="pr-4">Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4} className="px-4">
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {users.map((user) => {
              const isMe = user.id === session?.user.id;
              return (
                <TableRow key={user.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} className="size-8" />
                      <span className="font-medium">{user.name}</span>
                      {isMe && <Badge variant="secondary">Vos</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="pr-4">
                    <NativeSelect
                      aria-label={`Rol de ${user.name}`}
                      value={user.role}
                      disabled={isMe || changingRole}
                      title={isMe ? "No podés cambiar tu propio rol" : undefined}
                      onChange={(e) => setPending({ user, role: e.target.value as UserRole })}
                      size="sm"
                      className={cn(
                        "[&_select]:bg-background",
                        user.role === "admin" && "[&_select]:border-amber-300 [&_select]:font-semibold [&_select]:text-amber-800",
                      )}
                    >
                      <NativeSelectOption value="user">{ROLE_LABELS.user}</NativeSelectOption>
                      <NativeSelectOption value="admin">{ROLE_LABELS.admin}</NativeSelectOption>
                    </NativeSelect>
                  </TableCell>
                </TableRow>
              );
            })}

            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  No hay usuarios que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        destructive={!promoting}
        icon={promoting ? <ShieldCheckIcon /> : <ShieldOffIcon />}
        title={promoting ? "¿Dar permisos de administrador?" : "¿Quitar permisos de administrador?"}
        description={
          pending && (
            <>
              <strong className="text-foreground">{pending.user.name}</strong> ({pending.user.email}){" "}
              {promoting
                ? "va a poder editar y eliminar todas las publicaciones y gestionar usuarios."
                : "va a pasar a ser un usuario común: solo podrá gestionar sus propias publicaciones."}
            </>
          )
        }
        confirmLabel={promoting ? "Hacer administrador" : "Quitar permisos"}
        onConfirm={confirmRoleChange}
      />
    </section>
  );
};

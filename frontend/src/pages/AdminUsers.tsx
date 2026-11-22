// Ruta "/admin/users" (solo rol admin): listado de usuarios, cambio de rol (authClient.admin.setRole)
// y alta de usuarios. Un admin no puede cambiar su propio rol (tambien lo bloquea el backend).
import { useEffect, useState } from "react";
import { useSession } from "../lib/auth-client";
import { getErrorMessage } from "../lib/api";
import { formatDate } from "../lib/vehicle-format";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useListUsersQuery, useSetRoleMutation, type AdminUser } from "../store/usersApi";
import type { UserRole } from "../types/auth";
import { AdminTabs } from "../components/admin/AdminTabs";
import { CreateUserForm } from "../components/admin/CreateUserForm";
import { Pagination } from "../components/ui/Pagination";
import { inputClass } from "../components/ui/Field";

const PAGE_SIZE = 10;
const ROLE_LABELS: Record<UserRole, string> = { user: "Usuario", admin: "Administrador" };

const Avatar = ({ user }: { user: AdminUser }) =>
  user.image ? (
    <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
      {user.name.charAt(0).toUpperCase()}
    </span>
  );

export const AdminUsers = () => {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<"email" | "name">("email");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const { data, isLoading, isFetching, error } = useListUsersQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    searchField,
  });
  const [setRole, { error: roleError, isLoading: changingRole }] = useSetRoleMutation();
  const users = data?.users ?? [];

  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  const handleRoleChange = async (user: AdminUser, role: UserRole) => {
    const action = role === "admin" ? "darle permisos de administrador a" : "quitarle los permisos de administrador a";
    if (!window.confirm(`¿Seguro que queres ${action} ${user.name} (${user.email})?`)) return;
    const result = await setRole({ userId: user.id, role });
    if (!result.error) setNotice(`${user.name} ahora es ${ROLE_LABELS[role].toLowerCase()}.`);
  };

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Panel de administracion</h2>
        <p className="text-slate-500">Usuarios registrados y sus roles.</p>
      </div>
      <AdminTabs />

      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Buscar por"
          value={searchField}
          onChange={(e) => {
            setSearchField(e.target.value as "email" | "name");
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="email">Email</option>
          <option value="name">Nombre</option>
        </select>
        <input
          type="search"
          placeholder={searchField === "email" ? "Buscar por email..." : "Buscar por nombre..."}
          aria-label="Buscar usuarios"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={`${inputClass} flex-1 sm:max-w-80`}
        />
        <span className="text-sm text-slate-500">{data ? `${data.total} usuarios` : ""}</span>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="ml-auto rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          {showCreate ? "Cerrar" : "+ Nuevo usuario"}
        </button>
      </div>

      {showCreate && (
        <CreateUserForm
          onCreated={() => {
            setShowCreate(false);
            setNotice("Usuario creado correctamente.");
          }}
        />
      )}

      {notice && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </p>
      )}
      {(error || roleError) && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(error ?? roleError)}
        </p>
      )}

      <div
        className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Alta</th>
              <th className="px-4 py-3">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isMe = user.id === session?.user.id;
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <span className="font-medium">{user.name}</span>
                      {isMe && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">Vos</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Rol de ${user.name}`}
                      value={user.role}
                      disabled={isMe || changingRole}
                      title={isMe ? "No podes cambiar tu propio rol" : undefined}
                      onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                      className={`${inputClass} py-1 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                        user.role === "admin" ? "font-semibold text-amber-800" : ""
                      }`}
                    >
                      <option value="user">{ROLE_LABELS.user}</option>
                      <option value="admin">{ROLE_LABELS.admin}</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No hay usuarios que coincidan con la busqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
    </section>
  );
};

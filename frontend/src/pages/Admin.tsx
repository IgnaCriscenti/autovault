// Ruta "/admin" (solo rol admin): ABM de TODOS los vehículos.
import { AdminHeader } from "../components/admin/AdminHeader";
import { VehicleManager } from "../components/admin/VehicleManager";

export const Admin = () => (
  <section className="flex flex-col gap-6">
    <AdminHeader description="Alta, edición y baja de todas las publicaciones del catálogo." />
    <VehicleManager scope="all" emptyMessage="Todavía no hay vehículos cargados." />
  </section>
);

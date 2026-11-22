// Ruta "/admin" (solo rol admin): ABM de TODOS los vehiculos.
import { AdminTabs } from "../components/admin/AdminTabs";
import { VehicleManager } from "../components/admin/VehicleManager";

export const Admin = () => (
  <section className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-semibold">Panel de administracion</h2>
      <p className="text-slate-500">Alta, edicion y baja de todas las publicaciones del catalogo.</p>
    </div>
    <AdminTabs />
    <VehicleManager scope="all" emptyMessage="Todavia no hay vehiculos cargados." />
  </section>
);

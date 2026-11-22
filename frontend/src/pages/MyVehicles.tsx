// Ruta "/mis-publicaciones" (cualquier usuario logueado): publica su auto y gestiona SOLO los suyos.
import { VehicleManager } from "../components/admin/VehicleManager";

export const MyVehicles = () => (
  <section className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-semibold">Mis publicaciones</h2>
      <p className="text-slate-500">
        Publica tu auto para la venta y administra tus publicaciones. Solo vos (y los administradores) pueden editarlas.
      </p>
    </div>
    <VehicleManager scope="mine" emptyMessage="Todavia no publicaste ningun auto. Completa el formulario de arriba." />
  </section>
);

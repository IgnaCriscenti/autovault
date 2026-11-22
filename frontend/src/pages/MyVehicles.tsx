// Ruta "/mis-publicaciones" (cualquier usuario logueado): publica su auto y gestiona SOLO los suyos.
import { CarIcon } from "lucide-react";
import { VehicleManager } from "../components/admin/VehicleManager";

export const MyVehicles = () => (
  <section className="flex flex-col gap-6">
    <div>
      <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <CarIcon className="size-4" /> Vendé tu auto
      </p>
      <h1 className="text-3xl font-bold">Mis publicaciones</h1>
      <p className="text-muted-foreground">
        Publicá tu auto y administrá tus publicaciones. Solo vos (y los administradores) pueden editarlas.
      </p>
    </div>
    <VehicleManager scope="mine" emptyMessage="Todavía no publicaste ningún auto. Completá el formulario de arriba." />
  </section>
);

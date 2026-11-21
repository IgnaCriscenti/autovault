import { Link } from "react-router";

export const NotFound = () => (
  <section className="py-16 text-center">
    <p className="text-6xl font-bold text-brand-600">404</p>
    <h2 className="mt-2 text-xl font-semibold">Pagina no encontrada</h2>
    <Link to="/" className="mt-4 inline-block text-brand-700 underline">
      Volver al catalogo
    </Link>
  </section>
);

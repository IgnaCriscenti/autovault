// Arbol de rutas centralizado (data router). Niveles de acceso: publico, con sesion y solo admin.
import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home } from "../pages/Home";
import { VehicleDetail } from "../pages/VehicleDetail";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Admin } from "../pages/Admin";
import { MyVehicles } from "../pages/MyVehicles";
import { AdminUsers } from "../pages/AdminUsers";
import { NotFound } from "../pages/NotFound";
import { Privacy } from "../pages/Privacy";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Publicas
      { index: true, element: <Home /> },
      { path: "vehicles/:id", element: <VehicleDetail /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "privacidad", element: <Privacy /> },

      // Cualquier usuario logueado: sin sesion -> /login (y vuelve aca despues de ingresar)
      {
        element: <ProtectedRoute />,
        children: [
          { path: "mis-publicaciones", element: <MyVehicles /> },
          // lazy: el chat (y react-markdown) se descargan recien al entrar, no pesan en el catalogo.
          { path: "asesor", lazy: () => import("../pages/Advisor").then((m) => ({ Component: m.Advisor })) },
        ],
      },

      // Solo admin: sin sesion -> /login, usuario comun -> "Sin permisos"
      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [
          {
            path: "admin",
            children: [
              { index: true, element: <Admin /> },
              { path: "users", element: <AdminUsers /> },
            ],
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

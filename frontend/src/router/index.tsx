// Arbol de rutas centralizado (data router).
import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Publicas
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

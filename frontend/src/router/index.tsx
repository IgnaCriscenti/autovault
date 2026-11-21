// Arbol de rutas centralizado (data router).
import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { Home } from "../pages/Home";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

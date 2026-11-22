import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { store } from "./store";
import { router } from "./router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <TooltipProvider>
        <RouterProvider router={router} />
        {/* Notificaciones (toast.success / toast.error) de toda la app */}
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </Provider>
  </StrictMode>,
);

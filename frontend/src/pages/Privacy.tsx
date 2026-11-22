// Ruta pública "/privacidad": política de privacidad (la exige Google para publicar el login con Google).
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

const REPO_URL = "https://github.com/IgnaCriscenti/autovault";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-2">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="flex flex-col gap-2 leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

export const Privacy = () => (
  <Card className="mx-auto max-w-3xl gap-6 p-8">
    <header>
      <h1 className="text-3xl font-bold">Política de privacidad</h1>
      <p className="text-sm text-muted-foreground">Última actualización: 22 de noviembre de 2026</p>
    </header>

    <p className="leading-relaxed text-muted-foreground">
      AutoVault es un proyecto académico (Trabajo Práctico de la materia Metodologías y Desarrollos Web, UAI) que simula
      el sitio de una concesionaria. Esta política explica qué datos se guardan cuando usás la aplicación.
    </p>

    <Section title="Qué datos guardamos">
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong className="text-foreground">Si te registrás con email:</strong> tu nombre, tu email y tu contraseña
          (guardada con hash, nunca en texto plano).
        </li>
        <li>
          <strong className="text-foreground">Si ingresás con Google o GitHub:</strong> el nombre, el email y la foto de
          perfil que el proveedor comparte. No accedemos a tus contactos, archivos, repositorios ni a ningún otro dato de
          tu cuenta.
        </li>
        <li>
          <strong className="text-foreground">Sesiones:</strong> una cookie de sesión y, asociado a ella, la dirección IP
          y el navegador desde el que ingresaste, para mantener la sesión abierta y poder cerrarla.
        </li>
      </ul>
    </Section>

    <Section title="Para qué los usamos">
      <p>
        Solo para identificarte dentro de la aplicación, mantener tu sesión y asignarte un rol (usuario o
        administrador). No enviamos publicidad, no vendemos ni compartimos los datos con terceros y no usamos cookies de
        seguimiento.
      </p>
    </Section>

    <Section title="Dónde se guardan">
      <p>
        En una base de datos MongoDB Atlas. La aplicación está alojada en Render. El acceso a los datos está limitado a
        los administradores del proyecto.
      </p>
    </Section>

    <Section title="Tus derechos">
      <p>
        Podés pedir que se eliminen tu cuenta y tus datos en cualquier momento abriendo un issue en el{" "}
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
          repositorio del proyecto
        </a>
        . También podés revocar el acceso de AutoVault desde la configuración de seguridad de tu cuenta de Google o
        GitHub.
      </p>
    </Section>
  </Card>
);

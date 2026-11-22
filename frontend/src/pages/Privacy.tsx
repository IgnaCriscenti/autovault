// Ruta publica "/privacidad": politica de privacidad (la exige Google para publicar el login con Google).
const REPO_URL = "https://github.com/IgnaCriscenti/autovault";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <div className="flex flex-col gap-2 text-slate-700">{children}</div>
  </section>
);

export const Privacy = () => (
  <article className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <header>
      <h2 className="text-2xl font-semibold">Politica de privacidad</h2>
      <p className="text-sm text-slate-500">Ultima actualizacion: 22 de noviembre de 2026</p>
    </header>

    <p className="text-slate-700">
      AutoVault es un proyecto academico (Trabajo Practico de la materia Metodologias y Desarrollos Web, UAI) que simula
      el sitio de una concesionaria. Esta politica explica que datos se guardan cuando usas la aplicacion.
    </p>

    <Section title="Que datos guardamos">
      <ul className="list-disc pl-5">
        <li>
          <strong>Si te registras con email:</strong> tu nombre, tu email y tu contraseña (guardada con hash, nunca en
          texto plano).
        </li>
        <li>
          <strong>Si ingresas con Google o GitHub:</strong> el nombre, el email y la foto de perfil que el proveedor
          comparte. No accedemos a tus contactos, archivos, repositorios ni a ningun otro dato de tu cuenta.
        </li>
        <li>
          <strong>Sesiones:</strong> una cookie de sesion y, asociado a ella, la direccion IP y el navegador desde el que
          ingresaste, para mantener la sesion abierta y poder cerrarla.
        </li>
      </ul>
    </Section>

    <Section title="Para que los usamos">
      <p>
        Solo para identificarte dentro de la aplicacion, mantener tu sesion y asignarte un rol (usuario o
        administrador). No enviamos publicidad, no vendemos ni compartimos los datos con terceros y no usamos cookies de
        seguimiento.
      </p>
    </Section>

    <Section title="Donde se guardan">
      <p>
        En una base de datos MongoDB Atlas. La aplicacion esta alojada en Render. El acceso a los datos esta limitado a
        los administradores del proyecto.
      </p>
    </Section>

    <Section title="Tus derechos">
      <p>
        Podes pedir que se eliminen tu cuenta y tus datos en cualquier momento abriendo un issue en el{" "}
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-medium text-brand-700 underline">
          repositorio del proyecto
        </a>
        . Tambien podes revocar el acceso de AutoVault desde la configuracion de seguridad de tu cuenta de Google o
        GitHub.
      </p>
    </Section>
  </article>
);

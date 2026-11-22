// Respuesta del asesor en Markdown (**negrita**, listas, tablas).
// react-markdown NO interpreta HTML crudo: si el modelo devolviera <script>, se muestra como texto (sin XSS).
// Los links internos (/vehicles/...) usan <Link> de react-router: navegan sin recargar y el chat se conserva.
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router";

// Tailwind resetea listas, margenes y tablas (preflight): se reponen con variantes [&_tag].
const MARKDOWN_STYLES =
  "text-sm leading-relaxed [&_p:not(:last-child)]:mb-2 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1.5 " +
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 " +
  "[&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold " +
  "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs sm:[&_table]:text-sm " +
  "[&_th]:border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold " +
  "[&_td]:border [&_td]:px-2 [&_td]:py-1 [&_td]:align-top";

const LINK_CLASS = "font-medium text-primary underline underline-offset-2 hover:text-primary/80";

const components: Components = {
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link to={href} className={LINK_CLASS}>
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer" className={LINK_CLASS}>
        {children}
      </a>
    ),
  // overflow-x-auto: una tabla ancha scrollea adentro de la burbuja en el celular.
  table: ({ children }) => (
    <div className="max-w-full overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
};

export const ChatMarkdown = ({ text }: { text: string }) => (
  <div className={MARKDOWN_STYLES}>
    {/* Se re-renderiza con cada token: el Markdown a medio llegar (ej: "**Toyo") se ve como texto
        plano un instante y se corrige cuando llega el cierre. remarkGfm: tablas y ~~tachado~~. */}
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </Markdown>
  </div>
);

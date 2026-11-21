// Paginacion: anterior / numeros (con "..." si son muchas) / siguiente.
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Ej. para la pagina 6 de 12: [1, "...", 5, 6, 7, "...", 12]
function pageItems(page: number, totalPages: number): (number | "...")[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: (number | "...")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("...");
    items.push(p);
  });
  return items;
}

const baseButton = "min-w-9 rounded-lg border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginacion" className="flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={`${baseButton} border-slate-300 bg-white hover:bg-slate-100`}
      >
        ← Anterior
      </button>
      {pageItems(page, totalPages).map((item, i) =>
        item === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${baseButton} ${
              item === page
                ? "border-brand-600 bg-brand-600 font-semibold text-white"
                : "border-slate-300 bg-white hover:bg-slate-100"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`${baseButton} border-slate-300 bg-white hover:bg-slate-100`}
      >
        Siguiente →
      </button>
    </nav>
  );
};

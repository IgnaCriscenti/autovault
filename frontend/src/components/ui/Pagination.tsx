// Paginacion: anterior / numeros (con "..." si son muchas) / siguiente.
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "./button";

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

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginacion" className="flex flex-wrap items-center justify-center gap-1">
      <Button variant="outline" size="lg" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeftIcon /> Anterior
      </Button>
      {pageItems(page, totalPages).map((item, i) =>
        item === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "default" : "outline"}
            size="icon-lg"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button variant="outline" size="lg" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Siguiente <ChevronRightIcon />
      </Button>
    </nav>
  );
};

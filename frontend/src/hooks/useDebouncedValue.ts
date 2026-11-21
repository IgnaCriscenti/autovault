import { useEffect, useState } from "react";

// Devuelve `value` recien cuando deja de cambiar por `delay` ms (ej: no pegarle a la API por cada tecla).
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

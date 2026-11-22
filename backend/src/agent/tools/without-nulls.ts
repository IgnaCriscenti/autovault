// Los modelos suelen mandar null (o "") en los parametros opcionales que no usan:
// { brand: null, maxPrice: null, search: "" }.
// Groq valida la llamada contra el JSON Schema en SU servidor: si el schema dice .optional() (puede
// faltar pero no ser null) la rechaza antes de llegar a nuestro codigo. Por eso los filtros de las
// tools son .nullish(), y aca se descartan los vacios antes de pasarlos a los schemas de la API.
type Cleaned<T> = { [K in keyof T]?: Exclude<T[K], null> };

export function withoutNulls<T extends Record<string, unknown>>(args: T): Cleaned<T> {
  const isEmpty = (value: unknown) => value === null || value === undefined || value === "";
  return Object.fromEntries(Object.entries(args).filter(([, value]) => !isEmpty(value))) as Cleaned<T>;
}

// Marca "recién inició sesión" para mostrar el splash de bienvenida UNA sola vez.
// Se guarda en sessionStorage porque el login con Google/GitHub sale de la app y vuelve (redirect):
// el estado de React se pierde, pero sessionStorage sobrevive dentro de la misma pestaña.
const KEY = "autovault:welcome";

export function markWelcomePending(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Navegación privada / storage bloqueado: simplemente no hay splash.
  }
}

// Devuelve true si había un login pendiente de bienvenida, y lo consume.
export function consumeWelcome(): boolean {
  try {
    const pending = sessionStorage.getItem(KEY) === "1";
    sessionStorage.removeItem(KEY);
    return pending;
  } catch {
    return false;
  }
}

export function clearWelcome(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nada que limpiar
  }
}

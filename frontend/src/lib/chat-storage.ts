// La conversacion con el asesor se guarda en sessionStorage (por usuario): si se entra al detalle de un
// auto desde un link del chat y se vuelve, sigue ahi. Se borra al cerrar la pestaña, al cerrar sesion
// o con "Nueva conversación". Todo en try/catch: sin storage (modo privado) el chat funciona igual.
const PREFIX = "autovault:chat:";

export function loadChat<T>(userId: string): T[] {
  try {
    const saved = sessionStorage.getItem(PREFIX + userId);
    return saved ? (JSON.parse(saved) as T[]) : [];
  } catch {
    return [];
  }
}

export function saveChat<T>(userId: string, messages: T[]): void {
  try {
    if (messages.length) sessionStorage.setItem(PREFIX + userId, JSON.stringify(messages));
    else sessionStorage.removeItem(PREFIX + userId);
  } catch {
    // sin storage: no se conserva
  }
}

// Al cerrar sesion: que la proxima persona en esta pestaña no vea la conversacion.
export function clearChats(): void {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // sin storage: no hay nada que borrar
  }
}

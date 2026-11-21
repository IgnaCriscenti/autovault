// Falla rapido al arrancar si falta una variable de entorno obligatoria.
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable. Check your .env file (see .env.example).`);
  }
  return value;
}

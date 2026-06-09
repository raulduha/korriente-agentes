// Helpers de formato y estado de uso. Funciones puras (testeadas en format.test.ts).

/** Formatea CLP. Trata -1 como ilimitado. */
export function clp(n: number): string {
  if (n < 0) return "∞";
  return "$" + n.toLocaleString("es-CL");
}

/** Porcentaje de uso (0-100, 1 decimal). Devuelve null si el límite es ilimitado (-1). */
export function pct(used: number, limit: number): number | null {
  if (limit < 0) return null;
  if (limit === 0) return 0;
  return Math.round((1000 * used) / limit) / 10;
}

export type BarState = "ok" | "warn" | "danger";

/** Color de barra según porcentaje: >=100 peligro, >=80 aviso, si no ok. */
export function barColor(p: number | null): BarState {
  if (p === null) return "ok";
  if (p >= 100) return "danger";
  if (p >= 80) return "warn";
  return "ok";
}

/** Texto corto del estado de uso para el dashboard. */
export function usageLabel(p: number | null): string {
  const s = barColor(p);
  if (s === "danger") return "Al tope — se deriva a humano";
  if (s === "warn") return "Cerca del límite";
  return "OK";
}

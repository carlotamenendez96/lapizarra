/** Fecha de hoy en hora española, escrita como la escribiría un camarero. */
export function fechaLarga(): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid',
  }).format(new Date())
}

/** "2026-08-12" en hora española — frescura en JSON-LD / lastmod. */
export function fechaISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date())
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function precioLegible(price: number | null, priceText: string | null): string | null {
  if (priceText) return priceText
  if (price === null || price === undefined) return null
  // 12 -> "12 €", 12.5 -> "12,50 €"
  return Number.isInteger(Number(price))
    ? `${Number(price)} €`
    : `${Number(price).toFixed(2).replace('.', ',')} €`
}

/**
 * Quita tildes y espacios para poder buscar "cafe" y que encuentre "Café".
 * Es lo que hace que el buscador no frustre al usuario.
 */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

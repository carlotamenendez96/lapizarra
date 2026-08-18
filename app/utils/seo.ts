/**
 * Copy SEO alineado con lo que la gente escribe en Google:
 * "menu asturias", "menu gijon", "menu del dia oviedo", etc.
 */

import { fechaLarga } from './formato'

/**
 * `alt` único por foto: nombre + ciudad + fecha. La fecha es la parte
 * que hace que el `alt` no se repita día tras día para el mismo local
 * (relevante para Google Imágenes) y refuerza que el contenido está
 * actualizado a diario.
 */
export function altMenuDelDia(nombreLocal: string, ciudad: string): string {
  return `Menú del día de ${nombreLocal} en ${ciudad} - ${fechaLarga()}`
}

export function tituloSeoHome(): string {
  return 'Menú del día Asturias hoy — Gijón, Oviedo, Avilés, Salinas | La Pizarrina'
}

export function descripcionSeoHome(totalMenus: number, ciudades: string[]): string {
  const lista = ciudades.length
    ? ciudades.join(', ')
    : 'Gijón, Oviedo, Avilés y Salinas'
  return `${totalMenus} menús del día en Asturias hoy. Consulta el menú del día en ${lista}: foto de la pizarra, precios y dirección de cada bar. Actualizado cada mañana.`
}

export function tituloSeoCiudad(ciudad: string): string {
  return `Menú del día ${ciudad} hoy — menú ${ciudad} precios y fotos | La Pizarrina`
}

export function descripcionSeoCiudad(ciudad: string, total: number): string {
  return `Menú del día en ${ciudad} hoy: ${total} bares con su pizarra publicada. Mira el menú ${ciudad}, los platos y el precio antes de comer. Actualizado esta mañana en Asturias.`
}

export function textoSeoHome(ciudades: Array<{ city: string }>): string {
  const nombres = ciudades.map((c) => c.city)
  const lista = nombres.length ? nombres.join(', ') : 'Gijón, Oviedo, Avilés y Salinas'
  return `La Pizarrina recoge el menú del día de Asturias cada mañana: la foto real de la pizarra de cada bar, con precio y dirección. Si buscas menú Asturias, menú del día en ${lista} o simplemente quieres ver qué hay para comer hoy, aquí lo tienes sin intermediarios.`
}

export function textoSeoCiudad(ciudad: string): string {
  return `¿Buscas menú del día en ${ciudad} o menú ${ciudad} para hoy? Aquí están las pizarras publicadas esta mañana por los bares y restaurantes de ${ciudad} (Asturias): foto del menú, precio y dirección. Se actualiza cada día entre las 10 y las 12.`
}

export function nombresCiudades(ciudades: Array<{ city: string }>): string[] {
  return ciudades.map((c) => c.city)
}

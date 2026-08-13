/**
 * Datos de página: en el servidor llama a Supabase en el mismo proceso.
 * En el cliente usa /api/*.
 *
 * En Vercel, $fetch('/api/...') durante el SSR a veces hace un HTTP
 * interno a sí mismo (URL rota tipo ttps://, o la lambda esperándose
 * a sí misma) y Nuxt pinta error.vue. El clic posterior funciona porque
 * ya va por el navegador.
 */
import type { Ciudad, MenuHoy } from '~~/server/utils/supabase'

async function enServidor<T>(cargar: (event: NonNullable<ReturnType<typeof useRequestEvent>>) => Promise<T>): Promise<T> {
  const event = useRequestEvent()
  if (!event) {
    throw createError({ statusCode: 500, statusMessage: 'Sin contexto de petición en el servidor' })
  }
  return cargar(event)
}

export function datosHome() {
  if (import.meta.server) {
    return enServidor(async (event) => {
      const { getMenusHoy, getCiudades } = await import('~~/server/utils/supabase')
      const [menus, ciudades] = await Promise.all([
        getMenusHoy(event),
        getCiudades(event),
      ])
      return { menus, ciudades }
    })
  }
  return Promise.all([
    $fetch<MenuHoy[]>('/api/menus'),
    $fetch<Ciudad[]>('/api/ciudades'),
  ]).then(([menus, ciudades]) => ({ menus, ciudades })).catch(() => ({
    menus: [] as MenuHoy[],
    ciudades: [] as Ciudad[],
  }))
}

export function datosCiudad(slug: string) {
  if (import.meta.server) {
    return enServidor(async (event) => {
      const { getMenusHoy, getCiudades } = await import('~~/server/utils/supabase')
      const [menus, ciudades] = await Promise.all([
        getMenusHoy(event, slug),
        getCiudades(event),
      ])
      return { menus, ciudades }
    })
  }
  return Promise.all([
    $fetch<MenuHoy[]>('/api/menus', { query: { ciudad: slug } }),
    $fetch<Ciudad[]>('/api/ciudades'),
  ]).then(([menus, ciudades]) => ({ menus, ciudades }))
}

export function datosRestaurante(slug: string) {
  if (import.meta.server) {
    return enServidor(async (event) => {
      const { getRestaurante, getCiudades } = await import('~~/server/utils/supabase')
      const [filas, ciudades] = await Promise.all([
        getRestaurante(event, slug),
        getCiudades(event).catch(() => [] as Ciudad[]),
      ])
      return { local: filas?.[0] ?? null, ciudades }
    })
  }
  return Promise.all([
    $fetch<MenuHoy>(`/api/restaurante/${slug}`),
    $fetch<Ciudad[]>('/api/ciudades').catch(() => [] as Ciudad[]),
  ]).then(([local, ciudades]) => ({ local, ciudades }))
}

export function datosCiudades() {
  if (import.meta.server) {
    return enServidor(async (event) => {
      const { getCiudades } = await import('~~/server/utils/supabase')
      return getCiudades(event).catch(() => [] as Ciudad[])
    })
  }
  return $fetch<Ciudad[]>('/api/ciudades').catch(() => [] as Ciudad[])
}

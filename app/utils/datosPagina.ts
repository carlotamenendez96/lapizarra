/**
 * Peticiones a /api/*. El `api` tiene que ser useRequestFetch() capturado
 * en setup(): si se llama useRequestEvent/useFetch dentro de este callback
 * Nuxt 4.5 lanza NUXT_E1001 (composable fuera de contexto) y no hay datos.
 */
import type { H3Event$Fetch } from 'nitropack/types'
import type { Ciudad, MenuHoy } from '~~/server/utils/supabase'

/** Lo que devuelve useRequestFetch(): en SSR no trae .raw/.create de $fetch. */
type FetchApi = H3Event$Fetch

export function datosHome(api: FetchApi) {
  return Promise.all([
    api<MenuHoy[]>('/api/menus'),
    api<Ciudad[]>('/api/ciudades'),
  ]).then(([menus, ciudades]) => ({ menus, ciudades }))
}

export function datosCiudad(api: FetchApi, slug: string) {
  return Promise.all([
    api<MenuHoy[]>('/api/menus', { query: { ciudad: slug } }),
    api<Ciudad[]>('/api/ciudades'),
  ]).then(([menus, ciudades]) => ({ menus, ciudades }))
}

/**
 * Ficha de restaurante + ciudades (nav) + hasta 3 restaurantes cercanos
 * de la misma ciudad con menú publicado hoy, para enlace interno cruzado
 * ("restaurantes cercanos"). El local propio se filtra por slug, no por
 * posición, porque `/api/menus` no garantiza un orden estable con el local.
 */
export function datosRestaurante(api: FetchApi, slug: string) {
  return api<MenuHoy>(`/api/restaurante/${slug}`).then(async (local) => {
    const [ciudades, delaMismaCiudad] = await Promise.all([
      api<Ciudad[]>('/api/ciudades').catch(() => [] as Ciudad[]),
      api<MenuHoy[]>('/api/menus', { query: { ciudad: local.city } }).catch(() => [] as MenuHoy[]),
    ])

    const cercanos = delaMismaCiudad.filter((m) => m.slug !== slug).slice(0, 3)

    return { local, ciudades, cercanos }
  })
}

export function datosCiudades(api: FetchApi) {
  return api<Ciudad[]>('/api/ciudades').catch(() => [] as Ciudad[])
}

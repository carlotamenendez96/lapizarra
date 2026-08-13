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

export function datosRestaurante(api: FetchApi, slug: string) {
  return Promise.all([
    api<MenuHoy>(`/api/restaurante/${slug}`),
    api<Ciudad[]>('/api/ciudades').catch(() => [] as Ciudad[]),
  ]).then(([local, ciudades]) => ({ local, ciudades }))
}

export function datosCiudades(api: FetchApi) {
  return api<Ciudad[]>('/api/ciudades').catch(() => [] as Ciudad[])
}

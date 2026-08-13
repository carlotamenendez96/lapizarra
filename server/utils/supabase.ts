/**
 * Acceso a Supabase desde el servidor de Nuxt.
 *
 * Se usan llamadas REST directas en vez del SDK a propósito: las tres
 * consultas que necesita la web son funciones RPC, el SDK entero sería
 * peso muerto, y así nada de Supabase llega al navegador.
 */

import { slugify } from './slugify'

export interface MenuHoy {
  venue_id: string
  slug: string
  venue_name: string
  address: string
  neighborhood: string | null
  city: string
  lat: number | null
  lng: number | null
  contact_phone: string | null
  schedule: string | null
  menu_id: string | null
  photo_url: string | null
  thumb_url?: string | null
  price: number | null
  price_text: string | null
  updated_at: string | null
}

export interface Ciudad {
  city: string
  city_slug: string
  total: number
}

async function rpc<T>(event: any, fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const config = useRuntimeConfig(event)

  /* Nuxt congela runtimeConfig al compilar, así que en un hosting donde
     las variables se definen después del build (Vercel, Netlify, Render...)
     hay que volver a leer process.env en caliente. Con este fallback
     funcionan tanto SUPABASE_URL como NUXT_SUPABASE_URL. */
  const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
  const supabaseAnonKey = config.supabaseAnonKey || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno.',
    })
  }

  return await $fetch<T>(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: args,
  })
}

export const getMenusHoy = (event: any, ciudad?: string) =>
  rpc<MenuHoy[]>(event, 'search_active_menus', ciudad ? { p_city: ciudad } : {})

export const getCiudadesConMenuHoy = (event: any) =>
  rpc<Ciudad[]>(event, 'cities_with_menus')

export const getRestaurante = (event: any, slug: string) =>
  rpc<MenuHoy[]>(event, 'venue_by_slug', { p_slug: slug })

export const getTodosLosLocales = (event: any) =>
  rpc<Array<{ slug: string; city: string; updated_at: string }>>(event, 'all_active_venues')

/**
 * Ciudades estables para nav/sitemap/SEO: todos los locales activos,
 * con el total de menús de hoy (puede ser 0). Así /menu-del-dia/gijon
 * no desaparece del índice un martes sin publicaciones.
 */
export async function getCiudades(event: any): Promise<Ciudad[]> {
  const [conMenu, locales] = await Promise.all([
    getCiudadesConMenuHoy(event).catch(() => [] as Ciudad[]),
    getTodosLosLocales(event).catch(() => [] as Array<{ slug: string; city: string; updated_at: string }>),
  ])

  const porSlug = new Map<string, Ciudad>()

  for (const local of locales) {
    const city_slug = slugify(local.city)
    if (!city_slug || porSlug.has(city_slug)) continue
    porSlug.set(city_slug, {
      city: local.city,
      city_slug,
      total: 0,
    })
  }

  for (const ciudad of conMenu) {
    porSlug.set(ciudad.city_slug, ciudad)
  }

  return [...porSlug.values()].sort(
    (a, b) => b.total - a.total || a.city.localeCompare(b.city, 'es'),
  )
}

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
  notes: string | null
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

function env(nombre: string): string | undefined {
  /* Acceso dinámico: si se escribe process.env.SUPABASE_URL, Nitro puede
     congelar el valor (o undefined) en el build de Vercel. */
  const valor = process.env[nombre]
  return valor?.trim().replace(/^['"]|['"]$/g, '') || undefined
}

function urlSupabase(cruda: string): string {
  let url = cruda.trim().replace(/\/+$/, '')
  /* El $fetch de Nitro, en Vercel, a veces se come la "h" y deja ttps:// */
  if (url.startsWith('ttps://')) url = `h${url}`
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url
}

async function rpc<T>(event: any, fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const config = useRuntimeConfig(event)

  /* process.env primero: el runtimeConfig horneado puede traer la URL
     corrupta (ttps://) y, al ser truthy, tapaba la variable buena de Vercel. */
  const supabaseUrl = urlSupabase(
    env('SUPABASE_URL') || env('NUXT_SUPABASE_URL') || String(config.supabaseUrl || ''),
  )
  const supabaseAnonKey = String(
    env('SUPABASE_ANON_KEY') || env('NUXT_SUPABASE_ANON_KEY') || config.supabaseAnonKey || '',
  ).replace(/^['"]|['"]$/g, '')

  if (!supabaseUrl || supabaseUrl === 'https://' || !supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno de Vercel.',
    })
  }

  const destino = `${supabaseUrl}/rest/v1/rpc/${fn}`
  const cabeceras: Record<string, string> = {
    apikey: supabaseAnonKey,
    'Content-Type': 'application/json',
  }
  /* sb_publishable_ no es un JWT: si va en Authorization, Supabase
     responde 401 Invalid JWT y Vercel tumba la función. */
  if (supabaseAnonKey.startsWith('eyJ')) {
    cabeceras.Authorization = `Bearer ${supabaseAnonKey}`
  }

  /* fetch nativo: el $fetch de Nitro usa la petición local como base
     (http://localhost/api/...) y corrompe URLs https externas en Vercel. */
  let respuesta: Response
  try {
    respuesta = await fetch(destino, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(args),
    })
  } catch (error) {
    const causa = error instanceof Error ? error.message : String(error)
    throw createError({
      statusCode: 502,
      message: `No se pudo contactar con Supabase (${destino}): ${causa}`,
    })
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '')
    throw createError({
      statusCode: 502,
      message: `Supabase RPC ${fn} falló (${respuesta.status})${detalle ? `: ${detalle.slice(0, 180)}` : ''}`,
    })
  }

  return (await respuesta.json()) as T
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

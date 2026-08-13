import type { MaybeRefOrGetter } from 'vue'

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>

export type OpcionesSeoPagina = {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  url: MaybeRefOrGetter<string>
  /** URL absoluta o relativa; si falta, se usa /og-default.png */
  image?: MaybeRefOrGetter<string | undefined>
  imageAlt?: MaybeRefOrGetter<string>
  robots?: string
  jsonLd?: MaybeRefOrGetter<JsonLd>
}

const OG_ANCHO = 1200
const OG_ALTO = 630
const OG_DEFAULT_PATH = '/og-default.png'

/**
 * Meta tags + canonical + JSON-LD con imagen social garantizada.
 * Evita tarjetas vacías al compartir cuando no hay foto de menú hoy.
 */
export function useSeoPagina(opciones: OpcionesSeoPagina) {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')

  const titulo = computed(() => toValue(opciones.title))
  const descripcion = computed(() => toValue(opciones.description))
  const url = computed(() => toValue(opciones.url))
  const imageAlt = computed(
    () => toValue(opciones.imageAlt) || titulo.value,
  )

  const imagenAbsoluta = computed(() => {
    const cruda = toValue(opciones.image)
    const ruta = cruda || `${siteUrl}${OG_DEFAULT_PATH}`
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta
    return `${siteUrl}${ruta.startsWith('/') ? ruta : `/${ruta}`}`
  })

  const esImagenPorDefecto = computed(() => !toValue(opciones.image))

  useSeoMeta({
    title: titulo,
    description: descripcion,
    ogTitle: titulo,
    ogDescription: descripcion,
    ogType: 'website',
    ogUrl: url,
    ogLocale: 'es_ES',
    ogSiteName: 'La Pizarrina',
    ogImage: imagenAbsoluta,
    ogImageWidth: computed(() => (esImagenPorDefecto.value ? OG_ANCHO : undefined)),
    ogImageHeight: computed(() => (esImagenPorDefecto.value ? OG_ALTO : undefined)),
    ogImageAlt: imageAlt,
    twitterCard: 'summary_large_image',
    twitterTitle: titulo,
    twitterDescription: descripcion,
    twitterImage: imagenAbsoluta,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
    meta: [
      {
        name: 'robots',
        content: opciones.robots || 'index,follow,max-image-preview:large',
      },
    ],
    script: opciones.jsonLd
      ? [
          {
            type: 'application/ld+json',
            innerHTML: computed(() =>
              JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': (() => {
                  const valor = toValue(opciones.jsonLd!)
                  return Array.isArray(valor) ? valor : [valor]
                })(),
              }),
            ),
          },
        ]
      : undefined,
  })

  return {
    siteUrl,
    imagenAbsoluta,
    esImagenPorDefecto,
    logoUrl: `${siteUrl}/logo.png`,
    ogDefaultUrl: `${siteUrl}${OG_DEFAULT_PATH}`,
  }
}

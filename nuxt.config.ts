export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',

  // SSR activado: es lo que hace que Google vea el contenido de los menús
  // en el HTML. Con una SPA normal indexaría una página vacía.
  ssr: true,

  modules: ['@nuxt/fonts', '@nuxt/image'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Vacío a propósito: si aquí se mete process.env.SUPABASE_URL, Nitro
    // hornea el https:// en el build y en Vercel la URL puede quedar rota
    // (ttps://). En runtime se leen SUPABASE_* o NUXT_SUPABASE_*.
    supabaseUrl: '',
    supabaseAnonKey: '',
    public: {
      siteUrl: process.env.SITE_URL || 'https://pizarrina.es',
      // WhatsApp del comercial (no el bot de publicación).
      contactoComercialUrl:
        process.env.CONTACTO_COMERCIAL_URL || 'https://wa.me/34645475153',
    },
  },

  routeRules: {
    // Los menús cambian una vez al día, pero un local puede subir el suyo
    // a media mañana: 5 minutos de caché da páginas casi instantáneas sin
    // que un menú nuevo tarde en aparecer. stale-while-revalidate sirve la
    // versión cacheada mientras regenera por detrás.
    '/': { swr: 300 },
    '/menu-del-dia/**': { swr: 300 },
    '/restaurante/**': { swr: 300 },
    '/como-funciona': { swr: 3600 },
    '/sitemap.xml': { swr: 3600 },
    '/robots.txt': { swr: 86400 },
  },

  nitro: {
    compressPublicAssets: { brotli: true, gzip: true },
  },

  // Auto-aloja Fraunces / Manrope / IBM Plex Mono (usadas vía variables CSS
  // en main.css). `global: true` las inyecta aunque el escáner no vea el
  // nombre dentro de --display/--texto/--dato.
  fonts: {
    processCSSVariables: true,
    families: [
      {
        name: 'Fraunces',
        provider: 'google',
        global: true,
        weights: [400, 500, 600, 700],
        styles: ['normal', 'italic'],
      },
      {
        name: 'Manrope',
        provider: 'google',
        global: true,
        weights: [400, 500, 600, 700],
      },
      {
        name: 'IBM Plex Mono',
        provider: 'google',
        global: true,
        weights: [400, 500],
      },
    ],
  },

  // Listados siguen usando thumb_url de Telegram; IPX solo genera srcset/WebP.
  image: {
    domains: [
      ...(process.env.SUPABASE_URL
        ? [new URL(process.env.SUPABASE_URL).hostname]
        : []),
      ...(process.env.NUXT_SUPABASE_URL
        ? [new URL(process.env.NUXT_SUPABASE_URL).hostname]
        : []),
      'oeuobixauwbdfuinmhvy.supabase.co',
    ],
    format: ['webp'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#101917' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  future: { compatibilityVersion: 4 },
})

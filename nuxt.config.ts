export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',

  // SSR activado: es lo que hace que Google vea el contenido de los menús
  // en el HTML. Con una SPA normal indexaría una página vacía.
  ssr: true,

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Solo servidor: la web nunca habla con Supabase desde el navegador,
    // así el cliente no descarga el SDK y las respuestas se pueden cachear.
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    public: {
      siteUrl: process.env.SITE_URL || 'https://lapizarra.es',
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

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#101917' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,600&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  future: { compatibilityVersion: 4 },
})

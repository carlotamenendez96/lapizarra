export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',

  // SSR activado: es lo que hace que Google vea el contenido de los menús
  // en el HTML. Con una SPA normal indexaría una página vacía.
  ssr: true,

  modules: ['@nuxt/fonts'],

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
    // En Vercel, `swr` cachea el HTML en la CDN sin caducidad real (hemos
    // visto páginas con Age de horas). `isr` sí regenera pasado el TTL:
    // un segundo envío del menú aparece como mucho 5 minutos después.
    '/': { isr: 300 },
    '/menu-del-dia/**': { isr: 300 },
    '/restaurante/**': { isr: 300 },
    '/como-funciona': { isr: 3600 },
    '/sitemap.xml': { isr: 3600 },
    '/robots.txt': { isr: 86400 },
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

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#101917' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-NML09Q86LF',
          async: true,
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NML09Q86LF');
          `,
        },
      ],
    },
  },

  future: { compatibilityVersion: 4 },

  typescript: {
    nodeTsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },
})

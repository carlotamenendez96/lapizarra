/**
 * Abre la conexión con Supabase Storage antes de que el navegador sepa
 * siquiera qué fotos va a pedir. Ahorra el handshake DNS+TLS en la imagen
 * más grande de la página, que suele ser la que marca el LCP.
 *
 * Va en un plugin y no en nuxt.config porque la URL se lee en tiempo de
 * ejecución (ver el comentario en server/utils/supabase.ts).
 */
export default defineNuxtPlugin(() => {
  const origen = process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL
  if (!origen) return

  useHead({
    link: [{ rel: 'preconnect', href: new URL(origen).origin, crossorigin: '' }],
  })
})

/**
 * Abre la conexión con Supabase Storage antes de que el navegador sepa
 * siquiera qué fotos va a pedir. Ahorra el handshake DNS+TLS en la imagen
 * más grande de la página, que suele ser la que marca el LCP.
 *
 * Va en un plugin y no en nuxt.config porque la URL se lee en tiempo de
 * ejecución (ver el comentario en server/utils/supabase.ts).
 */
export default defineNuxtPlugin(() => {
  const cruda = process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL
  if (!cruda) return

  try {
    let url = cruda.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '')
    if (url.startsWith('ttps://')) url = `h${url}`
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    useHead({
      link: [{ rel: 'preconnect', href: new URL(url).origin, crossorigin: '' }],
    })
  }
  catch {
    /* Un preconnect mal formado no debe tumbar el SSR de la home. */
  }
})

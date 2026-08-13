/**
 * SWR de la home puede guardar el HTML de error.vue 5 minutos.
 * Si un SSR falla una vez, cada recarga directa seguiría mostrando
 * "Algo ha fallado" aunque el clic en el menú (cliente) ya funcionara.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', (event) => {
    if (getResponseStatus(event) >= 400) {
      setResponseHeader(event, 'Cache-Control', 'no-store')
    }
  })
})

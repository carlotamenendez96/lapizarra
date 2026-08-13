export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const filas = await getRestaurante(event, slug)

  if (!filas?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Restaurante no encontrado' })
  }

  return filas[0]
})

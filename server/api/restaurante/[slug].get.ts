export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const filas = await getRestaurante(event, slug)

  if (!filas?.length) {
    throw createError({ statusCode: 404, message: 'Restaurante no encontrado' })
  }

  return filas[0]
})

export default defineEventHandler(async (event) => {
  const { ciudad } = getQuery(event)
  return await getMenusHoy(event, typeof ciudad === 'string' ? ciudad : undefined)
})

/**
 * Sitemap generado al vuelo desde la base de datos: en cuanto das de alta
 * un restaurante nuevo aparece aquí sin tocar nada, y Google lo descubre
 * en el siguiente rastreo.
 */
export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig(event)
  const base = siteUrl.replace(/\/$/, '')

  const [ciudades, locales] = await Promise.all([
    getCiudades(event).catch(() => []),
    getTodosLosLocales(event).catch(() => []),
  ])

  // Hora española: coincide con el día del menú, no con UTC del servidor.
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date())

  const urls = [
    // La home cambia a diario (menús nuevos), de ahí "daily"
    { loc: base, lastmod: hoy, changefreq: 'daily', priority: '1.0' },
    {
      loc: `${base}/como-funciona`,
      lastmod: hoy,
      changefreq: 'monthly',
      priority: '0.6',
    },
    ...ciudades.map((c) => ({
      loc: `${base}/menu-del-dia/${c.city_slug}`,
      lastmod: hoy,
      changefreq: 'daily',
      priority: '0.9',
    })),
    ...locales.map((l) => ({
      loc: `${base}/restaurante/${l.slug}`,
      lastmod: (l.updated_at || hoy).slice(0, 10),
      changefreq: 'daily',
      priority: '0.7',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})

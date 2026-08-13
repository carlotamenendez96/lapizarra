<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrlBase = config.public.siteUrl.replace(/\/$/, '')
const slug = String(route.params.slug)

const { data, error } = await useAsyncData(`local-${slug}`, () => datosRestaurante(slug))

if (error.value || !data.value?.local) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: error.value?.statusMessage || 'Restaurante no encontrado',
  })
}

const local = computed(() => data.value!.local)
const ciudades = computed(() => data.value?.ciudades ?? [])
const ciudadSlug = computed(
  () => ciudades.value.find((c) => c.city === local.value.city)?.city_slug || '',
)

const tieneMenuHoy = computed(() => Boolean(local.value.photo_url))
const precio = computed(() => precioLegible(local.value.price, local.value.price_text))
const fecha = fechaLarga()
const hoyISO = fechaISO()
const url = `${siteUrlBase}/restaurante/${slug}`
const imagenSocial = computed(() => local.value.photo_url || undefined)

const titulo = computed(() =>
  tieneMenuHoy.value
    ? `Menú del día de hoy en ${local.value.venue_name} (${local.value.city}) | La Pizarrina`
    : `${local.value.venue_name}, ${local.value.city} — menú del día | La Pizarrina`,
)

const descripcion = computed(() =>
  tieneMenuHoy.value
    ? `Menú del día de hoy en ${local.value.venue_name}, ${local.value.address} (${local.value.city})${precio.value ? `, por ${precio.value}` : ''}. Foto de la pizarra actualizada esta mañana.`
    : `${local.value.venue_name}, en ${local.value.address} (${local.value.city}). Consulta aquí su menú del día en cuanto lo publiquen.`,
)

const { siteUrl } = useSeoPagina({
  title: titulo,
  description: descripcion,
  url,
  image: imagenSocial,
  imageAlt: computed(
    () => `Pizarra del menú del día en ${local.value.venue_name}, ${local.value.city}`,
  ),
  jsonLd: computed(() => [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
        ...(ciudadSlug.value
          ? [{
              '@type': 'ListItem',
              position: 2,
              name: `Menú del día en ${local.value.city}`,
              item: `${siteUrl}/menu-del-dia/${ciudadSlug.value}`,
            }]
          : []),
        { '@type': 'ListItem', position: ciudadSlug.value ? 3 : 2, name: local.value.venue_name, item: url },
      ],
    },
    {
      '@type': 'Restaurant',
      '@id': `${url}#restaurant`,
      name: local.value.venue_name,
      url,
      ...(local.value.photo_url
        ? {
            image: {
              '@type': 'ImageObject',
              url: local.value.photo_url,
              width: 1000,
              height: 1333,
              caption: `Pizarra con el menú del día de hoy en ${local.value.venue_name}`,
            },
          }
        : {}),
      telephone: local.value.contact_phone || undefined,
      openingHours: local.value.schedule || undefined,
      servesCuisine: 'Asturiana',
      ...(local.value.price
        ? { priceRange: `€${Number(local.value.price).toFixed(0)}` }
        : local.value.price_text
          ? { priceRange: local.value.price_text }
          : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress: local.value.address,
        addressLocality: local.value.city,
        addressRegion: 'Asturias',
        addressCountry: 'ES',
      },
      ...(local.value.lat && local.value.lng
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: local.value.lat,
              longitude: local.value.lng,
            },
          }
        : {}),
      ...(tieneMenuHoy.value
        ? {
            hasMenu: {
              '@type': 'Menu',
              name: 'Menú del día',
              url,
              ...(local.value.updated_at
                ? { dateModified: local.value.updated_at }
                : { dateModified: hoyISO }),
              ...(local.value.price
                ? {
                    offers: {
                      '@type': 'Offer',
                      price: local.value.price,
                      priceCurrency: 'EUR',
                    },
                  }
                : {}),
            },
          }
        : {}),
    },
  ]),
})

const enlaceMapa = computed(
  () =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${local.value.venue_name}, ${local.value.address}, ${local.value.city}`,
    )}`,
)
</script>

<template>
  <div>
    <CabeceraSitio :ciudades="ciudades" />

    <main class="pagina">
      <nav class="contenedor miga" aria-label="Ruta de navegación">
        <NuxtLink to="/">Inicio</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink v-if="ciudadSlug" :to="`/menu-del-dia/${ciudadSlug}`">{{ local.city }}</NuxtLink>
        <span v-else>{{ local.city }}</span>
        <span aria-hidden="true">/</span>
        <span>{{ local.venue_name }}</span>
      </nav>

      <header class="encabezado">
        <div class="contenedor encabezado-fila">
          <div>
            <h1>
              <template v-if="tieneMenuHoy">
                Menú del día en {{ local.venue_name }}
                <span class="h1-ciudad">({{ local.city }})</span>
              </template>
              <template v-else>
                {{ local.venue_name }}
                <span class="h1-ciudad">· {{ local.city }}</span>
              </template>
            </h1>
            <p class="direccion">{{ local.address }} · {{ local.city }}</p>
          </div>
          <span v-if="precio" class="precio precio-grande">{{ precio }}</span>
        </div>
      </header>

      <div class="contenedor columnas">
        <section class="menu">
          <h2 class="eyebrow">Menú de hoy, {{ fecha }}</h2>

          <figure v-if="tieneMenuHoy" class="foto">
            <NuxtImg
              :src="local.photo_url!"
              :alt="`Pizarra con el menú del día de hoy en ${local.venue_name}, ${local.city}`"
              width="1000"
              height="1333"
              sizes="(max-width: 768px) 100vw, 640px"
              format="webp"
              fetchpriority="high"
              decoding="async"
            />
            <figcaption>Foto de la pizarra enviada hoy por el restaurante.</figcaption>
          </figure>

          <p v-else class="sin-menu">
            {{ local.venue_name }} todavía no ha publicado el menú de hoy. Los bares suelen
            colgar su pizarra entre las 10 y las 12 de la mañana.
          </p>
        </section>

        <aside class="datos">
          <h2 class="eyebrow">Datos del restaurante</h2>
          <dl>
            <dt>Dirección</dt>
            <dd>
              {{ local.address }}<br>
              <span v-if="local.neighborhood">{{ local.neighborhood }}, </span>{{ local.city }}
            </dd>

            <template v-if="local.contact_phone">
              <dt>Teléfono</dt>
              <dd><a :href="`tel:${local.contact_phone}`">{{ local.contact_phone }}</a></dd>
            </template>

            <template v-if="local.schedule">
              <dt>Horario</dt>
              <dd>{{ local.schedule }}</dd>
            </template>
          </dl>

          <a class="boton" :href="enlaceMapa" target="_blank" rel="noopener">Cómo llegar</a>

          <NuxtLink v-if="ciudadSlug" class="volver" :to="`/menu-del-dia/${ciudadSlug}`">
            Ver todos los menús de {{ local.city }}
          </NuxtLink>
        </aside>
      </div>
    </main>

    <PieSitio :ciudades="ciudades" />
  </div>
</template>

<style scoped>
.pagina { padding-bottom: 1rem; }

.miga {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-family: var(--dato);
  font-size: var(--paso-1);
  color: var(--grafito-suave);
  padding: 1.5rem 0 0;
}

.miga a { text-decoration: none; }
.miga a:hover { color: var(--grafito); text-decoration: underline; text-underline-offset: 3px; }

.encabezado {
  margin-top: 1.1rem;
  padding: 1.6rem 0 1.7rem;
  background: var(--pizarra);
  color: var(--tiza);
  position: relative;
  overflow: hidden;
}

.encabezado::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}

.encabezado-fila {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.encabezado h1 { font-size: var(--paso-3); max-width: 18ch; }

.h1-ciudad {
  font-weight: 400;
  font-style: italic;
  color: var(--tiza-suave);
}

.direccion {
  margin: 0.55rem 0 0;
  color: var(--tiza-suave);
}

.precio-grande {
  font-size: var(--paso-1-arriba);
  padding: 0.45em 0.85em;
  background: var(--sidra);
  color: #fff;
  align-self: center;
}

.columnas {
  display: grid;
  gap: clamp(1.5rem, 4vw, 3rem);
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  padding-top: 2.2rem;
  align-items: start;
}

@media (max-width: 780px) {
  .columnas { grid-template-columns: 1fr; }
}

.foto {
  margin: 0.95rem 0 0;
  background: var(--papel-hueso);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  overflow: hidden;
  box-shadow: var(--sombra-suave);
}

.foto img {
  width: 100%;
  height: auto;
}

.foto figcaption {
  padding: 0.8rem 1.1rem;
  font-size: var(--paso-1);
  color: var(--grafito-suave);
  border-top: 1px solid var(--borde);
  background: var(--blanco);
}

.sin-menu {
  margin-top: 0.95rem;
  padding: 2.2rem 1.6rem;
  background: var(--blanco);
  border: 1px dashed var(--borde);
  border-radius: var(--radio);
  color: var(--grafito-suave);
  max-width: 52ch;
}

.datos {
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  padding: 1.4rem 1.45rem 1.55rem;
  position: sticky;
  top: 88px;
  box-shadow: var(--sombra-suave);
}

@media (max-width: 780px) {
  .datos { position: static; }
}

dl { margin: 1rem 0 1.5rem; }

dt {
  font-family: var(--dato);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--grafito-suave);
  margin-top: 1.1rem;
}

dt:first-child { margin-top: 0; }

dd { margin: 0.3rem 0 0; }

dd a {
  color: var(--sidra);
  font-weight: 600;
  text-decoration: none;
}

dd a:hover { text-decoration: underline; text-underline-offset: 3px; }

.boton {
  display: block;
  text-align: center;
  background: var(--sidra);
  color: #fff;
  padding: 0.8rem 1rem;
  border-radius: var(--radio-pill);
  text-decoration: none;
  font-weight: 600;
  transition: background var(--transicion), transform var(--transicion);
}

.boton:hover {
  background: var(--sidra-hover);
  transform: translateY(-1px);
}

.volver {
  display: block;
  margin-top: 1rem;
  font-size: var(--paso-1);
  color: var(--sidra);
  text-align: center;
  font-weight: 600;
  text-decoration: none;
}

.volver:hover { text-decoration: underline; text-underline-offset: 3px; }
</style>

<script setup lang="ts">
import type { MenuHoy, Ciudad } from '~~/server/utils/supabase'

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl.replace(/\/$/, '')

const { data } = await useAsyncData('home', async () => {
  const [menus, ciudades] = await Promise.all([
    $fetch<MenuHoy[]>('/api/menus'),
    $fetch<Ciudad[]>('/api/ciudades'),
  ])
  return { menus, ciudades }
})

const menus = computed(() => data.value?.menus ?? [])
const ciudades = computed(() => data.value?.ciudades ?? [])
const fecha = fechaLarga()
const hoyISO = fechaISO()
const imagenSocial = computed(() => menus.value[0]?.photo_url || undefined)

const titulo = 'Menú del día hoy en Asturias — precios y fotos | La Pizarrina'
const descripcion = computed(
  () =>
    `Consulta los menús del día de hoy en Asturias: ${menus.value.length} restaurantes con su pizarra, sus platos y su precio. Actualizado cada mañana.`,
)

useSeoMeta({
  title: titulo,
  description: descripcion,
  ogTitle: titulo,
  ogDescription: descripcion,
  ogType: 'website',
  ogUrl: siteUrl,
  ogLocale: 'es_ES',
  ogSiteName: 'La Pizarrina',
  ogImage: imagenSocial,
  twitterCard: 'summary_large_image',
  twitterImage: imagenSocial,
  twitterTitle: titulo,
  twitterDescription: descripcion,
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
  meta: [{ name: 'robots', content: 'index,follow,max-image-preview:large' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              '@id': `${siteUrl}/#website`,
              name: 'La Pizarrina',
              url: siteUrl,
              inLanguage: 'es-ES',
              description:
                'Los menús del día de los restaurantes de Asturias, actualizados cada mañana con la foto de la pizarra.',
              publisher: { '@id': `${siteUrl}/#organization` },
            },
            {
              '@type': 'Organization',
              '@id': `${siteUrl}/#organization`,
              name: 'La Pizarrina',
              url: siteUrl,
              areaServed: {
                '@type': 'AdministrativeArea',
                name: 'Asturias',
              },
            },
            {
              '@type': 'CollectionPage',
              '@id': `${siteUrl}/#webpage`,
              url: siteUrl,
              name: titulo,
              description: descripcion.value,
              isPartOf: { '@id': `${siteUrl}/#website` },
              dateModified: hoyISO,
              inLanguage: 'es-ES',
              mainEntity: {
                '@type': 'ItemList',
                name: 'Restaurantes con menú del día hoy en Asturias',
                numberOfItems: menus.value.length,
                itemListElement: menus.value.map((m, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `${siteUrl}/restaurante/${m.slug}`,
                  name: m.venue_name,
                })),
              },
            },
          ],
        }),
      ),
    },
  ],
})
</script>

<template>
  <div>
    <CabeceraSitio :ciudades="ciudades" />

    <main>
      <!-- El héroe es la propia pizarra: la fecha escrita a mano y la
           cuenta de sitios, que es exactamente lo que el usuario viene
           a saber. -->
      <section class="pizarra-banda hero">
        <div class="contenedor hero-grid">
          <div>
            <p class="badge">Hoy · {{ fecha }}</p>
            <h1>Menú del día en Asturias</h1>
            <p class="sub">
              Las pizarras reales de los bares, actualizadas cada mañana.
              Foto, precio y dirección, sin intermediarios.
            </p>
          </div>
          <p class="hero-cuenta">
            <strong>{{ menus.length }}</strong>
            <span>{{ menus.length === 1 ? 'pizarra colgada hoy' : 'pizarras colgadas hoy' }}</span>
          </p>
        </div>
      </section>

      <section v-if="ciudades.length" class="contenedor ciudades">
        <div class="ciudades-caja">
          <h2 class="eyebrow">Elige tu ciudad</h2>
          <ul class="chips">
            <li v-for="c in ciudades" :key="c.city_slug">
              <NuxtLink :to="`/menu-del-dia/${c.city_slug}`" class="chip">
                {{ c.city }} <span class="chip-num">{{ c.total }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </section>

      <section class="contenedor listado">
        <h2 class="titulo-seccion">Menús publicados hoy</h2>
        <RejillaMenus
          :menus="menus"
          mensaje-vacio="Todavía no hay menús publicados hoy. Los bares suelen colgar su pizarra entre las 10 y las 12."
        />
      </section>

      <section class="contenedor">
        <div class="puente">
          <div>
            <h2>¿Tienes un bar?</h2>
            <p>
              Las fotos son las pizarras reales de cada local, actualizadas esta mañana.
              Si quieres salir, un comercial te da de alta.
            </p>
          </div>
          <NuxtLink to="/como-funciona" class="puente-cta">Así funciona La Pizarrina</NuxtLink>
        </div>
      </section>
    </main>

    <PieSitio :ciudades="ciudades" />
  </div>
</template>

<style scoped>
.hero {
  padding: clamp(2.8rem, 8vw, 5.4rem) 0 clamp(3.6rem, 8vw, 5.8rem);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto;
  gap: 2rem 3rem;
  align-items: end;
}

.badge {
  display: inline-block;
  margin: 0 0 1rem;
  font-family: var(--dato);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--tiza);
  background: rgba(244, 234, 214, 0.1);
  border: 1px solid rgba(244, 234, 214, 0.16);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radio-pill);
}

.hero h1 {
  font-size: var(--paso-3);
  max-width: 12ch;
}

.sub {
  margin: 1.15rem 0 0;
  max-width: 40ch;
  color: var(--tiza-suave);
  font-size: var(--paso-1-arriba);
  line-height: 1.45;
}

.hero-cuenta {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 1.1rem 1.3rem 1.2rem;
  border: 1px solid rgba(244, 234, 214, 0.14);
  border-radius: var(--radio);
  background: rgba(244, 234, 214, 0.05);
  min-width: 10rem;
}

.hero-cuenta strong {
  font-family: var(--display);
  font-size: clamp(2.6rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.hero-cuenta span {
  font-family: var(--dato);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tiza-suave);
  max-width: 12ch;
}

.ciudades {
  margin-top: -2.1rem;
  position: relative;
  z-index: 2;
}

.ciudades-caja {
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  padding: 1.15rem 1.3rem 1.25rem;
  box-shadow: var(--sombra);
}

.chips {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0 0;
  padding: 0;
}

.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  padding: 0.48rem 0.95rem;
  border: 1px solid var(--borde);
  border-radius: var(--radio-pill);
  background: var(--papel);
  text-decoration: none;
  font-size: var(--paso-0);
  font-weight: 500;
  transition: background var(--transicion), border-color var(--transicion), color var(--transicion);
}

.chip:hover {
  background: var(--pizarra);
  border-color: var(--pizarra);
  color: var(--tiza);
}

.chip-num {
  font-family: var(--dato);
  font-size: var(--paso-1);
  color: var(--sidra);
}

.chip:hover .chip-num { color: var(--sidra-clara); }

.listado { padding-top: 2.8rem; }

.titulo-seccion {
  font-size: var(--paso-2);
  margin-bottom: 1.35rem;
}

.puente {
  margin-top: 3rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.4rem;
  padding: 1.6rem 1.7rem;
  background: var(--pizarra);
  color: var(--tiza);
  border-radius: var(--radio);
}

.puente h2 {
  font-size: var(--paso-1-arriba);
  margin: 0 0 0.35rem;
}

.puente p {
  margin: 0;
  color: var(--tiza-suave);
  max-width: 48ch;
}

.puente-cta {
  display: inline-block;
  background: var(--sidra);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  padding: 0.75rem 1.2rem;
  border-radius: var(--radio-pill);
  white-space: nowrap;
  transition: background var(--transicion), transform var(--transicion);
}

.puente-cta:hover {
  background: var(--sidra-hover);
  transform: translateY(-2px);
}

@media (max-width: 700px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-cuenta { flex-direction: row; align-items: baseline; gap: 0.75rem; min-width: 0; }
  .hero-cuenta span { max-width: none; }
}
</style>

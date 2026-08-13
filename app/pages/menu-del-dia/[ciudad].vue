<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrlBase = String(config.public.siteUrl || '').replace(/\/$/, '')
const slugCiudad = String(route.params.ciudad)

const { data } = await useAsyncData(`ciudad-${slugCiudad}`, () => datosCiudad(slugCiudad))

const menus = computed(() => data.value?.menus ?? [])
const ciudades = computed(() => data.value?.ciudades ?? [])

/* El nombre bonito viene de la base de datos ("Gijón"), no del slug
   ("gijon"): así se respetan tildes y mayúsculas en el H1 y el título. */
const nombreCiudad = computed(() => {
  const deMenus = menus.value[0]?.city
  const deLista = ciudades.value.find((c) => c.city_slug === slugCiudad)?.city
  return deMenus || deLista || capitalizar(slugCiudad.replace(/-/g, ' '))
})

/* Una ciudad sin locales dados de alta no debe devolver 200 con una
   página vacía: Google lo trataría como contenido de baja calidad. */
if (!menus.value.length && !ciudades.value.some((c) => c.city_slug === slugCiudad)) {
  throw createError({ statusCode: 404, statusMessage: 'Ciudad sin restaurantes dados de alta' })
}

const otrasCiudades = computed(() => ciudades.value.filter((c) => c.city_slug !== slugCiudad))
const fecha = fechaLarga()
const hoyISO = fechaISO()
const url = `${siteUrlBase}/menu-del-dia/${slugCiudad}`
const imagenSocial = computed(() => menus.value[0]?.photo_url || undefined)

const titulo = computed(() => tituloSeoCiudad(nombreCiudad.value))
const descripcion = computed(() => descripcionSeoCiudad(nombreCiudad.value, menus.value.length))
const textoSeo = computed(() => textoSeoCiudad(nombreCiudad.value))

const { siteUrl } = useSeoPagina({
  title: titulo,
  description: descripcion,
  url,
  image: imagenSocial,
  imageAlt: computed(() => `Menú del día en ${nombreCiudad.value} — La Pizarrina`),
  jsonLd: computed(() => [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: `Menú del día en ${nombreCiudad.value}`, item: url },
      ],
    },
    {
      '@type': 'CollectionPage',
      '@id': `${url}#webpage`,
      url,
      name: titulo.value,
      description: descripcion.value,
      dateModified: hoyISO,
      inLanguage: 'es-ES',
      isPartOf: { '@type': 'WebSite', name: 'La Pizarrina', url: siteUrl },
      mainEntity: {
        '@type': 'ItemList',
        name: `Menú del día en ${nombreCiudad.value} hoy`,
        numberOfItems: menus.value.length,
        itemListElement: menus.value.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Restaurant',
            name: m.venue_name,
            url: `${siteUrl}/restaurante/${m.slug}`,
            image: m.photo_url || undefined,
            telephone: m.contact_phone || undefined,
            address: {
              '@type': 'PostalAddress',
              streetAddress: m.address,
              addressLocality: m.city,
              addressRegion: 'Asturias',
              addressCountry: 'ES',
            },
          },
        })),
      },
    },
  ]),
})
</script>

<template>
  <div>
    <CabeceraSitio :ciudades="ciudades" />

    <main>
      <section class="pizarra-banda hero">
        <div class="contenedor hero-grid">
          <div>
            <nav class="miga" aria-label="Ruta de navegación">
              <NuxtLink to="/">Inicio</NuxtLink>
              <span aria-hidden="true">/</span>
              <span>{{ nombreCiudad }}</span>
            </nav>

            <p class="badge">Hoy · {{ fecha }}</p>
            <h1>Menú del día en {{ nombreCiudad }}</h1>
            <p class="sub">
              Las pizarras publicadas hoy, con foto, precio y dirección.
            </p>
          </div>
          <p class="hero-cuenta">
            <strong>{{ menus.length }}</strong>
            <span>{{ menus.length === 1 ? 'restaurante hoy' : 'restaurantes hoy' }}</span>
          </p>
        </div>
      </section>

      <section class="contenedor listado">
        <h2 class="titulo-seccion">Menú del día en {{ nombreCiudad }} hoy</h2>
        <RejillaMenus
          :menus="menus"
          :mensaje-vacio="`Todavía no hay menús publicados hoy en ${nombreCiudad}. Los bares suelen colgar su pizarra entre las 10 y las 12.`"
        />
      </section>

      <section class="contenedor puente">
        <h2 class="titulo-seccion">Menú {{ nombreCiudad }} — qué es La Pizarrina</h2>
        <p class="seo-texto">{{ textoSeo }}</p>
        <p>
          En {{ nombreCiudad }} ves las pizarras publicadas hoy, con foto, precio y dirección.
          <NuxtLink to="/como-funciona">Cómo funciona La Pizarrina</NuxtLink>
        </p>

        <nav v-if="otrasCiudades.length" class="otras-wrap" aria-label="Otras ciudades">
          <h2>Otras ciudades</h2>
          <ul class="otras">
            <li v-for="c in otrasCiudades" :key="c.city_slug">
              <NuxtLink :to="`/menu-del-dia/${c.city_slug}`">
                {{ c.city }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </section>
    </main>

    <PieSitio :ciudades="ciudades" />
  </div>
</template>

<style scoped>
.hero { padding: clamp(2.2rem, 6vw, 3.8rem) 0 clamp(2.4rem, 6vw, 3.6rem); }

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto;
  gap: 2rem 3rem;
  align-items: end;
}

.miga {
  display: flex;
  gap: 0.5rem;
  font-family: var(--dato);
  font-size: var(--paso-1);
  color: var(--tiza-suave);
  margin-bottom: 1.1rem;
}

.miga a { text-decoration: none; color: var(--tiza); }
.miga a:hover { text-decoration: underline; text-underline-offset: 3px; }

.badge {
  display: inline-block;
  margin: 0 0 0.85rem;
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

.hero h1 { font-size: var(--paso-3); max-width: 14ch; }

.sub {
  margin: 1rem 0 0;
  color: var(--tiza-suave);
  max-width: 40ch;
  font-size: var(--paso-1-arriba);
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
  font-size: clamp(2.4rem, 5vw, 3.6rem);
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
}

.listado { padding-top: 2.4rem; }

.puente { padding-top: 2.6rem; }

.puente .titulo-seccion {
  font-size: var(--paso-2);
  margin-bottom: 1rem;
}

.seo-texto {
  margin: 0 0 1.2rem;
  color: var(--grafito-suave);
  max-width: 62ch;
  line-height: 1.6;
}

.puente > p {
  margin: 0;
  color: var(--grafito-suave);
  max-width: 54ch;
}

.puente > p a {
  color: var(--sidra);
  font-weight: 600;
  text-decoration: none;
}

.puente > p a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.otras-wrap { margin-top: 2rem; }

.otras-wrap h2 {
  font-size: var(--paso-1-arriba);
  margin-bottom: 0.85rem;
}

.otras {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.otras a {
  color: var(--grafito);
  text-decoration: none;
  font-weight: 500;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--borde);
  border-radius: var(--radio-pill);
  background: var(--blanco);
  transition: background var(--transicion), color var(--transicion), border-color var(--transicion);
}

.otras a:hover {
  background: var(--pizarra);
  border-color: var(--pizarra);
  color: var(--tiza);
}

@media (max-width: 700px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-cuenta { flex-direction: row; align-items: baseline; gap: 0.75rem; min-width: 0; }
}
</style>

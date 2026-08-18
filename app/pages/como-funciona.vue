<script setup lang="ts">
const config = useRuntimeConfig()
const siteUrlBase = String(config.public.siteUrl || '').replace(/\/$/, '')
const contacto = config.public.contactoComercialUrl as string
const url = `${siteUrlBase}/como-funciona`

const api = useRequestFetch()
const { data: ciudades } = await useAsyncData('ciudades-como', () => datosCiudades(api))

const titulo = 'Cómo funciona La Pizarrina — menú del día en Asturias'
const descripcion =
  'La Pizarrina publica cada mañana la foto de la pizarra de bares y restaurantes de Asturias. Apuntarse es gratis: pide el enlace de alta y en un minuto estás publicando el menú.'

useSeoPagina({
  title: titulo,
  description: descripcion,
  url,
  imageAlt: 'Cómo funciona La Pizarrina',
  robots: 'index,follow',
  jsonLd: [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrlBase },
        { '@type': 'ListItem', position: 2, name: 'Cómo funciona', item: url },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: titulo,
      description: descripcion,
      isPartOf: { '@type': 'WebSite', name: 'La Pizarrina', url: siteUrlBase },
      inLanguage: 'es-ES',
    },
    {
      '@type': 'HowTo',
      name: 'Cómo publicar el menú del día en La Pizarrina',
      description:
        'Es gratis. Te enviamos el enlace de alta en Telegram. Registras el local y cada mañana mandas la foto de la pizarra.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Pide el enlace de alta (es gratis)',
          text: 'Contacta con el equipo. Te enviarán tu enlace de alta en Telegram sin coste.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Fotografía la pizarra',
          text: 'Por la mañana, haz una foto clara de la pizarra del menú del día.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Envíala por Telegram',
          text: 'Mándala por tu enlace personal. En minutos aparece en la web.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cómo veo el menú del día en Asturias?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Elige tu ciudad en La Pizarrina y consulta las pizarras publicadas hoy: foto, precio y dirección de cada bar o restaurante.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cómo publico el menú de mi bar en La Pizarrina?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Es gratis. Te enviamos tu enlace de alta en Telegram. Con él registras el local y, cada mañana, fotografías la pizarra y la mandas; en minutos aparece en la web.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cómo doy de alta mi local?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Es completamente gratis. Te enviamos el enlace de alta en Telegram. Tú registras el local desde ese enlace y, a partir de ahí, publicar el menú es mandar una foto.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Por qué existe La Pizarrina?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'En Asturias el menú del día sigue viviendo en la pizarra de la puerta. La Pizarrina muestra la foto que manda el hostelero cada día, sin reescribir la carta.',
          },
        },
      ],
    },
  ],
})
</script>

<template>
  <div>
    <CabeceraSitio :ciudades="ciudades || []" />

    <main>
      <section class="pizarra-banda hero">
        <div class="contenedor hero-inner">
          <p class="badge">La idea</p>
          <h1>La pizarra del bar, en el móvil</h1>
          <p class="sub">
            Cada mañana los hosteleros escriben el menú en una pizarra.
            Nosotros la enseñamos tal cual — con foto, precio y dirección —
            para que en Asturias sepas dónde comer sin dar vueltas.
          </p>
        </div>
      </section>

      <section class="contenedor bloque">
        <h2 class="titulo-seccion">Para quien busca dónde comer</h2>
        <ol class="pasos">
          <li class="paso" style="--i: 0">
            <span class="num" aria-hidden="true">01</span>
            <div>
              <h3>Elige tu ciudad</h3>
              <p>Gijón, Oviedo, Avilés… ves solo los locales que hoy han colgado menú.</p>
            </div>
            <div class="dibujo dibujo--mapa" aria-hidden="true">
              <span /><span /><span />
            </div>
          </li>
          <li class="paso" style="--i: 1">
            <span class="num" aria-hidden="true">02</span>
            <div>
              <h3>Mira la pizarra</h3>
              <p>La foto es la del propio bar: primeros, segundos, postre y precio, sin intermediarios.</p>
            </div>
            <div class="dibujo dibujo--pizarra" aria-hidden="true">
              <span class="trazo" /><span class="trazo corto" /><span class="trazo" />
            </div>
          </li>
          <li class="paso" style="--i: 2">
            <span class="num" aria-hidden="true">03</span>
            <div>
              <h3>Decide y ve</h3>
              <p>Dirección, teléfono si lo hay, y un enlace a mapas. Hoy, no la carta de hace un mes.</p>
            </div>
            <div class="dibujo dibujo--pin" aria-hidden="true">
              <span class="gota" />
            </div>
          </li>
        </ol>
      </section>

      <section class="banda-papel">
        <div class="contenedor bloque">
          <h2 class="titulo-seccion">Para el bar o restaurante</h2>
          <p class="intro">
            Es completamente <strong>gratis</strong>. Te enviamos tu <strong>enlace de alta en Telegram</strong>.
            Con él registras el local y, a partir de ahí, publicar el menú es
            mandar una foto.
          </p>

          <div class="carril">
            <article class="tarjeta-flujo" style="--i: 0">
              <p class="etiqueta">Paso 1</p>
              <h3>Pide el enlace de alta</h3>
              <p>Te enviamos tu enlace de alta en Telegram, sin coste.</p>
            </article>
            <span class="flecha" aria-hidden="true">→</span>
            <article class="tarjeta-flujo" style="--i: 1">
              <p class="etiqueta">Paso 2</p>
              <h3>Das de alta el local</h3>
              <p>Abres el enlace, registras tu bar y ya puedes publicar el menú.</p>
            </article>
            <span class="flecha" aria-hidden="true">→</span>
            <article class="tarjeta-flujo" style="--i: 2">
              <p class="etiqueta">Paso 3</p>
              <h3>Foto cada mañana</h3>
              <p>Envías la pizarra y en minutos está visible en la web de tu ciudad.</p>
            </article>
          </div>

          <div class="cta">
            <div>
              <h2>¿Quieres salir en La Pizarrina?</h2>
              <p>
                Es gratis. Pide el enlace de alta y en minutos tu bar aparece en la web de tu ciudad.
              </p>
            </div>
            <a class="boton" :href="contacto" target="_blank" rel="noopener">
              Apuntarse gratis
            </a>
          </div>
        </div>
      </section>

      <section class="contenedor bloque cierre">
        <h2 class="titulo-seccion">Por qué existe</h2>
        <p>
          En Asturias el menú del día sigue viviendo en la pizarra de la puerta.
          Comparar opciones obligaba a recorrer el barrio. La Pizarrina no reescribe
          la carta: muestra la foto que manda el hostelero, cada día, para que
          quien come y quien cocina hablen el mismo idioma.
        </p>
        <NuxtLink class="enlace" to="/">Ver los menús de hoy</NuxtLink>
      </section>
    </main>

    <PieSitio :ciudades="ciudades || []" />
  </div>
</template>

<style scoped>
.hero {
  padding: clamp(2.8rem, 7vw, 5rem) 0 clamp(2.6rem, 6vw, 4.2rem);
}

.hero-inner { max-width: 40rem; }

.badge {
  display: inline-block;
  margin: 0 0 1rem;
  font-family: var(--dato);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tiza);
  background: rgba(244, 234, 214, 0.1);
  border: 1px solid rgba(244, 234, 214, 0.16);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radio-pill);
}

.hero h1 {
  font-size: var(--paso-3);
  max-width: 14ch;
}

.sub {
  margin: 1.15rem 0 0;
  max-width: 42ch;
  color: var(--tiza-suave);
  line-height: 1.55;
  font-size: var(--paso-1-arriba);
}

.bloque {
  padding-top: clamp(2.6rem, 5vw, 3.8rem);
  padding-bottom: clamp(1.5rem, 3vw, 2rem);
}

.titulo-seccion {
  font-size: var(--paso-2);
  margin-bottom: 1.5rem;
}

.pasos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.9rem;
}

.paso {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem 1.2rem;
  align-items: center;
  padding: 1.25rem 1.3rem;
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  animation: entra 0.55s ease both;
  animation-delay: calc(var(--i) * 0.08s);
  transition: box-shadow var(--transicion), transform var(--transicion);
}

.paso:hover {
  box-shadow: var(--sombra-suave);
  transform: translateY(-2px);
}

.num {
  font-family: var(--dato);
  font-size: var(--paso-1);
  color: var(--sidra);
  background: var(--sidra-clara);
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 500;
}

.paso h3 {
  font-size: var(--paso-1-arriba);
  margin: 0 0 0.25rem;
}

.paso p {
  margin: 0;
  color: var(--grafito-suave);
  max-width: 42ch;
}

.dibujo {
  width: 56px;
  height: 44px;
  border-radius: 10px;
  flex: none;
}

.dibujo--mapa {
  background: var(--papel-hueso);
  border: 1px dashed var(--borde);
  display: grid;
  place-items: center;
  grid-template-columns: repeat(3, 8px);
  gap: 4px;
  padding: 0 10px;
}

.dibujo--mapa span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--pizarra);
  opacity: 0.35;
}

.dibujo--mapa span:nth-child(2) { opacity: 1; background: var(--sidra); }

.dibujo--pizarra {
  background: var(--pizarra);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 0 10px;
}

.trazo {
  display: block;
  height: 2px;
  background: var(--tiza);
  opacity: 0.75;
  border-radius: 2px;
}

.trazo.corto { width: 55%; opacity: 0.45; }

.dibujo--pin {
  background: var(--papel-hueso);
  border: 1px solid var(--borde);
  display: grid;
  place-items: center;
}

.gota {
  width: 12px;
  height: 12px;
  background: var(--sidra);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}

.banda-papel {
  background: var(--papel-hueso);
  margin-top: 1.8rem;
}

.intro {
  max-width: 54ch;
  color: var(--grafito-suave);
  margin: -0.4rem 0 1.7rem;
}

.carril {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0.85rem;
}

.tarjeta-flujo {
  flex: 1 1 180px;
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  padding: 1.2rem 1.2rem 1.35rem;
  animation: entra 0.55s ease both;
  animation-delay: calc(0.15s + var(--i) * 0.1s);
}

.etiqueta {
  margin: 0 0 0.5rem;
  font-family: var(--dato);
  font-size: 0.72rem;
  color: var(--sidra);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.tarjeta-flujo h3 {
  font-size: var(--paso-1-arriba);
  margin: 0 0 0.4rem;
}

.tarjeta-flujo p {
  margin: 0;
  color: var(--grafito-suave);
}

.flecha {
  align-self: center;
  color: var(--sidra);
  font-family: var(--dato);
  opacity: 0.7;
}

@media (max-width: 780px) {
  .flecha { display: none; }
  .paso { grid-template-columns: auto 1fr; }
  .dibujo { display: none; }
}

.cta {
  margin-top: 2.1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.55rem 1.65rem;
  background: var(--pizarra);
  color: var(--tiza);
  border-radius: var(--radio);
}

.cta h2 {
  font-size: var(--paso-1-arriba);
  margin: 0 0 0.35rem;
}

.cta p {
  margin: 0;
  color: var(--tiza-suave);
  max-width: 42ch;
}

.boton {
  display: inline-block;
  background: var(--sidra);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  padding: 0.8rem 1.25rem;
  border-radius: var(--radio-pill);
  white-space: nowrap;
  transition: background var(--transicion), transform var(--transicion);
}

.boton:hover {
  background: var(--sidra-hover);
  transform: translateY(-2px);
}

.cierre p {
  max-width: 58ch;
  color: var(--grafito-suave);
}

.enlace {
  display: inline-block;
  margin-top: 1.1rem;
  color: var(--sidra);
  font-weight: 600;
  text-decoration: none;
}

.enlace:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

@keyframes entra {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .paso,
  .tarjeta-flujo,
  .boton { animation: none; transition: none; }
}
</style>

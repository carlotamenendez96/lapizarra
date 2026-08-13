<script setup lang="ts">
defineProps<{ ciudades?: Array<{ city: string; city_slug: string; total: number }> }>()

const config = useRuntimeConfig()
const contacto = config.public.contactoComercialUrl as string
</script>

<template>
  <footer class="pie">
    <div class="contenedor">
      <div class="columnas">
        <div>
          <p class="marca">La Pizarrina</p>
          <p class="claim">
            Los menús del día de Asturias, tal y como están escritos en la pizarra del bar.
          </p>
          <NuxtLink class="enlace-alta" to="/como-funciona">Cómo funciona</NuxtLink>
        </div>

        <nav v-if="ciudades?.length" aria-label="Menús del día por ciudad">
          <p class="titulo">Por ciudad</p>
          <ul>
            <li v-for="c in ciudades" :key="c.city_slug">
              <NuxtLink :to="`/menu-del-dia/${c.city_slug}`">Menú del día en {{ c.city }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <p class="titulo">¿Tienes un bar?</p>
          <p class="claim">
            Un comercial te envía el enlace de alta en Telegram. Tú registras el local y publicas el menú con una foto.
          </p>
          <a class="enlace-alta enlace-alta--boton" :href="contacto" target="_blank" rel="noopener">
            Hablar con un comercial
          </a>
        </div>
      </div>

      <p class="legal">© {{ new Date().getFullYear() }} La Pizarrina · Asturias</p>
    </div>
  </footer>
</template>

<style scoped>
.pie {
  margin-top: 5rem;
  padding: 3.2rem 0 2.2rem;
  background: var(--pizarra);
  color: var(--tiza);
  position: relative;
  overflow: hidden;
}

.pie::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}

.contenedor { position: relative; z-index: 1; }

.columnas {
  display: grid;
  gap: 2.4rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}

.marca {
  font-family: var(--display);
  font-weight: 700;
  margin: 0 0 0.65rem;
  font-size: var(--paso-1-arriba);
  letter-spacing: -0.02em;
}

.titulo {
  font-family: var(--dato);
  font-weight: 500;
  margin: 0 0 0.7rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--tiza-suave);
}

.claim {
  margin: 0;
  color: var(--tiza-suave);
  max-width: 34ch;
  line-height: 1.55;
}

ul { list-style: none; margin: 0; padding: 0; }

li + li { margin-top: 0.4rem; }

li a {
  color: var(--tiza-suave);
  text-decoration: none;
  transition: color var(--transicion);
}

li a:hover { color: var(--tiza); }

.enlace-alta {
  display: inline-block;
  margin-top: 0.9rem;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--sidra) 70%, transparent);
  padding-bottom: 0.1rem;
}

.enlace-alta:hover {
  color: var(--sidra-clara);
}

.enlace-alta--boton {
  border: 0;
  background: var(--sidra);
  padding: 0.55rem 1rem;
  border-radius: var(--radio-pill);
}

.enlace-alta--boton:hover {
  background: var(--sidra-hover);
  color: #fff;
}

.legal {
  margin: 2.8rem 0 0;
  padding-top: 1.4rem;
  border-top: 1px solid rgba(244, 234, 214, 0.12);
  color: var(--tiza-suave);
  font-family: var(--dato);
  font-size: var(--paso-1);
}
</style>

<script setup lang="ts">
import type { MenuHoy } from '~~/server/utils/supabase'

const props = defineProps<{
  menu: MenuHoy
  /** Las primeras tarjetas se cargan con prioridad; el resto, en diferido. */
  prioritaria?: boolean
}>()

const zona = computed(() => props.menu.neighborhood || props.menu.city)
</script>

<template>
  <article class="tarjeta">
    <NuxtLink :to="`/restaurante/${menu.slug}`" class="enlace">
      <div class="marco">
        <img
          :src="menu.thumb_url || menu.photo_url || ''"
          :alt="`Menú del día de hoy en ${menu.venue_name}, ${menu.city}`"
          width="600"
          height="800"
          :loading="prioritaria ? 'eager' : 'lazy'"
          :fetchpriority="prioritaria ? 'high' : 'auto'"
          decoding="async"
        >
      </div>

      <div class="cuerpo">
        <h3 class="nombre">{{ menu.venue_name }}</h3>
        <p class="zona">
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 1.5a4.6 4.6 0 0 0-4.6 4.6c0 3.2 4.6 8.4 4.6 8.4s4.6-5.2 4.6-8.4A4.6 4.6 0 0 0 8 1.5Zm0 6.2a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z"
            />
          </svg>
          {{ zona }}
        </p>
        <span class="ver">Ver menú</span>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.tarjeta {
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  overflow: hidden;
  transition: transform var(--transicion), box-shadow var(--transicion), border-color var(--transicion);
}

.tarjeta:hover,
.tarjeta:focus-within {
  transform: translateY(-5px);
  box-shadow: var(--sombra);
  border-color: color-mix(in srgb, var(--sidra) 28%, var(--borde));
}

.enlace {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.marco {
  aspect-ratio: 4 / 3;
  background: var(--papel-hueso);
  overflow: hidden;
  position: relative;
}

/* Absolute fill: height:100% dentro de un padre con solo aspect-ratio
   no se resuelve bien en WebKit (móvil) y la foto se aplasta. */
.marco img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  object-position: center;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (hover: hover) {
  .tarjeta:hover .marco img {
    transform: scale(1.05);
  }
}

/* Las pizarras se fotografían en vertical (como en la ficha). En móvil
   la tarjeta es a ancho completo: 4/3 recorta o estira el menú. */
@media (max-width: 640px) {
  .marco {
    aspect-ratio: 3 / 4;
  }

  .marco img {
    object-position: center top;
  }
}

.cuerpo {
  padding: 1rem 1.05rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.nombre {
  font-size: var(--paso-1-arriba);
  letter-spacing: -0.02em;
}

.zona {
  margin: 0;
  font-size: var(--paso-1);
  color: var(--grafito-suave);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.zona svg { flex: none; opacity: 0.7; }

.ver {
  margin-top: 0.55rem;
  font-size: var(--paso-1);
  color: var(--sidra);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.ver::after {
  content: '→';
  transition: transform var(--transicion);
}

.tarjeta:hover .ver::after {
  transform: translateX(3px);
}
</style>

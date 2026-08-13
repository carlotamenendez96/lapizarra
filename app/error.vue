<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; statusMessage?: string } }>()

const es404 = computed(() => props.error.statusCode === 404)
const titulo = computed(() =>
  es404.value
    ? 'Página no encontrada | La Pizarrina'
    : 'Error | La Pizarrina',
)
const descripcion = computed(() =>
  es404.value
    ? 'Esta página no existe en La Pizarrina. Puede que el restaurante ya no esté dado de alta.'
    : 'Ha ocurrido un error. Vuelve a intentarlo en un momento.',
)

useSeoMeta({
  title: titulo,
  description: descripcion,
  robots: 'noindex,nofollow',
})
</script>

<template>
  <div>
    <CabeceraSitio />

    <main class="contenedor caja">
      <p class="eyebrow">Error {{ error.statusCode }}</p>
      <h1>{{ es404 ? 'Esta página no existe' : 'Algo ha fallado' }}</h1>
      <p class="texto">
        {{
          es404
            ? 'Puede que el restaurante ya no esté dado de alta o que la dirección esté mal escrita.'
            : 'Vuelve a intentarlo en un momento.'
        }}
      </p>
      <NuxtLink to="/" class="boton" @click="clearError({ redirect: '/' })">
        Ver los menús de hoy
      </NuxtLink>
    </main>
  </div>
</template>

<style scoped>
.caja {
  padding: clamp(3.2rem, 10vw, 6.5rem) 0;
  max-width: 52ch;
}

h1 { font-size: var(--paso-3); margin: 0.7rem 0 0; }

.texto { color: var(--grafito-suave); margin: 1rem 0 2rem; }

.boton {
  display: inline-block;
  background: var(--sidra);
  color: #fff;
  padding: 0.8rem 1.3rem;
  border-radius: var(--radio-pill);
  text-decoration: none;
  font-weight: 600;
  transition: background var(--transicion), transform var(--transicion);
}

.boton:hover {
  background: var(--sidra-hover);
  transform: translateY(-2px);
}
</style>

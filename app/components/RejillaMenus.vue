<script setup lang="ts">
import type { MenuHoy } from '~~/server/utils/supabase'

const props = defineProps<{
  menus: MenuHoy[]
  /** Se muestra bajo el buscador cuando la lista está vacía de origen. */
  mensajeVacio?: string
}>()

const consulta = ref('')

/* El filtro es en cliente sobre la lista que ya está en la página: la
   respuesta es instantánea y no hay ni una petición al servidor por
   tecla. Con cientos de locales por ciudad esto sigue siendo inmediato;
   si algún día son miles, tocaría pasarlo a búsqueda en servidor. */
const filtrados = computed(() => {
  const q = normalizar(consulta.value)
  if (!q) return props.menus

  return props.menus.filter((m) =>
    normalizar(`${m.venue_name} ${m.neighborhood || ''} ${m.address}`).includes(q),
  )
})
</script>

<template>
  <div>
    <div class="barra">
      <label class="campo">
        <span class="solo-lectores">Buscar restaurante por nombre</span>
        <svg class="lupa" viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M13.5 13.5 18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input
          v-model="consulta"
          type="search"
          placeholder="Buscar un restaurante o una zona"
          autocomplete="off"
          enterkeyhint="search"
        >
      </label>

      <p class="cuenta" aria-live="polite">
        {{ filtrados.length }} {{ filtrados.length === 1 ? 'sitio' : 'sitios' }}
      </p>
    </div>

    <div v-if="filtrados.length" class="rejilla">
      <TarjetaMenu
        v-for="(menu, i) in filtrados"
        :key="menu.venue_id"
        :menu="menu"
        :prioritaria="i < 4"
      />
    </div>

    <p v-else-if="consulta" class="vacio">
      Ningún restaurante coincide con «{{ consulta }}».
      <button type="button" class="limpiar" @click="consulta = ''">Ver todos</button>
    </p>

    <p v-else class="vacio">{{ mensajeVacio || 'Todavía no hay menús publicados hoy.' }}</p>
  </div>
</template>

<style scoped>
.barra {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.7rem;
  flex-wrap: wrap;
}

.campo {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 260px;
}

.lupa {
  position: absolute;
  left: 1rem;
  color: var(--grafito-suave);
  pointer-events: none;
}

.campo input {
  width: 100%;
  font-family: inherit;
  font-size: var(--paso-0);
  color: inherit;
  padding: 0.82rem 1.1rem 0.82rem 2.75rem;
  border: 1px solid var(--borde);
  border-radius: var(--radio-pill);
  background: var(--blanco);
  transition: border-color var(--transicion), box-shadow var(--transicion);
}

.campo input::placeholder { color: var(--grafito-suave); }

.campo input:focus {
  outline: none;
  border-color: var(--sidra);
  box-shadow: 0 0 0 4px var(--sidra-clara);
}

.cuenta {
  margin: 0;
  font-family: var(--dato);
  font-size: var(--paso-1);
  color: var(--grafito-suave);
  background: var(--papel-hueso);
  padding: 0.4rem 0.85rem;
  border-radius: var(--radio-pill);
}

.rejilla {
  display: grid;
  gap: clamp(1.05rem, 2.2vw, 1.7rem);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
}

.vacio {
  padding: 2.8rem 1.4rem;
  color: var(--grafito-suave);
  background: var(--blanco);
  border: 1px dashed var(--borde);
  border-radius: var(--radio);
  text-align: center;
}

.limpiar {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--sidra);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>

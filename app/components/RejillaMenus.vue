<script setup lang="ts">
import type { MenuHoy } from '~~/server/utils/supabase'

const props = defineProps<{
  menus: MenuHoy[]
  /** Se muestra bajo el buscador cuando la lista está vacía de origen. */
  mensajeVacio?: string
  /** Chips de barrio: solo en la página de ciudad, no en toda Asturias. */
  filtrarPorBarrio?: boolean
}>()

const consulta = ref('')
const barrioActivo = ref('')

const barrios = computed(() => {
  const conteo = new Map<string, number>()
  for (const menu of props.menus) {
    const barrio = menu.neighborhood?.trim()
    if (!barrio) continue
    conteo.set(barrio, (conteo.get(barrio) || 0) + 1)
  }
  return [...conteo.entries()]
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
})

const mostrarBarrios = computed(() => props.filtrarPorBarrio && barrios.value.length > 0)

const porBarrio = computed(() => {
  if (!barrioActivo.value) return props.menus
  return props.menus.filter((m) => m.neighborhood?.trim() === barrioActivo.value)
})

/* El filtro es en cliente sobre la lista que ya está en la página: la
   respuesta es instantánea y no hay ni una petición al servidor por
   tecla. Con cientos de locales por ciudad esto sigue siendo inmediato;
   si algún día son miles, tocaría pasarlo a búsqueda en servidor. */
const filtrados = computed(() => {
  const q = normalizar(consulta.value)
  if (!q) return porBarrio.value

  return porBarrio.value.filter((m) =>
    normalizar(`${m.venue_name} ${m.neighborhood || ''} ${m.address}`).includes(q),
  )
})

function elegirBarrio(nombre: string) {
  barrioActivo.value = nombre
}
</script>

<template>
  <div>
    <div class="filtros" :class="{ 'filtros--barrios': mostrarBarrios }">
      <div v-if="mostrarBarrios" class="barrios">
        <h3 class="eyebrow">Dónde quieres comer</h3>
        <div class="mosaico" role="group" aria-label="Barrio">
          <button
            type="button"
            class="lugar"
            :class="{ 'lugar--activo': !barrioActivo }"
            :aria-pressed="!barrioActivo"
            @click="elegirBarrio('')"
          >
            <span class="lugar-icono" aria-hidden="true">
              <span /><span /><span />
            </span>
            <span class="lugar-nombre">Toda la ciudad</span>
            <span class="lugar-dato">{{ menus.length }} {{ menus.length === 1 ? 'pizarra' : 'pizarras' }}</span>
          </button>
          <button
            v-for="b in barrios"
            :key="b.nombre"
            type="button"
            class="lugar"
            :class="{ 'lugar--activo': barrioActivo === b.nombre }"
            :aria-pressed="barrioActivo === b.nombre"
            @click="elegirBarrio(b.nombre)"
          >
            <span class="lugar-icono lugar-icono--pin" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path
                  fill="currentColor"
                  d="M8 1.5a4.6 4.6 0 0 0-4.6 4.6c0 3.2 4.6 8.4 4.6 8.4s4.6-5.2 4.6-8.4A4.6 4.6 0 0 0 8 1.5Zm0 6.2a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z"
                />
              </svg>
            </span>
            <span class="lugar-nombre">{{ b.nombre }}</span>
            <span class="lugar-dato">{{ b.total }} {{ b.total === 1 ? 'pizarra' : 'pizarras' }}</span>
          </button>
        </div>
      </div>

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

    <p v-else-if="barrioActivo" class="vacio">
      Hoy no hay menús en {{ barrioActivo }}.
      <button type="button" class="limpiar" @click="barrioActivo = ''">Ver todos los barrios</button>
    </p>

    <p v-else class="vacio">{{ mensajeVacio || 'Todavía no hay menús publicados hoy.' }}</p>
  </div>
</template>

<style scoped>
.filtros { margin-bottom: 1.7rem; }

.filtros--barrios {
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  padding: 1.15rem 1.2rem 1.25rem;
  box-shadow: var(--sombra-suave);
}

.barrios { margin-bottom: 1.15rem; }

.mosaico {
  display: flex;
  gap: 0.65rem;
  overflow-x: auto;
  margin: 0.85rem 0 0;
  padding: 0.1rem 0 0.35rem;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
}

.lugar {
  flex: 1 1 9.5rem;
  min-width: 9.5rem;
  max-width: 16rem;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.28rem;
  text-align: left;
  padding: 0.9rem 1rem 0.95rem;
  border: 1px solid var(--borde);
  border-radius: var(--radio-sm);
  background: var(--papel);
  font-family: inherit;
  color: inherit;
  cursor: pointer;
  transition:
    background var(--transicion),
    border-color var(--transicion),
    color var(--transicion),
    transform var(--transicion),
    box-shadow var(--transicion);
}

.lugar:hover {
  transform: translateY(-2px);
  box-shadow: var(--sombra-suave);
  border-color: color-mix(in srgb, var(--pizarra) 35%, var(--borde));
}

.lugar--activo {
  background: var(--pizarra);
  border-color: var(--pizarra);
  color: var(--tiza);
  box-shadow: var(--sombra-suave);
}

.lugar--activo:hover { transform: none; }

.lugar-icono {
  width: 1.7rem;
  height: 1.35rem;
  border-radius: 7px;
  background: var(--blanco);
  border: 1px dashed var(--borde);
  display: grid;
  place-items: center;
  grid-template-columns: repeat(3, 5px);
  gap: 3px;
  padding: 0 5px;
  margin-bottom: 0.2rem;
}

.lugar-icono span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--pizarra);
  opacity: 0.35;
}

.lugar-icono span:nth-child(2) {
  opacity: 1;
  background: var(--sidra);
}

.lugar-icono--pin {
  display: grid;
  place-items: center;
  color: var(--sidra);
  border-style: solid;
}

.lugar--activo .lugar-icono {
  background: rgba(244, 234, 214, 0.1);
  border-color: rgba(244, 234, 214, 0.16);
}

.lugar--activo .lugar-icono span { background: var(--tiza); }
.lugar--activo .lugar-icono span:nth-child(2) { background: var(--sidra-clara); }
.lugar--activo .lugar-icono--pin { color: var(--tiza); }

.lugar-nombre {
  font-family: var(--display);
  font-weight: 600;
  font-size: var(--paso-1-arriba);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.lugar-dato {
  font-family: var(--dato);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sidra);
}

.lugar--activo .lugar-dato { color: var(--sidra-clara); }

.barra {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filtros--barrios .barra {
  margin: 0;
  padding-top: 1.05rem;
  border-top: 1px solid var(--borde);
}

.filtros--barrios .campo input { background: var(--papel); }

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

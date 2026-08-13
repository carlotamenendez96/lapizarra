<script setup lang="ts">
defineProps<{
  ciudades?: Array<{ city: string; city_slug: string; total: number }>
}>()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const contacto = config.public.contactoComercialUrl as string

const enMenus = computed(() => {
  const p = route.path
  return p === '/' || p.startsWith('/menu-del-dia') || p.startsWith('/restaurante')
})

const enComoFunciona = computed(() => route.path.startsWith('/como-funciona'))

const seleccion = computed({
  get() {
    const slug = route.params.ciudad
    return typeof slug === 'string' ? slug : ''
  },
  set(valor: string) {
    if (!valor) router.push('/')
    else router.push(`/menu-del-dia/${valor}`)
  },
})

function alCambiar(evento: Event) {
  const valor = (evento.target as HTMLSelectElement).value
  seleccion.value = valor
}
</script>

<template>
  <header class="cabecera">
    <div class="contenedor fila">
      <NuxtLink to="/" class="logo" aria-label="La Pizarrina, inicio">
        <span class="logo-marco" aria-hidden="true">
          <span class="logo-linea l1" />
          <span class="logo-linea l2" />
          <span class="logo-linea l3" />
        </span>
        <span class="logo-texto">La&nbsp;Pizarrina</span>
      </NuxtLink>

      <nav class="tabs" aria-label="Secciones">
        <NuxtLink
          to="/"
          class="tab"
          :class="{ 'tab--activo': enMenus }"
          @click="clearError"
        >
          Menús de hoy
        </NuxtLink>
        <NuxtLink
          to="/como-funciona"
          class="tab"
          :class="{ 'tab--activo': enComoFunciona }"
        >
          Cómo funciona
        </NuxtLink>
        <a
          class="tab tab--cta"
          :href="contacto"
          target="_blank"
          rel="noopener"
        >
          Dar de alta
        </a>
      </nav>

      <div v-if="ciudades?.length" class="selector">
        <label class="solo-lectores" for="selector-ciudad">Ciudad</label>
        <select
          id="selector-ciudad"
          class="select"
          :value="seleccion"
          @change="alCambiar"
        >
          <option value="">Toda Asturias</option>
          <option
            v-for="c in ciudades"
            :key="c.city_slug"
            :value="c.city_slug"
          >
            {{ c.city }} ({{ c.total }})
          </option>
        </select>
      </div>
    </div>
  </header>
</template>

<style scoped>
.cabecera {
  border-bottom: 1px solid color-mix(in srgb, var(--borde) 80%, transparent);
  background: color-mix(in srgb, var(--papel) 78%, transparent);
  backdrop-filter: blur(18px) saturate(1.35);
  -webkit-backdrop-filter: blur(18px) saturate(1.35);
  position: sticky;
  top: 0;
  z-index: 20;
}

.fila {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.85rem 1.25rem;
  padding-block: 0.85rem;
  min-height: 68px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
}

.logo-marco {
  width: 30px;
  height: 26px;
  border-radius: 7px;
  background: var(--pizarra);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 0 6px;
  flex: none;
  box-shadow: 0 4px 10px -4px rgba(16, 25, 23, 0.5);
}

.logo-linea {
  display: block;
  height: 2px;
  background: var(--tiza);
  border-radius: 2px;
}

.l1 { width: 100%; opacity: 0.9; }
.l2 { width: 68%; opacity: 0.55; }
.l3 { width: 86%; opacity: 0.75; }

.logo-texto {
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.22rem;
  letter-spacing: -0.03em;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.2rem;
}

.tab {
  font-size: var(--paso-1);
  font-weight: 500;
  color: var(--grafito-suave);
  text-decoration: none;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radio-pill);
  transition: color var(--transicion), background var(--transicion);
}

.tab:hover {
  color: var(--grafito);
  background: var(--papel-hueso);
}

.tab--activo {
  color: var(--grafito);
  background: var(--blanco);
  box-shadow: inset 0 0 0 1px var(--borde);
}

.tab--cta {
  background: var(--sidra);
  color: #fff;
  font-weight: 600;
  padding: 0.5rem 1rem;
  margin-left: 0.25rem;
}

.tab--cta:hover {
  background: var(--sidra-hover);
  color: #fff;
}

.selector {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
}

.select {
  appearance: none;
  font-family: inherit;
  font-size: var(--paso-1);
  font-weight: 500;
  color: var(--grafito);
  background-color: var(--blanco);
  background-image:
    linear-gradient(45deg, transparent 50%, var(--grafito-suave) 50%),
    linear-gradient(135deg, var(--grafito-suave) 50%, transparent 50%);
  background-position:
    calc(100% - 16px) 55%,
    calc(100% - 11px) 55%;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  border: 1px solid var(--borde);
  border-radius: var(--radio-pill);
  padding: 0.5rem 2.15rem 0.5rem 1rem;
  min-width: 11.5rem;
  cursor: pointer;
  transition: border-color var(--transicion), box-shadow var(--transicion);
}

.select:hover {
  border-color: color-mix(in srgb, var(--pizarra) 40%, var(--borde));
}

.select:focus {
  outline: none;
  border-color: var(--sidra);
  box-shadow: 0 0 0 3px var(--sidra-clara);
}

@media (max-width: 900px) {
  .fila {
    grid-template-columns: 1fr;
    padding-block: 1rem 1.15rem;
    gap: 0.95rem;
  }

  .logo { grid-column: 1 / -1; }

  .tabs {
    grid-column: 1 / -1;
    justify-content: flex-start;
    gap: 0.35rem;
  }

  .selector {
    grid-column: 1 / -1;
  }

  .select {
    width: 100%;
    min-width: 0;
    padding: 0.7rem 2.3rem 0.7rem 1.05rem;
  }

  .tab { padding: 0.45rem 0.75rem; }
  .tab--cta { margin-left: 0; }
}
</style>

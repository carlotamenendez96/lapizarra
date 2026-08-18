<script setup lang="ts">
const props = defineProps<{
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

const abierto = ref(false)
const raiz = ref<HTMLElement | null>(null)
const boton = ref<HTMLButtonElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuEstilo = ref<Record<string, string>>({})

const etiqueta = computed(() => {
  if (!seleccion.value) return 'Toda Asturias'
  const ciudad = props.ciudades?.find((c) => c.city_slug === seleccion.value)
  return ciudad ? `${ciudad.city} (${ciudad.total})` : 'Toda Asturias'
})

function colocarMenu() {
  const el = boton.value
  if (!el) return
  const caja = el.getBoundingClientRect()
  menuEstilo.value = {
    top: `${Math.round(caja.bottom + 8)}px`,
    left: `${Math.round(caja.left)}px`,
    width: `${Math.round(caja.width)}px`,
  }
}

function alternar() {
  if (abierto.value) {
    abierto.value = false
    return
  }
  colocarMenu()
  abierto.value = true
}

function elegir(slug: string) {
  seleccion.value = slug
  abierto.value = false
}

function alClicFuera(evento: PointerEvent) {
  const nodo = evento.target as Node
  if (raiz.value?.contains(nodo) || menuEl.value?.contains(nodo)) return
  abierto.value = false
}

function alTecla(evento: KeyboardEvent) {
  if (evento.key === 'Escape') abierto.value = false
}

watch(() => route.fullPath, () => {
  abierto.value = false
})

onMounted(() => {
  document.addEventListener('pointerdown', alClicFuera)
  document.addEventListener('keydown', alTecla)
  window.addEventListener('resize', colocarMenu)
  window.addEventListener('scroll', colocarMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', alClicFuera)
  document.removeEventListener('keydown', alTecla)
  window.removeEventListener('resize', colocarMenu)
  window.removeEventListener('scroll', colocarMenu, true)
})
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
          Apunta tu bar
        </a>
      </nav>

      <div v-if="ciudades?.length" ref="raiz" class="selector">
        <button
          id="selector-ciudad"
          ref="boton"
          type="button"
          class="select"
          :class="{ 'select--abierto': abierto }"
          aria-label="Ciudad"
          aria-haspopup="listbox"
          :aria-expanded="abierto"
          aria-controls="lista-ciudades"
          @click="alternar"
        >
          <span class="select-texto">{{ etiqueta }}</span>
        </button>
        <Teleport to="body">
          <ul
            v-show="abierto"
            id="lista-ciudades"
            ref="menuEl"
            class="menu-ciudad"
            role="listbox"
            aria-labelledby="selector-ciudad"
            :style="menuEstilo"
          >
            <li role="option" :aria-selected="!seleccion">
              <button type="button" class="opcion" :class="{ 'opcion--activa': !seleccion }" @click="elegir('')">
                <span class="check" aria-hidden="true">{{ !seleccion ? '✓' : '' }}</span>
                Toda Asturias
              </button>
            </li>
            <li v-for="c in ciudades" :key="c.city_slug" role="option" :aria-selected="seleccion === c.city_slug">
              <button
                type="button"
                class="opcion"
                :class="{ 'opcion--activa': seleccion === c.city_slug }"
                @click="elegir(c.city_slug)"
              >
                <span class="check" aria-hidden="true">{{ seleccion === c.city_slug ? '✓' : '' }}</span>
                {{ c.city }} ({{ c.total }})
              </button>
            </li>
          </ul>
        </Teleport>
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
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transicion), box-shadow var(--transicion);
}

.select-texto {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select:hover {
  border-color: color-mix(in srgb, var(--pizarra) 40%, var(--borde));
}

.select:focus,
.select--abierto {
  outline: none;
  border-color: var(--sidra);
  box-shadow: 0 0 0 3px var(--sidra-clara);
}

.menu-ciudad {
  position: fixed;
  z-index: 80;
  margin: 0;
  padding: 0.4rem;
  list-style: none;
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: 14px;
  box-shadow: var(--sombra);
}

.opcion {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-size: var(--paso-1);
  font-weight: 500;
  color: var(--grafito);
  background: transparent;
  border: 0;
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  cursor: pointer;
}

.opcion:hover { background: var(--papel-hueso); }

.opcion--activa { font-weight: 600; }

.check {
  width: 1rem;
  flex: none;
  color: var(--sidra);
  font-size: 0.85rem;
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

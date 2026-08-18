<script setup lang="ts">
const props = defineProps<{
  /** Nombre bonito de la ciudad ("Gijón"). Si no se pasa, el mensaje es genérico. */
  ciudad?: string
}>()

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')

const lugar = computed(() => props.ciudad ? `en ${props.ciudad}` : 'en Asturias')

const mensaje = computed(() =>
  `¡Oye! ¿Sabéis que existe La Pizarrina? Muestra el menú del día de bares ${lugar.value} — solo hay que mandar una foto de la pizarra cada mañana y es gratis. Me gustaría poder ver el vuestro 😊 ${siteUrl}/como-funciona`,
)

const estado = ref<'idle' | 'compartido' | 'copiado'>('idle')

async function pedir() {
  if (typeof navigator === 'undefined') return

  if (navigator.share) {
    try {
      await navigator.share({ text: mensaje.value })
      estado.value = 'compartido'
    } catch {
      /* El usuario cerró el share-sheet sin compartir — no hacemos nada */
      return
    }
  } else {
    try {
      await navigator.clipboard.writeText(mensaje.value)
      estado.value = 'copiado'
    } catch {
      /* Fallback: abrimos WhatsApp web directamente */
      window.open(`https://wa.me/?text=${encodeURIComponent(mensaje.value)}`, '_blank', 'noopener')
      return
    }
  }

  setTimeout(() => { estado.value = 'idle' }, 3500)
}
</script>

<template>
  <div class="pidelo" role="complementary" aria-label="Invitar a un bar">
    <div class="pidelo-icono" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>

    <div class="pidelo-texto">
      <p class="pidelo-titular">¿No encuentras tu bar favorito?</p>
      <p class="pidelo-sub">
        Mándaselo para que salga en la web — solo tarda un minuto.
      </p>
    </div>

    <button
      type="button"
      class="pidelo-boton"
      :class="{ 'pidelo-boton--ok': estado !== 'idle' }"
      :disabled="estado !== 'idle'"
      @click="pedir"
    >
      <span v-if="estado === 'idle'" class="pidelo-boton-inner">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Pídeselo a tu bar
      </span>
      <span v-else-if="estado === 'copiado'" class="pidelo-boton-inner">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Mensaje copiado
      </span>
      <span v-else class="pidelo-boton-inner">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        ¡Listo!
      </span>
    </button>
  </div>
</template>

<style scoped>
.pidelo {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.3rem 1.15rem;
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  box-shadow: var(--sombra-suave);
}

.pidelo-icono {
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  display: grid;
  place-items: center;
  border-radius: var(--radio-sm);
  background: var(--papel-hueso);
  color: var(--grafito-suave);
  border: 1px solid var(--borde);
}

.pidelo-texto {
  flex: 1;
  min-width: 0;
}

.pidelo-titular {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: var(--paso-1-arriba);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.pidelo-sub {
  margin: 0.25rem 0 0;
  font-size: var(--paso-1);
  color: var(--grafito-suave);
  line-height: 1.4;
}

.pidelo-boton {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.62rem 1.1rem;
  border: 0;
  border-radius: var(--radio-pill);
  background: var(--pizarra);
  color: var(--tiza);
  font-family: var(--texto);
  font-size: var(--paso-1);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transicion), transform var(--transicion);
}

.pidelo-boton:hover:not(:disabled) {
  background: var(--pizarra-claro);
  transform: translateY(-1px);
}

.pidelo-boton--ok {
  background: color-mix(in srgb, var(--pizarra) 70%, var(--sidra));
  cursor: default;
}

.pidelo-boton-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

@media (max-width: 580px) {
  .pidelo {
    flex-wrap: wrap;
    gap: 0.85rem;
  }

  .pidelo-boton {
    width: 100%;
    justify-content: center;
  }
}
</style>

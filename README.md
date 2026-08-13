# La Pizarra — web pública

Web de menús del día de Asturias. Nuxt 4 con renderizado en servidor (SSR),
que lee de Supabase y muestra la foto de la pizarra que cada hostelero
manda por Telegram.

## Por qué Nuxt y no una SPA de Vue

Es la decisión que condiciona todo el SEO. Una SPA normal entrega a Google
un HTML vacío que se rellena después con JavaScript: aunque hoy Google
sepa ejecutar JS, lo hace más tarde, peor y sin garantías. Con SSR, el
HTML sale del servidor ya con los nombres de los restaurantes, precios y
datos estructurados dentro — que es justo lo que hace falta para pelear
por "menú del día Gijón".

## Estructura

```
app/
├── pages/
│   ├── index.vue                  # home: menús de hoy en toda Asturias
│   ├── menu-del-dia/[ciudad].vue  # LA página de posicionamiento
│   └── restaurante/[slug].vue     # ficha con foto grande y contacto
├── components/                    # cabecera, pie, tarjeta, rejilla+buscador
├── plugins/preconnect.server.ts   # abre la conexión a Storage antes de tiempo
└── assets/css/main.css            # sistema de diseño (tokens)
server/
├── api/                           # los datos se piden desde el servidor
├── routes/sitemap.xml.get.ts      # sitemap generado desde la BD
├── routes/robots.txt.get.ts
└── utils/supabase.ts              # llamadas RPC a Supabase
migration-web.sql                  # ejecutar en Supabase ANTES de arrancar
```

## Puesta en marcha

### 1. Migración en Supabase

Pega `migration-web.sql` entero en el SQL editor y ejecútalo. Crea:

- **`slug`** en `venues` + trigger que lo genera solo (`casa-pepe-gijon`).
  Nunca uses el UUID en una URL pública: Google valora una URL legible con
  la palabra clave dentro.
- **`photo_thumb_url` / `photo_thumb_path`** en `menus` (ver más abajo).
- Las funciones que consume la web: `search_active_menus`,
  `cities_with_menus`, `venue_by_slug`, `all_active_venues`.
- Arregla `daily_menus_to_cleanup` para que borre también las miniaturas
  (antes se quedaban huérfanas en Storage ocupando sitio).

Después, **vuelve a desplegar la función `telegram-webhook`** con la
versión del zip: es la que rellena las miniaturas.

### 2. Variables de entorno

Copia `.env.example` a `.env`:

```
SUPABASE_URL=https://oeuobixauwbdfuinmhvy.supabase.co
SUPABASE_ANON_KEY=<tu publishable key>
SITE_URL=https://lapizarra.es
```

La clave pública (`anon`/`publishable`) es de solo lectura y las tablas
están protegidas por RLS, así que no hay riesgo en usarla. Aun así, la web
**nunca** habla con Supabase desde el navegador: todo pasa por
`server/api/`, así el cliente no descarga el SDK y las respuestas se
pueden cachear.

### 3. Local

```bash
npm install
npm run dev
```

### 4. Desplegar

Vercel es lo más directo para Nuxt (detecta el framework solo). Conecta el
repositorio y define las tres variables de entorno en el panel.

**Importante**: Nuxt congela `runtimeConfig` al compilar, así que si tu
hosting define las variables después del build, se quedarían vacías. El
código ya lleva un fallback a `process.env` en caliente para evitarlo, de
modo que funcionan tanto `SUPABASE_URL` como `NUXT_SUPABASE_URL`.

Tras el primer despliegue: da de alta el dominio en **Google Search
Console** y envía `https://tudominio.es/sitemap.xml`. Sin esto, Google
tarda semanas en descubrirte; con esto, días.

## Cómo está montado el SEO

| Pieza | Dónde | Para qué |
|---|---|---|
| URLs con palabra clave | `/menu-del-dia/gijon` | Es literalmente lo que se busca |
| `<h1>` único por página | "Menú del día en Gijón" | La señal más fuerte de la página |
| Meta description dinámica | Con el número real de sitios | Sube el CTR en resultados |
| `canonical` | Todas las páginas | Evita contenido duplicado |
| JSON-LD `Restaurant` | Ficha y listados | Opta a resultados enriquecidos |
| JSON-LD `ItemList` | Página de ciudad | Google entiende que es un listado |
| `BreadcrumbList` | Ciudad y ficha | Muestra la ruta bajo el resultado |
| Sitemap desde la BD | `/sitemap.xml` | Los locales nuevos se descubren solos |
| Enlazado interno | Pie + "otras ciudades" | Reparte autoridad entre las páginas |
| Texto real bajo el listado | Página de ciudad | Las fotos no las lee Google |

### El límite que conviene tener claro

Los menús son **fotos**, y Google no lee el texto que hay dentro de una
imagen. El contenido indexable de hoy son nombres, direcciones, ciudades y
precios: suficiente para posicionar *"menú del día Gijón"*, pero no para
*"dónde comer fabada hoy en Gijón"*.

Ahí es donde el OCR deja de ser un extra y pasa a ser la palanca de
crecimiento: en cuanto los platos estén en texto (tablas `dishes` e
`ingredients`, ya creadas), se abre toda la cola larga de búsquedas, que
es donde está el volumen de verdad y donde no hay competencia.

## Rendimiento

- **SSR + `swr: 300`**: las páginas se sirven cacheadas y se regeneran por
  detrás cada 5 minutos. Un menú nuevo aparece rápido sin que cada visita
  golpee la base de datos.
- **Dos tamaños de foto**: las transformaciones de imagen de Supabase son
  solo de plan de pago, así que no se puede redimensionar al vuelo. Como
  Telegram ya manda la foto en varias resoluciones, se guarda una ligera
  para las tarjetas y la grande solo para la ficha. Gratis y efectivo.
- **`width`/`height` + `aspect-ratio`** en todas las imágenes del listado:
  el hueco se reserva antes de que llegue la foto, así la página no salta
  (CLS = 0, que es factor de posicionamiento).
- **`fetchpriority="high"`** en las 4 primeras tarjetas y `lazy` en el
  resto: la primera pantalla entra antes.
- **Sin SDK de Supabase en el navegador**: menos JavaScript que descargar.

## Diseño

La marca es la pizarra, así que ahí va todo el carácter: bandas de
pizarrín con grano de tiza (generado en CSS, sin imágenes), la fecha de
hoy escrita en cursiva y las chapas de precio como tiza sobre slate. El
resto es papel limpio para que las fotos de los menús manden.

- **Color**: pizarrín `#1E2B2A`, tiza `#EFEAD8`, papel `#FCFBF7`, dorado
  sidra `#B8801F`, verde manzana `#4A7150`.
- **Tipografía**: Fraunces (titulares), Instrument Sans (texto), DM Mono
  (precios y datos).
- **Logo**: una pizarra en miniatura dibujada en CSS. Sin archivo, sin
  petición extra.

Responsive, foco visible por teclado y `prefers-reduced-motion`
respetado.

## Pendiente a futuro

- Filtros por ingrediente (cuando esté el OCR).
- Geolocalización "cerca de mí" — `lat`/`lng` ya están en `venues`, solo
  hay que rellenarlos.
- Página por barrio (`/menu-del-dia/gijon/centro`) si algún día hay
  suficientes locales para que tenga sentido.

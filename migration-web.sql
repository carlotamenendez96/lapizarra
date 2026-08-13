-- =====================================================================
-- La Pizarra — soporte para la web pública (SEO)
-- Ejecutar entero en el SQL editor de Supabase.
-- =====================================================================

create extension if not exists unaccent;

-- ---------------------------------------------------------------------
-- 1. Slugs: URLs limpias tipo /restaurante/casa-pepe-gijon
--    Google valora una URL legible y con la keyword; nunca uses el UUID.
-- ---------------------------------------------------------------------
create or replace function public.slugify(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(public.unaccent(p_text)), '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

alter table public.venues add column if not exists slug text;

-- Genera el slug a partir del nombre + ciudad, y le añade un sufijo
-- numérico si ya existe otro local con el mismo (ej. dos "Casa Pepe"
-- en Gijón -> casa-pepe-gijon y casa-pepe-gijon-2).
create or replace function public.venues_set_slug()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  base_slug text;
  final_slug text;
  suffix int := 1;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;

  base_slug := public.slugify(new.name || '-' || new.city);
  final_slug := base_slug;

  while exists (select 1 from public.venues where slug = final_slug and id <> new.id) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$;

drop trigger if exists trg_venues_set_slug on public.venues;
create trigger trg_venues_set_slug
  before insert or update of name, city on public.venues
  for each row execute function public.venues_set_slug();

-- Rellena los slugs de los locales que ya existían antes de este cambio
update public.venues set slug = null where slug is null;
update public.venues v set slug = sub.new_slug
from (
  select id,
         public.slugify(name || '-' || city) ||
           case when row_number() over (partition by public.slugify(name || '-' || city) order by created_at) > 1
                then '-' || row_number() over (partition by public.slugify(name || '-' || city) order by created_at)::text
                else '' end as new_slug
  from public.venues
) sub
where v.id = sub.id and v.slug is null;

alter table public.venues alter column slug set not null;
create unique index if not exists idx_venues_slug on public.venues (slug);

-- ---------------------------------------------------------------------
-- 2. Miniaturas
--    Las transformaciones de imagen de Supabase son solo de plan de pago,
--    así que NO se puede redimensionar al vuelo. La solución gratis:
--    Telegram ya envía la misma foto en varias resoluciones, así que
--    guardamos dos — una ligera para el listado y la grande para el
--    detalle. Es lo que hace que la home cargue rápido.
-- ---------------------------------------------------------------------
alter table public.menus add column if not exists photo_thumb_url text;
alter table public.menus add column if not exists photo_thumb_path text;

comment on column public.menus.photo_thumb_url is 'Versión ligera de la foto para las tarjetas del listado. La grande (photo_url) solo se carga en la ficha del restaurante.';

-- La limpieza diaria tiene que borrar también la miniatura, si no se
-- quedarían huérfanas en Storage acumulando espacio.
drop function if exists public.daily_menus_to_cleanup(date);

create or replace function public.daily_menus_to_cleanup(
  p_before_date date default current_date
)
returns table (menu_id uuid, photo_path text, photo_thumb_path text)
language sql
stable
security invoker
set search_path = ''
as $$
  select id, photo_path, photo_thumb_path
  from public.menus
  where type = 'daily'
    and date < p_before_date
    and photo_deleted = false
    and photo_path is not null;
$$;

-- ---------------------------------------------------------------------
-- 3. Buscador público: locales con menú vigente hoy
--    Sustituye a la versión anterior de search_active_menus (cambia lo
--    que devuelve, por eso hay que borrarla primero).
-- ---------------------------------------------------------------------
drop function if exists public.search_active_menus(text, date);

create or replace function public.search_active_menus(
  p_city text default null,
  p_date date default current_date
)
returns table (
  venue_id      uuid,
  slug          text,
  venue_name    text,
  address       text,
  neighborhood  text,
  city          text,
  lat           double precision,
  lng           double precision,
  contact_phone text,
  schedule      text,
  menu_id       uuid,
  photo_url     text,
  thumb_url     text,
  price         numeric,
  price_text    text,
  updated_at    timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    v.id, v.slug, v.name, v.address, v.neighborhood, v.city, v.lat, v.lng,
    v.contact_phone, v.schedule,
    m.id, m.photo_url, coalesce(m.photo_thumb_url, m.photo_url), m.price, m.price_text, m.updated_at
  from public.venues v
  join public.menus m on m.id = public.get_active_menu_for_venue(v.id, p_date)
  where v.active = true
    and (p_city is null or public.slugify(v.city) = public.slugify(p_city))
    and coalesce(m.photo_deleted, false) = false
    and m.photo_url is not null
  order by v.name;
$$;

-- Ciudades que tienen al menos un menú hoy — para el selector y el sitemap
create or replace function public.cities_with_menus(
  p_date date default current_date
)
returns table (city text, city_slug text, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select v.city, public.slugify(v.city), count(*)
  from public.venues v
  join public.menus m on m.id = public.get_active_menu_for_venue(v.id, p_date)
  where v.active = true
    and coalesce(m.photo_deleted, false) = false
    and m.photo_url is not null
  group by v.city
  order by count(*) desc, v.city;
$$;

-- Ficha de un restaurante concreto por slug (tenga o no menú hoy: la
-- página debe existir siempre, si no perderías la URL indexada cada día
-- que no publiquen menú).
create or replace function public.venue_by_slug(
  p_slug text,
  p_date date default current_date
)
returns table (
  venue_id      uuid,
  slug          text,
  venue_name    text,
  address       text,
  neighborhood  text,
  city          text,
  lat           double precision,
  lng           double precision,
  contact_phone text,
  schedule      text,
  menu_id       uuid,
  photo_url     text,
  price         numeric,
  price_text    text,
  updated_at    timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    v.id, v.slug, v.name, v.address, v.neighborhood, v.city, v.lat, v.lng,
    v.contact_phone, v.schedule,
    m.id, m.photo_url, m.price, m.price_text, m.updated_at
  from public.venues v
  left join public.menus m
    on m.id = public.get_active_menu_for_venue(v.id, p_date)
   and coalesce(m.photo_deleted, false) = false
  where v.active = true and v.slug = p_slug;
$$;

-- Todos los locales activos, para generar el sitemap.xml
create or replace function public.all_active_venues()
returns table (slug text, city text, updated_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select slug, city, updated_at from public.venues where active = true order by city, name;
$$;

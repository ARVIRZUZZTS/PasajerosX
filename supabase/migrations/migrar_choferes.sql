CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TYPE public.user_info_atributo AS ENUM (
  'licencia','flotas','planillear','choferes','reportes','asignacion a montero'
);

CREATE TABLE IF NOT EXISTS public.user_info (
  id_user_info integer NOT NULL DEFAULT nextval('user_info_id_user_info_seq'::regclass),
  id_user integer NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
  atributo public.user_info_atributo NOT NULL,
  value character varying(20),
  PRIMARY KEY (id_user_info),
  UNIQUE (id_user, atributo)
);

CREATE INDEX IF NOT EXISTS user_info_id_user_idx ON public.user_info (id_user);

CREATE TABLE IF NOT EXISTS public.stg_choferes_raw (
  id bigserial PRIMARY KEY,
  nombre_raw text,
  licencia_raw text
);

CREATE TABLE IF NOT EXISTS public.stg_choferes_norm AS
SELECT
  id,
  trim(regexp_replace(coalesce(nombre_raw, ''), '\s+', ' ', 'g')) AS nombre_raw,
  NULLIF(NULLIF(trim(coalesce(licencia_raw, '')), ''), '0') AS licencia_raw
FROM public.stg_choferes_raw
WHERE NULLIF(trim(coalesce(nombre_raw, '')), '') IS NOT NULL
  AND upper(trim(nombre_raw)) NOT IN ('-', 'NULL', 'N/A');

CREATE TABLE IF NOT EXISTS public.stg_choferes_dedup AS
SELECT DISTINCT ON (lower(unaccent(trim(nombre_raw))))
  id,
  trim(regexp_replace(coalesce(nombre_raw, ''), '\s+', ' ', 'g')) AS nombre_norm,
  NULLIF(NULLIF(trim(coalesce(licencia_raw, '')), ''), '0') AS licencia_norm
FROM public.stg_choferes_norm
ORDER BY lower(unaccent(trim(nombre_raw))), id;

INSERT INTO public.usuarios (nombre, rol, estado, sucursal, contraseña, sincronizado, cambio_contra)
SELECT
  d.nombre_norm,
  'Chofer Principal',
  'activo',
  3,
  '123456',
  1,
  false
FROM public.stg_choferes_dedup d
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios u
  WHERE lower(unaccent(trim(u.nombre))) = lower(unaccent(trim(d.nombre_norm)))
);

INSERT INTO public.user_info (id_user, atributo, value)
SELECT
  u.id_usuario,
  'licencia'::public.user_info_atributo,
  d.licencia_norm
FROM public.stg_choferes_dedup d
JOIN public.usuarios u
  ON lower(unaccent(trim(u.nombre))) = lower(unaccent(trim(d.nombre_norm)))
WHERE d.licencia_norm IS NOT NULL
  AND d.licencia_norm ~ '^[0-9]{7,}$'
ON CONFLICT (id_user, atributo) DO UPDATE
SET value = EXCLUDED.value;

SELECT 'usuarios_choferes' AS metric, count(*) AS total
FROM public.usuarios
WHERE rol ILIKE 'Chofer%';

SELECT 'user_info_licencias' AS metric, count(*) AS total
FROM public.user_info
WHERE atributo = 'licencia';

SELECT u.id_usuario, u.nombre
FROM public.usuarios u
LEFT JOIN public.user_info i ON i.id_user = u.id_usuario AND i.atributo = 'licencia'
WHERE u.rol ILIKE 'Chofer%' AND i.id_user IS NULL;

SELECT upper(trim(nombre)) AS nombre_norm, count(*) AS total
FROM public.usuarios
GROUP BY upper(trim(nombre))
HAVING count(*) > 1;

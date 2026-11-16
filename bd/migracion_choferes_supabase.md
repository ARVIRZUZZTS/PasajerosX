# Migracion choferes local <-> Supabase

## Objetivo
- Supabase: usuarios + user_info (licencia y atributos).
- Local: tabla chofer (nombre_chofer, licencia).
- Sincronizar solo usuarios con rol Chofer Principal o Chofer Auxiliar.

## Tabla user_info (Supabase)
```sql
CREATE TYPE public.user_info_atributo AS ENUM (
  'licencia','flotas','planillear','choferes','reportes','asignacion a montero'
);

CREATE TABLE public.user_info (
  id_user_info integer NOT NULL DEFAULT nextval('user_info_id_user_info_seq'::regclass),
  id_user integer NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
  atributo public.user_info_atributo NOT NULL,
  value character varying(20),
  PRIMARY KEY (id_user_info),
  UNIQUE (id_user, atributo)
);
```

## Migracion SQL
- Archivo: supabase/migrations/migrar_choferes.sql
- Incluye staging, normalizacion, dedup, insert usuarios, upsert licencia, validaciones.

## Reglas de normalizacion
- trim, colapsar espacios, uppercase, unaccent.
- licencia vacia o 0 -> NULL.
- licencia valida: numerica y al menos 7 digitos.
- multiples licencias: usar la mas reciente.

## Reglas especificas
- Arcenio Caballero V. y Jhory Aviles: misma licencia 3567742.
- Victor Hugo: usar VELASCO, no VELARSCO.
- Demetrio en flota es truncado de DEMETRIO GALINDO MERIDA.
- Hugo duplicado eliminado en Supabase.
- Gabriel Rene Moreno se mantiene en Supabase y se descarga a local.

## Configuracion de peticiones
- Tabla: bd/config_peticiones.sql
- Endpoint: php/config/getConfigPeticiones.php
- Panel dev: js/configPeticiones.js (Ctrl+Shift+P)

## Validaciones
- conteos por etapa.
- usuarios chofer sin licencia.
- user_info huerfano.
- duplicados por nombre.
- idempotencia (0 pendientes en segunda ejecucion).

## Riesgos
- schema drift de flota.marca.
- licencias cruzadas.
- anon key en .env.
- polling sin config -> default 10s.

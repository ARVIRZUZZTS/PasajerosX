-- Migration: reservas por reporte + boleteria + sync (Supabase/Postgres)
-- Sucursal se mantiene tal cual (sin cambios).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- user_info type (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_info_atributo') THEN
    CREATE TYPE public.user_info_atributo AS ENUM (
      'licencia','flotas','planillear','choferes','reportes','asignacion a montero','boleteria','asignacion_boletero','color_1','color_2','color_texto'
    );
  ELSE
    ALTER TYPE public.user_info_atributo ADD VALUE IF NOT EXISTS 'boleteria';
    ALTER TYPE public.user_info_atributo ADD VALUE IF NOT EXISTS 'asignacion_boletero';
    ALTER TYPE public.user_info_atributo ADD VALUE IF NOT EXISTS 'color_1';
    ALTER TYPE public.user_info_atributo ADD VALUE IF NOT EXISTS 'color_2';
    ALTER TYPE public.user_info_atributo ADD VALUE IF NOT EXISTS 'color_texto';
  END IF;
END$$;

-- user_info table (si no existe)
CREATE TABLE IF NOT EXISTS public.user_info (
  id_user_info integer NOT NULL DEFAULT nextval('user_info_id_user_info_seq'::regclass),
  id_user integer NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
  atributo public.user_info_atributo NOT NULL,
  value character varying(20),
  PRIMARY KEY (id_user_info),
  UNIQUE (id_user, atributo)
);
CREATE INDEX IF NOT EXISTS user_info_id_user_idx ON public.user_info (id_user);

-- flota: sin sucursal (global)
-- (no ALTER sucursal)

-- reportes (sin marca, sin reservas boolean, fecha varchar, carril sin default)
CREATE TABLE IF NOT EXISTS public.reportes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  local_codr integer,
  fecha character varying(10),
  destino character varying(100),
  placa character varying(20),
  hora character varying(10),
  carril character varying(3),
  con1 character varying(150),
  lic1 character varying(20),
  con2 character varying(150),
  lic2 character varying(20),
  ayudante character varying(150),
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (sucursal, local_codr)
);
CREATE INDEX IF NOT EXISTS reportes_sucursal_idx ON public.reportes (sucursal);
CREATE INDEX IF NOT EXISTS reportes_updated_idx ON public.reportes (updated_at);

-- reservas (reemplaza asientos_bloqueados)
CREATE TABLE IF NOT EXISTS public.reservas (
  id_reserva uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  reporte_id uuid REFERENCES public.reportes(id) ON DELETE CASCADE,
  asientos_reservados integer[],
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reservas_reporte_idx ON public.reservas (reporte_id);


-- reporte_pasajeros (sin fecha/destino)
CREATE TABLE IF NOT EXISTS public.reporte_pasajeros (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  reporte_id uuid REFERENCES public.reportes(id) ON DELETE CASCADE,
  local_codp integer,
  nombre character varying(150),
  ci character varying(20),
  precio numeric,
  asiento integer,
  boletero_id integer REFERENCES public.usuarios(id_usuario),
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (sucursal, local_codp)
);
CREATE INDEX IF NOT EXISTS reporte_pasajeros_reporte_idx ON public.reporte_pasajeros (reporte_id);

-- asignacion_boletero
CREATE TABLE IF NOT EXISTS public.asignacion_boletero (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  reporte_id uuid NOT NULL REFERENCES public.reportes(id) ON DELETE CASCADE,
  boletero_id integer NOT NULL REFERENCES public.usuarios(id_usuario),
  estado character varying(20) DEFAULT 'activo',
  asientos_asignados integer[],
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (reporte_id, boletero_id)
);

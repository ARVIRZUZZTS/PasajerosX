-- Migration: reservas por reporte + boleteria + sync (Supabase/Postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.sucursal
  ADD COLUMN IF NOT EXISTS reservas boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS zona_reserva character varying,
  ADD COLUMN IF NOT EXISTS asientos_reservados integer[];

UPDATE public.sucursal SET reservas = false WHERE id_sucursal = 1;
UPDATE public.sucursal SET reservas = true, zona_reserva = 'Montero' WHERE id_sucursal = 2;

ALTER TABLE public.flota
  ADD COLUMN IF NOT EXISTS sucursal integer REFERENCES public.sucursal(id_sucursal) DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.reportes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  local_codr integer,
  fecha date,
  destino character varying(100),
  placa character varying(20),
  hora character varying(10),
  carril character varying(3) DEFAULT '5',
  con1 character varying(150),
  lic1 character varying(20),
  con2 character varying(150),
  lic2 character varying(20),
  ayudante character varying(150),
  marca character varying(100),
  reservas boolean DEFAULT false,
  zona_reserva character varying(50),
  asientos_reservados integer[],
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (sucursal, local_codr)
);
CREATE INDEX IF NOT EXISTS reportes_sucursal_idx ON public.reportes (sucursal);
CREATE INDEX IF NOT EXISTS reportes_updated_idx ON public.reportes (updated_at);

CREATE TABLE IF NOT EXISTS public.reporte_pasajeros (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  reporte_id uuid REFERENCES public.reportes(id) ON DELETE CASCADE,
  local_codp integer,
  nombre character varying(150),
  ci character varying(20),
  fecha date,
  destino character varying(100),
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

CREATE TABLE IF NOT EXISTS public.asignacion_boletero (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  reporte_id uuid NOT NULL REFERENCES public.reportes(id) ON DELETE CASCADE,
  boletero_id integer NOT NULL REFERENCES public.usuarios(id_usuario),
  asignado_por integer REFERENCES public.usuarios(id_usuario),
  estado character varying(20) DEFAULT 'activo',
  notas text,
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (reporte_id, boletero_id)
);

CREATE TABLE IF NOT EXISTS public.asientos_bloqueados (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal integer NOT NULL REFERENCES public.sucursal(id_sucursal),
  reporte_id uuid NOT NULL REFERENCES public.reportes(id) ON DELETE CASCADE,
  asiento integer NOT NULL,
  motivo character varying(100),
  zona character varying(50),
  reservado_para character varying(50),
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (reporte_id, asiento)
);

-- Atributos adicionales para user_info
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_info_atributo') THEN
    CREATE TYPE public.user_info_atributo AS ENUM ('licencia','flotas','planillear','choferes','reportes','asignacion a montero','boleteria','asignacion_boletero');
  ELSE
    ALTER TYPE public.user_info_atributo ADD VALUE IF NOT EXISTS 'boleteria';
    ALTER TYPE public.user_info_atributo ADD VALUE IF NOT EXISTS 'asignacion_boletero';
  END IF;
END$$;

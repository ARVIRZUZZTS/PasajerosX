-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.viajebodega (
  viajeCod character varying NOT NULL,
  placa character varying,
  fecha character varying CHECK (length(fecha::text) <= 10),
  estado character varying,
  sucursal integer,
  CONSTRAINT viajebodega_pkey PRIMARY KEY (viajeCod)
);
CREATE TABLE public.encomiendabodega (
  conEnc character varying NOT NULL,
  viajeCod character varying,
  consignatario character varying,
  conTelf character varying,
  total numeric,
  estadoPaga character varying,
  bulto text,
  CONSTRAINT encomiendabodega_pkey PRIMARY KEY (conEnc),
  CONSTRAINT encomiendabodega_viajeCod_fkey FOREIGN KEY (viajeCod) REFERENCES public.viajebodega(viajeCod)
);
CREATE TABLE public.encomiendas_mobile (
  id integer NOT NULL DEFAULT nextval('encomiendas_mobile_id_seq'::regclass),
  remitente character varying NOT NULL,
  remtelf character varying NOT NULL,
  consignatario character varying NOT NULL,
  contelf character varying NOT NULL,
  primer_tramo integer,
  segundo_tramo integer,
  total numeric NOT NULL,
  bulto character varying,
  valdeclarado character varying DEFAULT 'No'::character varying,
  destino character varying NOT NULL,
  sucursal integer NOT NULL,
  estadopaga integer DEFAULT 1,
  fecha date,
  sincronizado boolean DEFAULT false,
  tipo_pago character varying DEFAULT 'efectivo'::character varying,
  registrador character varying,
  CONSTRAINT encomiendas_mobile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuarios (
  id_usuario integer NOT NULL DEFAULT nextval('usuarios_id_usuario_seq'::regclass),
  nombre character varying NOT NULL,
  rol character varying NOT NULL,
  estado character varying DEFAULT 'activo'::character varying,
  sucursal integer NOT NULL,
  contraseña character varying NOT NULL,
  creado timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  sincronizado smallint,
  cambio_contra boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.destinos (
  id integer NOT NULL DEFAULT nextval('destinos_id_seq'::regclass),
  nombre_destino character varying UNIQUE,
  tiene_tramos boolean DEFAULT false,
  sucursal integer DEFAULT 1,
  abrev character varying NOT NULL DEFAULT ''::character varying,
  informacion character varying NOT NULL DEFAULT ''::character varying,
  telefono character varying NOT NULL DEFAULT ''::character varying,
  sincronizado integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT destinos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sucursal (
  id_sucursal integer NOT NULL DEFAULT nextval('sucursal_id_sucursal_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sucursal_pkey PRIMARY KEY (id_sucursal)
);
CREATE TABLE public.planillas (
  nombre character varying NOT NULL,
  elementos jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT planillas_pkey PRIMARY KEY (nombre)
);
CREATE TABLE public.flota (
  placa character varying NOT NULL,
  propietario character varying,
  chofer1 integer,
  chofer2 integer,
  id_destino character varying,
  nombre_planilla character varying,
  tipo character varying NOT NULL DEFAULT 'Ok'::character varying,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  estado character varying,
  CONSTRAINT flota_pkey PRIMARY KEY (placa)
);
CREATE TABLE public.user_info (
  id_user_info integer NOT NULL DEFAULT nextval('user_info_id_user_info_seq'::regclass),
  id_user integer NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
  atributo character varying NOT NULL,
  value character varying(20),
  CONSTRAINT user_info_pkey PRIMARY KEY (id_user_info),
  UNIQUE (id_user, atributo)
);
CREATE TABLE public.reportes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sucursal integer NOT NULL,
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
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reportes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reservas (
  id_reserva uuid NOT NULL DEFAULT gen_random_uuid(),
  sucursal integer NOT NULL,
  reporte_id uuid,
  asientos_reservados integer[],
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reservas_pkey PRIMARY KEY (id_reserva)
);
CREATE TABLE public.reporte_pasajeros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sucursal integer NOT NULL,
  reporte_id uuid,
  local_codp integer,
  nombre character varying(150),
  ci character varying(20),
  precio numeric,
  asiento integer,
  boletero_id integer,
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reporte_pasajeros_pkey PRIMARY KEY (id)
);
CREATE TABLE public.asignacion_boletero (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sucursal integer NOT NULL,
  reporte_id uuid NOT NULL,
  boletero_id integer NOT NULL,
  estado character varying(20) DEFAULT 'activo',
  asientos_asignados integer[],
  sincronizado smallint DEFAULT 0,
  deleted boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT asignacion_boletero_pkey PRIMARY KEY (id)
);

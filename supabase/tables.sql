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
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.destinos (
  id integer NOT NULL DEFAULT nextval('destinos_id_seq'::regclass),
  nombre_destino character varying,
  tiene_tramos boolean DEFAULT false,
  sucursal integer DEFAULT 1,
  abrev character varying NOT NULL DEFAULT ''::character varying,
  informacion character varying NOT NULL DEFAULT ''::character varying,
  telefono character varying NOT NULL DEFAULT ''::character varying,
  sincronizado integer NOT NULL DEFAULT 1,
  CONSTRAINT destinos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sucursal (
  id_sucursal integer NOT NULL DEFAULT nextval('sucursal_id_sucursal_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT sucursal_pkey PRIMARY KEY (id_sucursal)
);
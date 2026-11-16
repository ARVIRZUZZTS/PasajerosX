-- Migracion v2: reservas por reporte + asignacion boleteros (alineado a Supabase)
-- Ejecutar sobre bd pasajerosp

-- 1. reporte: quitar marca/reservas/asientos/id_reserva, carril sin default
ALTER TABLE reporte
  DROP COLUMN IF EXISTS marca,
  DROP COLUMN IF EXISTS reservas,
  DROP COLUMN IF EXISTS zona_reserva,
  DROP COLUMN IF EXISTS asientos_reservados,
  DROP COLUMN IF EXISTS id_reserva,
  MODIFY COLUMN carril VARCHAR(3) NULL DEFAULT NULL;

-- 2. reservas (reemplaza asientos_bloqueados)
CREATE TABLE IF NOT EXISTS reservas (
  id_reserva VARCHAR(36) NOT NULL PRIMARY KEY,
  codR INT NOT NULL,
  asientos_reservados TEXT NULL,
  sucursal INT NOT NULL DEFAULT 1,
  sincronizado TINYINT(1) NOT NULL DEFAULT 0,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_reservas_codr (codR),
  CONSTRAINT fk_reservas_reporte FOREIGN KEY (codR) REFERENCES reporte(codR) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migrar datos existentes de asientos_bloqueados -> reservas
INSERT INTO reservas (id_reserva, codR, asientos_reservados, sucursal, sincronizado, deleted)
SELECT UUID(), ab.codR, GROUP_CONCAT(DISTINCT ab.asiento ORDER BY ab.asiento), ab.sucursal, 0, 0
FROM asientos_bloqueados ab
WHERE ab.deleted = 0
GROUP BY ab.codR, ab.sucursal
ON DUPLICATE KEY UPDATE asientos_reservados = VALUES(asientos_reservados);

-- 3. asignacion_boletero: quitar asignado_por/notas, agregar asientos_asignados
ALTER TABLE asignacion_boletero
  DROP COLUMN IF EXISTS asignado_por,
  DROP COLUMN IF EXISTS notas,
  ADD COLUMN asientos_asignados TEXT NULL,
  MODIFY COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'activo';

-- 4. flota: quitar sucursal (si existe)
ALTER TABLE flota
  DROP COLUMN IF EXISTS sucursal;

-- 5. (Opcional) eliminar asientos_bloqueados ya migrado
DROP TABLE IF EXISTS asientos_bloqueados;

-- 6. sync_state ya existe; no cambios

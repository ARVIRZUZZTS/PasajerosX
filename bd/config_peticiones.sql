CREATE TABLE IF NOT EXISTS config_peticiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pagina VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  intervalo_seg INT NOT NULL DEFAULT 10,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO config_peticiones (pagina, hora_inicio, hora_fin, intervalo_seg, activo)
VALUES
('menu', '00:00:00', '08:00:00', 30, 1),
('menu', '08:00:00', '12:00:00', 10, 1),
('menu', '12:00:00', '18:00:00', 5, 1),
('menu', '18:00:00', '23:59:59', 15, 1),
('ver', '00:00:00', '08:00:00', 30, 1),
('ver', '08:00:00', '12:00:00', 10, 1),
('ver', '12:00:00', '18:00:00', 5, 1),
('ver', '18:00:00', '23:59:59', 15, 1);

<?php
require_once __DIR__ . '/../conexion.php';

$pagina = $_GET['pagina'] ?? '';
$hora = $_GET['hora'] ?? date('H:i:s');

if (!in_array($pagina, ['menu', 'ver'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'pagina invalida']);
    exit;
}

$stmt = $conexion->prepare(
    "SELECT intervalo_seg FROM config_peticiones
     WHERE pagina = ? AND activo = 1
       AND hora_inicio <= ? AND hora_fin >= ?
     ORDER BY id DESC LIMIT 1"
);
$stmt->bind_param('sss', $pagina, $hora, $hora);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();

$intervalo = $row ? (int)$row['intervalo_seg'] : 10;
if ($intervalo < 1) $intervalo = 10;

header('Content-Type: application/json');
echo json_encode(['pagina' => $pagina, 'hora' => $hora, 'intervalo_seg' => $intervalo]);

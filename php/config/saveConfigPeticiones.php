<?php
require_once __DIR__ . '/../conexion.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method not allowed']);
    exit;
}

$action = $_POST['action'] ?? 'save';
if ($action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'id invalido']);
        exit;
    }
    $stmt = $conexion->prepare('DELETE FROM config_peticiones WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

$pagina = $_POST['pagina'] ?? '';
$hora_inicio = $_POST['hora_inicio'] ?? '';
$hora_fin = $_POST['hora_fin'] ?? '';
$intervalo_seg = (int)($_POST['intervalo_seg'] ?? 10);
$activo = isset($_POST['activo']) ? (int)$_POST['activo'] : 1;
$id = (int)($_POST['id'] ?? 0);

if (!in_array($pagina, ['menu', 'ver'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'pagina invalida']);
    exit;
}
if ($intervalo_seg < 1) $intervalo_seg = 10;
if ($activo !== 0 && $activo !== 1) $activo = 1;

if ($id > 0) {
    $stmt = $conexion->prepare(
        'UPDATE config_peticiones SET pagina=?, hora_inicio=?, hora_fin=?, intervalo_seg=?, activo=? WHERE id=?'
    );
    $stmt->bind_param('sssiii', $pagina, $hora_inicio, $hora_fin, $intervalo_seg, $activo, $id);
    $stmt->execute();
    echo json_encode(['success' => true, 'id' => $id]);
    exit;
}

$stmt = $conexion->prepare(
    'INSERT INTO config_peticiones (pagina, hora_inicio, hora_fin, intervalo_seg, activo) VALUES (?,?,?,?,?)'
);
$stmt->bind_param('sssii', $pagina, $hora_inicio, $hora_fin, $intervalo_seg, $activo);
$stmt->execute();
echo json_encode(['success' => true, 'id' => $conexion->insert_id]);

<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../common/env.php';
require_once __DIR__ . '/../common/supabase.php';

header('Content-Type: application/json');

// Agrupar filas de planilla por nombre
$res = mysqli_query($conexion, "SELECT * FROM planilla ORDER BY nombre, id");
$groups = [];
while ($r = mysqli_fetch_assoc($res)) {
    $groups[$r['nombre']][] = [
        'id' => (int)$r['id'],
        'nombre' => $r['nombre'],
        'tipo' => $r['tipo'],
        'numAs' => (int)$r['numAs'],
        'posX' => (int)$r['posX'],
        'posY' => (int)$r['posY'],
        'estado' => (int)$r['estado']
    ];
}

$rows = [];
foreach ($groups as $nombre => $elems) {
    $rows[] = [
        'nombre' => $nombre,
        'elementos' => $elems,
        'deleted' => false
    ];
}

if (empty($rows)) {
    echo json_encode(['pushed' => 0]);
    exit;
}

[$code, $data] = supabase_request('POST', 'planillas', $rows, 'on_conflict=nombre', 'return=representation,resolution=merge-duplicates');

if ($code >= 200 && $code < 300) {
    echo json_encode(['pushed' => count($rows)]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase error', 'code' => $code, 'detail' => $data]);
}
$conexion->close();
?>

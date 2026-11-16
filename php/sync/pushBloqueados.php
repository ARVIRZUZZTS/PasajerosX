<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../common/env.php';
require_once __DIR__ . '/../common/supabase.php';

header('Content-Type: application/json');

$sucursal = (int)env('SUCURSAL', 1);

$res = mysqli_query($conexion, "SELECT * FROM asientos_bloqueados WHERE sucursal = $sucursal AND sincronizado = 0 AND deleted = 0");
$rows = [];
while ($r = mysqli_fetch_assoc($res)) {
    // buscar reporte_id en Supabase
    [$c, $d] = supabase_request('GET', 'reportes', null, 'sucursal=eq.' . (int)$r['sucursal'] . '&local_codr=eq.' . (int)$r['codR'] . '&select=id');
    $reporteId = (is_array($d) && isset($d[0]['id'])) ? $d[0]['id'] : null;
    if (!$reporteId) continue;
    $rows[] = [
        'sucursal' => (int)$r['sucursal'],
        'reporte_id' => $reporteId,
        'asiento' => (int)$r['asiento'],
        'motivo' => $r['motivo'],
        'zona' => $r['zona'],
        'reservado_para' => $r['reservado_para'],
        'sincronizado' => 0,
        'deleted' => false
    ];
}

if (empty($rows)) {
    echo json_encode(['pushed' => 0]);
    exit;
}

[$code, $data] = supabase_request('POST', 'asientos_bloqueados', $rows, '', 'return=representation');

if ($code >= 200 && $code < 300) {
    mysqli_query($conexion, "UPDATE asientos_bloqueados SET sincronizado = 1 WHERE sucursal = $sucursal AND sincronizado = 0");
    echo json_encode(['pushed' => count($rows)]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase error', 'code' => $code, 'detail' => $data]);
}
$conexion->close();
?>

<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../common/env.php';
require_once __DIR__ . '/../common/supabase.php';

header('Content-Type: application/json');

$sucursal = (int)env('SUCURSAL', 1);

$res = mysqli_query($conexion, "SELECT * FROM asignacion_boletero WHERE sucursal = $sucursal AND sincronizado = 0 AND deleted = 0");
$rows = [];
while ($r = mysqli_fetch_assoc($res)) {
    [$c, $d] = supabase_request('GET', 'reportes', null, 'sucursal=eq.' . (int)$r['sucursal'] . '&local_codr=eq.' . (int)$r['codR'] . '&select=id');
    $reporteId = (is_array($d) && isset($d[0]['id'])) ? $d[0]['id'] : null;
    if (!$reporteId) continue;
    $asientos = [];
    foreach (preg_split('/[,\s]+/', (string)$r['asientos_asignados']) as $t) {
        $t = trim($t);
        if ($t !== '' && is_numeric($t)) $asientos[] = (int)$t;
    }
    $rows[] = [
        'sucursal' => (int)$r['sucursal'],
        'reporte_id' => $reporteId,
        'boletero_id' => (int)$r['boletero_id'],
        'estado' => $r['estado'],
        'asientos_asignados' => $asientos,
        'sincronizado' => 0,
        'deleted' => false
    ];
}

if (empty($rows)) {
    echo json_encode(['pushed' => 0]);
    exit;
}

[$code, $data] = supabase_request('POST', 'asignacion_boletero', $rows, 'on_conflict=reporte_id,boletero_id', 'return=representation,resolution=merge-duplicates');

if ($code >= 200 && $code < 300) {
    mysqli_query($conexion, "UPDATE asignacion_boletero SET sincronizado = 1 WHERE sucursal = $sucursal AND sincronizado = 0");
    echo json_encode(['pushed' => count($rows)]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase error', 'code' => $code, 'detail' => $data]);
}
$conexion->close();
?>

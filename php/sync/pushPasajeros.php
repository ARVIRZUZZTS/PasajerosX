<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../common/env.php';
require_once __DIR__ . '/../common/supabase.php';

header('Content-Type: application/json');

$sucursal = (int)env('SUCURSAL', 1);

function to_iso_date($d) {
    $d = trim((string)$d);
    if ($d === '') return null;
    if (preg_match('#^(\d{2})/(\d{2})/(\d{4})$#', $d, $m)) {
        return $m[3] . '-' . $m[2] . '-' . $m[1];
    }
    return $d;
}

$res = mysqli_query($conexion, "SELECT * FROM pasajeros WHERE sucursal = $sucursal AND sincronizado = 0 AND deleted = 0");
$rows = [];
while ($r = mysqli_fetch_assoc($res)) {
    $reporteId = null;
    if (!empty($r['codR'])) {
        [$c, $d] = supabase_request('GET', 'reportes', null, 'sucursal=eq.' . (int)$r['sucursal'] . '&local_codr=eq.' . (int)$r['codR'] . '&select=id');
        if (is_array($d) && isset($d[0]['id'])) $reporteId = $d[0]['id'];
    }
    $rows[] = [
        'sucursal' => (int)$r['sucursal'],
        'reporte_id' => $reporteId,
        'local_codp' => (int)$r['codP'],
        'nombre' => $r['nombre'],
        'ci' => $r['ci'],
        'fecha' => to_iso_date($r['fecha']),
        'destino' => $r['destino'],
        'precio' => (float)$r['precio'],
        'asiento' => (int)$r['asiento'],
        'sincronizado' => 0,
        'deleted' => false
    ];
}

if (empty($rows)) {
    echo json_encode(['pushed' => 0]);
    exit;
}

[$code, $data] = supabase_request('POST', 'reporte_pasajeros', $rows, 'on_conflict=sucursal,local_codp', 'return=representation,resolution=merge-duplicates');

if ($code >= 200 && $code < 300) {
    foreach ($rows as $r) {
        $id = (int)$r['local_codp'];
        mysqli_query($conexion, "UPDATE pasajeros SET sincronizado = 1 WHERE codP = $id");
    }
    echo json_encode(['pushed' => count($rows)]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase error', 'code' => $code, 'detail' => $data]);
}
$conexion->close();
?>

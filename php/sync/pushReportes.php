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

function to_int_array($s) {
    $out = [];
    foreach (preg_split('/[,\s]+/', (string)$s) as $t) {
        $t = trim($t);
        if ($t !== '' && is_numeric($t)) $out[] = (int)$t;
    }
    return array_values(array_unique($out));
}

$res = mysqli_query($conexion, "SELECT * FROM reporte WHERE sucursal = $sucursal AND sincronizado = 0 AND deleted = 0");
$rows = [];
while ($r = mysqli_fetch_assoc($res)) {
    $rows[] = [
        'sucursal' => (int)$r['sucursal'],
        'local_codr' => (int)$r['codR'],
        'fecha' => to_iso_date($r['fecha']),
        'destino' => $r['destino'],
        'placa' => $r['placa'],
        'hora' => $r['hora'],
        'carril' => $r['carril'],
        'con1' => $r['con1'],
        'lic1' => $r['lic1'],
        'con2' => $r['con2'],
        'lic2' => $r['lic2'],
        'ayudante' => $r['ayudante'],
        'marca' => $r['marca'],
        'reservas' => (bool)$r['reservas'],
        'zona_reserva' => $r['zona_reserva'],
        'asientos_reservados' => to_int_array($r['asientos_reservados']),
        'sincronizado' => 0,
        'deleted' => false
    ];
}

if (empty($rows)) {
    echo json_encode(['pushed' => 0]);
    exit;
}

[$code, $data] = supabase_request('POST', 'reportes', $rows, 'on_conflict=sucursal,local_codr', 'return=representation,resolution=merge-duplicates');

if ($code >= 200 && $code < 300) {
    foreach ($rows as $r) {
        $id = (int)$r['local_codr'];
        mysqli_query($conexion, "UPDATE reporte SET sincronizado = 1 WHERE codR = $id");
    }
    echo json_encode(['pushed' => count($rows), 'supabase' => $data]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase error', 'code' => $code, 'detail' => $data]);
}
$conexion->close();
?>

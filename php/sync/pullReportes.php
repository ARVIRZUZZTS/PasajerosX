<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../common/env.php';
require_once __DIR__ . '/../common/supabase.php';

header('Content-Type: application/json');

$sucursal = (int)env('SUCURSAL', 1);

$last = null;
$r = mysqli_query($conexion, "SELECT last_sync FROM sync_state WHERE tabla='reportes' AND sucursal=$sucursal");
if ($r && $row = mysqli_fetch_assoc($r)) $last = $row['last_sync'];

$query = 'sucursal=eq.' . $sucursal . '&deleted=eq.false';
if ($last) $query .= '&updated_at=gt.' . urlencode($last);

[$code, $data] = supabase_request('GET', 'reportes', null, $query);
if ($code < 200 || $code >= 300) {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase error', 'code' => $code, 'detail' => $data]);
    exit;
}

$pushed = 0;
$maxUpdated = $last;
foreach ($data as $row) {
    $localCod = (int)$row['local_codr'];
    if (!$localCod) continue;
    $fecha = $row['fecha'] ?? '';

    $chk = $conexion->prepare("SELECT codR FROM reporte WHERE codR = ?");
    $chk->bind_param("i", $localCod);
    $chk->execute();
    $exists = $chk->get_result()->num_rows > 0;

    if ($exists) {
        $stmt = $conexion->prepare("UPDATE reporte SET con1=?,lic1=?,con2=?,lic2=?,ayudante=?,destino=?,placa=?,fecha=?,hora=?,carril=?,sucursal=?,sincronizado=1,deleted=0,updated_at=NOW() WHERE codR=?");
        $stmt->bind_param("ssssssssssii", $row['con1'],$row['lic1'],$row['con2'],$row['lic2'],$row['ayudante'],$row['destino'],$row['placa'],$fecha,$row['hora'],$row['carril'],$sucursal,$localCod);
        $stmt->execute();
    } else {
        $stmt = $conexion->prepare("INSERT INTO reporte (codR,con1,lic1,con2,lic2,ayudante,destino,placa,fecha,hora,carril,sucursal,sincronizado,deleted) VALUES (?,?,?,?,?,?,?,?,?,?,?,1,0)");
        $stmt->bind_param("issssssssssi", $localCod,$row['con1'],$row['lic1'],$row['con2'],$row['lic2'],$row['ayudante'],$row['destino'],$row['placa'],$fecha,$row['hora'],$row['carril'],$sucursal);
        $stmt->execute();
    }

    $pushed++;
    if ($row['updated_at'] > $maxUpdated) $maxUpdated = $row['updated_at'];
}

if ($maxUpdated) {
    $stmt = $conexion->prepare("INSERT INTO sync_state (tabla,sucursal,last_sync) VALUES ('reportes',?,?) ON DUPLICATE KEY UPDATE last_sync=?");
    $stmt->bind_param("iss", $sucursal, $maxUpdated, $maxUpdated);
    $stmt->execute();
}

echo json_encode(['pulled' => $pushed]);
$conexion->close();
?>

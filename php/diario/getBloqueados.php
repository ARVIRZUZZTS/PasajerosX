<?php
include "../conexion.php";
header('Content-Type: application/json');

$codR = $_GET['codR'] ?? null;
if (!$codR) {
    echo json_encode([]);
    exit;
}

$stmt = $conexion->prepare("SELECT asientos_reservados FROM reservas WHERE codR = ? AND deleted = 0");
$stmt->bind_param("i", $codR);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$out = [];
if ($res && $res['asientos_reservados'] !== null && $res['asientos_reservados'] !== '') {
    foreach (array_map('trim', explode(',', $res['asientos_reservados'])) as $a) {
        if ($a !== '' && is_numeric($a)) $out[] = ['asiento' => (int)$a];
    }
}
echo json_encode($out);
$conexion->close();
?>

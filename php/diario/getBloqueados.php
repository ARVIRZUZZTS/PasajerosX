<?php
include "../conexion.php";
header('Content-Type: application/json');

$codR = $_GET['codR'] ?? null;
if (!$codR) {
    echo json_encode([]);
    exit;
}

$stmt = $conexion->prepare("SELECT asiento, motivo, zona FROM asientos_bloqueados WHERE codR = ? AND deleted = 0");
$stmt->bind_param("i", $codR);
$stmt->execute();
$res = $stmt->get_result();
$out = [];
while ($row = $res->fetch_assoc()) $out[] = $row;
echo json_encode($out);
$conexion->close();
?>

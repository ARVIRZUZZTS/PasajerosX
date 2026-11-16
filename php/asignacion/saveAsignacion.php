<?php
include "../conexion.php";
header('Content-Type: application/json');

$codR = $_POST['codR'] ?? null;
$boletero = $_POST['boletero_nombre'] ?? null;
$asientos = $_POST['asientos_asignados'] ?? null;
$estado = $_POST['estado'] ?? 'activo';
if (!$codR || !$boletero) {
    echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    exit;
}
$stmt = $conexion->prepare("INSERT INTO asignacion_boletero (codR, boletero_nombre, estado, asientos_asignados) VALUES (?,?,?,?)");
$stmt->bind_param("isss", $codR, $boletero, $estado, $asientos);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $conexion->insert_id]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
$conexion->close();
?>

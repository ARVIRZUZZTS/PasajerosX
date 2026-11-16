<?php
include "../conexion.php";
header('Content-Type: application/json');

$codR = $_POST['codR'] ?? null;
$boletero = $_POST['boletero_nombre'] ?? null;
$asignadoPor = $_POST['asignado_por'] ?? null;
if (!$codR || !$boletero) {
    echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    exit;
}
$stmt = $conexion->prepare("INSERT INTO asignacion_boletero (codR, boletero_nombre, asignado_por) VALUES (?,?,?)");
$stmt->bind_param("iss", $codR, $boletero, $asignadoPor);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $conexion->insert_id]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
$conexion->close();
?>

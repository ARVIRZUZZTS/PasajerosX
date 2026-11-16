<?php
include "../conexion.php";
require_once __DIR__ . '/../common/env.php';

$c1 = $_POST['c1'] ?? null;
$l1 = $_POST['l1'] ?? null;
$c2 = $_POST['c2'] ?? null;
$l2 = $_POST['l2'] ?? null;
$ay = $_POST['ay'] ?? null;
$pl = $_POST['pl'] ?? null;
$dt = $_POST['dt'] ?? null;
$fe = $_POST['fe'] ?? null;
$hr = $_POST['hr'] ?? null;
$ca = $_POST['ca'] ?? '5';
$reservas = isset($_POST['reservas']) && ($_POST['reservas'] === '1' || $_POST['reservas'] === 'true' || $_POST['reservas'] === 'on') ? 1 : 0;
$asientosRaw = $_POST['asientos_reservados'] ?? '';
$sucursal = (int)(env('SUCURSAL', 1));

$sql = "INSERT INTO reporte (con1, lic1, con2, lic2, ayudante, destino, placa, fecha, hora, carril, sucursal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssssssssssi", $c1, $l1, $c2, $l2, $ay, $dt, $pl, $fe, $hr, $ca, $sucursal);

if (!$stmt->execute()) {
    echo json_encode(["error" => "No se pudo guardar: " . $stmt->error]);
    exit;
}

$codR = (int)$conexion->insert_id;

if ($reservas) {
    if ($asientosRaw === '') {
        $q = $conexion->prepare("SELECT MAX(numAs) AS maxAs FROM planilla WHERE nombre = (SELECT nombre_planilla FROM flota WHERE placa = ?)");
        $q->bind_param("s", $pl);
        $q->execute();
        $r = $q->get_result()->fetch_assoc();
        $maxAs = (int)($r['maxAs'] ?? 0);
        $asientos = [];
        if ($maxAs > 0) {
            $n = 8;
            for ($i = max(1, $maxAs - $n + 1); $i <= $maxAs; $i++) {
                $asientos[] = $i;
            }
        }
        $asientosRaw = implode(',', $asientos);
    }
    // Generar UUID v4 para reserva
    $idReserva = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
    $ins = $conexion->prepare("INSERT INTO reservas (id_reserva, codR, asientos_reservados, sucursal) VALUES (?,?,?,?)");
    $ins->bind_param("sisi", $idReserva, $codR, $asientosRaw, $sucursal);
    $ins->execute();
}

echo json_encode(["codR" => $codR, "reservas" => $reservas, "asientos_reservados" => $asientosRaw]);
$conexion->close();
?>

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
$zona = $_POST['zona_reserva'] ?? ($reservas ? 'Montero' : null);
$asientosRaw = $_POST['asientos_reservados'] ?? '';
$sucursal = (int)(env('SUCURSAL', 1));

$sql = "INSERT INTO reporte (con1, lic1, con2, lic2, ayudante, destino, placa, fecha, hora, carril, reservas, zona_reserva, asientos_reservados, sucursal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssssssssssissi", $c1, $l1, $c2, $l2, $ay, $dt, $pl, $fe, $hr, $ca, $reservas, $zona, $asientosRaw, $sucursal);

if (!$stmt->execute()) {
    echo json_encode(["error" => "No se pudo guardar: " . $stmt->error]);
    exit;
}

$codR = (int)$conexion->insert_id;

// Determinar asientos reservados
$asientos = [];
if ($reservas) {
    if ($asientosRaw !== '') {
        foreach (preg_split('/[,\s]+/', $asientosRaw) as $tok) {
            $tok = trim($tok);
            if ($tok !== '' && is_numeric($tok)) $asientos[] = (int)$tok;
        }
    } else {
        // Default: ultimos 8 asientos del bus
        $q = $conexion->prepare("SELECT MAX(numAs) AS maxAs FROM planilla WHERE nombre = (SELECT nombre_planilla FROM flota WHERE placa = ?)");
        $q->bind_param("s", $pl);
        $q->execute();
        $r = $q->get_result()->fetch_assoc();
        $maxAs = (int)($r['maxAs'] ?? 0);
        if ($maxAs > 0) {
            $n = 8;
            for ($i = max(1, $maxAs - $n + 1); $i <= $maxAs; $i++) {
                $asientos[] = $i;
            }
        }
        $asientosRaw = implode(',', $asientos);
        $u = $conexion->prepare("UPDATE reporte SET asientos_reservados = ? WHERE codR = ?");
        $u->bind_param("si", $asientosRaw, $codR);
        $u->execute();
    }

    foreach (array_unique($asientos) as $asiento) {
        $ins = $conexion->prepare("INSERT IGNORE INTO asientos_bloqueados (codR, asiento, motivo, zona, reservado_para, sucursal) VALUES (?,?,?,?,?,?)");
        $motivo = 'Reserva';
        $reservado = 'Montero';
        $ins->bind_param("iisssi", $codR, $asiento, $motivo, $zona, $reservado, $sucursal);
        $ins->execute();
    }
}

echo json_encode(["codR" => $codR, "reservas" => $reservas, "asientos_reservados" => $asientos]);
$conexion->close();
?>

<?php 
    include '../conexion.php';

    if (isset($_GET['fecha'])) {
        $fecha = $_GET['fecha'];

        $query = "SELECT p.*, r.placa AS reportePlaca, r.destino AS reporteDestino, r.fecha AS reporteFecha FROM pasajeros p LEFT JOIN reporte r ON p.codR = r.codR WHERE (r.fecha = ? OR (p.codR IS NULL AND p.fecha = ?)) ORDER BY p.asiento";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("ss", $fecha, $fecha);

        if ($stmt->execute()) {
            $res = $stmt->get_result();
            $pasajeros = $res->fetch_all(MYSQLI_ASSOC);

            header('Content-Type: application/jason');
            echo json_encode($pasajeros);
        } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al ejecutar la consulta.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Parámetro fecha faltante.']);
    }
?>
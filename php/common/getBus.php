<?php
header('Content-Type: application/json');

include '../conexion.php'; // Incluye el archivo de conexión

$nombre = isset($_GET['nombre']) ? $_GET['nombre'] : '';

$response = [];

if ($conexion) { // Verificamos si la conexión está establecida
    $query = "SELECT * FROM planilla WHERE nombre = ?";
    $stmt = $conexion->prepare($query);
    
    if ($stmt) {
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        $response = $data;
        $stmt->close();
    } else {
        $response = ['error' => 'Error al preparar la consulta'];
    }
    
    $conexion->close();
} else {
    $response = ['error' => 'Error de conexión a la base de datos'];
}

echo json_encode($response);
?>
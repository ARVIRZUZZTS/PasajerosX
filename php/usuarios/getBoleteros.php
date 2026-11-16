<?php
require_once __DIR__ . '/../common/env.php';
require_once __DIR__ . '/../common/supabase.php';

header('Content-Type: application/json');

$sucursal = (int)env('SUCURSAL', 1);

[$c, $users] = supabase_request('GET', 'usuarios', null,
    'sucursal=eq.' . $sucursal . '&estado=eq.activo&select=id_usuario,nombre,rol,sucursal');

if ($c < 200 || $c >= 300 || !is_array($users)) {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase error', 'code' => $c, 'detail' => $users]);
    exit;
}

$allowed = ['Boletero', 'Gerente de Boleteria'];
$filtered = array_values(array_filter($users, function ($u) use ($allowed) {
    return in_array($u['rol'] ?? '', $allowed, true);
}));

$ids = array_map(function ($u) { return (int)$u['id_usuario']; }, $filtered);
$infoMap = [];
if (!empty($ids)) {
    $idList = implode(',', $ids);
    [$ci, $info] = supabase_request('GET', 'user_info', null,
        'id_user=in.(' . $idList . ')&select=id_user,atributo,value');
    if ($ci >= 200 && $ci < 300 && is_array($info)) {
        foreach ($info as $row) {
            $uid = (int)$row['id_user'];
            $infoMap[$uid][$row['atributo']] = $row['value'];
        }
    }
}

$out = [];
foreach ($filtered as $u) {
    $uid = (int)$u['id_usuario'];
    $colors = $infoMap[$uid] ?? [];
    $out[] = [
        'id_usuario' => $uid,
        'nombre' => $u['nombre'],
        'rol' => $u['rol'],
        'sucursal' => (int)$u['sucursal'],
        'color_1' => $colors['color_1'] ?? '#003591',
        'color_2' => $colors['color_2'] ?? '#003591',
        'color_texto' => $colors['color_texto'] ?? '#FFFFFF'
    ];
}

echo json_encode($out);
?>

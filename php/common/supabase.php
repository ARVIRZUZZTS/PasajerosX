<?php
require_once __DIR__ . '/env.php';

function supabase_request($method, $path, $body = null, $query = '', $prefer = 'return=representation') {
    $url = rtrim(env('SUPABASE_URL'), '/') . '/rest/v1/' . ltrim($path, '/');
    if ($query) $url .= '?' . $query;
    $key = env('SUPABASE_SERVICE_ROLE_KEY', env('SUPABASE_KEY'));
    $ch = curl_init($url);
    $headers = [
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json',
        'Prefer: ' . $prefer
    ];
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($resp, true)];
}

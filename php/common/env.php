<?php
// Carga simple de .env desde la raiz del proyecto
function env($key, $default = null) {
    static $vars = null;
    if ($vars === null) {
        $vars = [];
        $path = dirname(__DIR__, 2) . '/.env';
        if (is_file($path)) {
            foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) continue;
                if (strpos($line, '=') === false) continue;
                [$k, $v] = explode('=', $line, 2);
                $vars[trim($k)] = trim($v);
            }
        }
    }
    return array_key_exists($key, $vars) ? $vars[$key] : $default;
}

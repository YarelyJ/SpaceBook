<?php

declare(strict_types=1);

/**
 * Cabeceras CORS.
 *
 * El frontend (React, en otro puerto/dominio durante el desarrollo) necesita
 * permiso explicito del backend para poder llamarlo desde el navegador.
 *
 * Configura el origen permitido en el archivo .env con la variable
 * CORS_ALLOWED_ORIGIN. Si no se define, se permite cualquier origen (*),
 * lo cual es comodo en desarrollo pero deberia restringirse en produccion.
 */

$allowedOrigin = getenv('CORS_ALLOWED_ORIGIN');
if ($allowedOrigin === false || $allowedOrigin === '') {
    $allowedOrigin = '*';
}

header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

// El navegador envia una peticion OPTIONS de "preflight" antes de POST.
// Respondemos vacio y con 204 para que continue con la peticion real.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

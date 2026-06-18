<?php

declare(strict_types=1);

/**
 * Helpers para responder en formato JSON.
 *
 * Todas las rutas de /api usan estas dos funciones en vez de repetir
 * header() + json_encode() + exit en cada archivo.
 */

/**
 * Envia una respuesta JSON exitosa (o con la forma que se le pase) y termina
 * la ejecucion del script.
 *
 * @param mixed $data
 */
function json_response($data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Envia una respuesta de error con la forma { "error": "mensaje" },
 * igual que las rutas originales de Next.js (NextResponse.json({ error })).
 */
function json_error(string $message, int $status = 400): never
{
    json_response(['error' => $message], $status);
}

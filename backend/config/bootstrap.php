<?php

declare(strict_types=1);

/**
 * Bootstrap del backend.
 *
 * Se incluye al inicio de cada endpoint en /api. Se encarga de:
 *  - Configurar el reporte de errores (sin imprimir HTML de errores en una API JSON).
 *  - Cargar las variables del archivo .env (clave de Stripe, origen permitido para CORS, etc).
 *  - Definir la zona horaria por defecto.
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
date_default_timezone_set('America/Mexico_City');

/**
 * Carga un archivo .env muy simple (formato CLAVE=VALOR, una por linea)
 * y lo deja disponible a traves de getenv().
 *
 * No se usa ninguna libreria externa a proposito: asi el backend funciona
 * en cualquier hosting con PHP, sin necesidad de instalar Composer.
 */
function spacebook_load_env(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        if (!str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        $value = trim($value, "\"'");

        if ($key !== '' && getenv($key) === false) {
            putenv($key . '=' . $value);
        }
    }
}

spacebook_load_env(__DIR__ . '/../.env');

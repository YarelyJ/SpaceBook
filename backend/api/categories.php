<?php

declare(strict_types=1);

/**
 * GET /api/categories.php
 *
 * Equivalente a app/api/categories/route.ts del proyecto original.
 * Devuelve todas las categorias junto con sus libros completos.
 */

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../src/Response.php';
require_once __DIR__ . '/../src/BookRepository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Metodo no permitido. Usa GET.', 405);
}

$categories = BookRepository::allCategories();

json_response([
    'data' => $categories,
    'total' => count($categories),
]);

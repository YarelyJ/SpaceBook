<?php

declare(strict_types=1);

/**
 * GET /api/books.php
 *
 * Equivalente a app/api/books/route.ts del proyecto original.
 *
 * Parametros (query string), todos opcionales:
 *   - id:       devuelve un solo libro por su id -> { "data": {...} }
 *   - category: filtra por slug o nombre de categoria
 *   - search:   filtra por titulo o autor (contiene, sin distinguir mayus/minus)
 *
 * Sin parametros, devuelve todos los libros junto con un resumen de categorias:
 *   { "data": [...], "total": N, "categories": [...] }
 */

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../src/Response.php';
require_once __DIR__ . '/../src/BookRepository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Metodo no permitido. Usa GET.', 405);
}

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : null;
$category = isset($_GET['category']) ? trim((string) $_GET['category']) : null;
$search = isset($_GET['search']) ? trim((string) $_GET['search']) : null;

// Si se solicita un libro especifico por id, se responde solo con ese libro
// y se ignoran los demas filtros (igual que en el codigo original).
if ($id) {
    $book = BookRepository::findById($id);

    if ($book === null) {
        json_error('Libro no encontrado', 404);
    }

    json_response(['data' => $book]);
}

$books = BookRepository::allBooks();

if ($category) {
    $filtered = BookRepository::booksByCategory($category);
    if ($filtered !== null) {
        $books = $filtered;
    }
    // Si la categoria no existe, se mantiene la lista completa, igual que
    // en route.ts (el "if (cat)" original simplemente no aplicaba el filtro).
}

if ($search) {
    $books = BookRepository::search($books, $search);
}

json_response([
    'data' => $books,
    'total' => count($books),
    'categories' => BookRepository::categorySummaries(),
]);

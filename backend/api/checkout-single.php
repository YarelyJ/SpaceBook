<?php

declare(strict_types=1);

/**
 * POST /api/checkout-single.php
 *
 * Equivalente a startCheckoutSession() en app/actions/stripe.ts.
 * Crea una sesion de Stripe Checkout para la compra de UN solo libro.
 *
 * Body esperado (JSON):
 *   { "bookId": "ro1" }
 *
 * Respuesta:
 *   { "clientSecret": "..." }
 */

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../src/Response.php';
require_once __DIR__ . '/../src/BookRepository.php';
require_once __DIR__ . '/../src/StripeGateway.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Metodo no permitido. Usa POST.', 405);
}

$rawBody = file_get_contents('php://input');
$input = json_decode((string) $rawBody, true);

if (!is_array($input)) {
    json_error('El cuerpo de la peticion debe ser JSON valido.', 400);
}

$bookId = isset($input['bookId']) ? trim((string) $input['bookId']) : '';

if ($bookId === '') {
    json_error('Falta el parametro "bookId".', 400);
}

$book = BookRepository::findById($bookId);

if ($book === null) {
    json_error('Libro con id "' . $bookId . '" no encontrado', 404);
}

try {
    $session = StripeGateway::createCheckoutSession([
        StripeGateway::lineItemForBook($book, 1),
    ]);
} catch (RuntimeException $exception) {
    json_error($exception->getMessage(), 502);
}

json_response(['clientSecret' => $session['client_secret'] ?? null]);

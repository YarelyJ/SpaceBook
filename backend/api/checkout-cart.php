<?php

declare(strict_types=1);

/**
 * POST /api/checkout-cart.php
 *
 * Equivalente a startCartCheckoutSession() en app/actions/stripe.ts.
 * Crea una sesion de Stripe Checkout para la compra de VARIOS libros (carrito).
 *
 * Body esperado (JSON):
 *   { "items": [ { "bookId": "ro1", "quantity": 2 }, { "bookId": "fa3", "quantity": 1 } ] }
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

$items = $input['items'] ?? [];

if (!is_array($items) || count($items) === 0) {
    json_error('El carrito esta vacio', 400);
}

$lineItems = [];

foreach ($items as $item) {
    if (!is_array($item)) {
        json_error('Cada item del carrito debe ser un objeto con "bookId" y "quantity".', 400);
    }

    $bookId = isset($item['bookId']) ? trim((string) $item['bookId']) : '';
    $quantity = isset($item['quantity']) ? (int) $item['quantity'] : 1;

    if ($bookId === '') {
        json_error('Cada item del carrito necesita un "bookId".', 400);
    }

    $book = BookRepository::findById($bookId);

    if ($book === null) {
        json_error('Libro con id "' . $bookId . '" no encontrado', 404);
    }

    $lineItems[] = StripeGateway::lineItemForBook($book, $quantity);
}

try {
    $session = StripeGateway::createCheckoutSession($lineItems);
} catch (RuntimeException $exception) {
    json_error($exception->getMessage(), 502);
}

json_response(['clientSecret' => $session['client_secret'] ?? null]);

<?php

declare(strict_types=1);

/**
 * Cliente minimo para la API de Stripe usando cURL puro.
 *
 * El proyecto original usaba el SDK oficial de Stripe para Node
 * (stripe.checkout.sessions.create). Aqui se hace exactamente la misma
 * llamada HTTP que hace ese SDK por debajo, pero a mano con cURL, para que
 * el backend no dependa de Composer ni de ninguna libreria externa.
 *
 * Documentacion del endpoint: https://docs.stripe.com/api/checkout/sessions/create
 */
final class StripeGateway
{
    private const ENDPOINT = 'https://api.stripe.com/v1/checkout/sessions';

    /**
     * Crea una sesion de Stripe Checkout en modo "embedded_page" (el mismo
     * modo que usaba el frontend original con @stripe/react-stripe-js) y
     * devuelve la sesion ya decodificada (incluye "client_secret").
     *
     * @param array<int, array<string, mixed>> $lineItems
     * @return array<string, mixed>
     *
     * @throws RuntimeException si falta la clave secreta, si falla la
     *                          conexion o si Stripe responde con un error.
     */
    public static function createCheckoutSession(array $lineItems): array
    {
        $secretKey = getenv('STRIPE_SECRET_KEY');

        if ($secretKey === false || $secretKey === '') {
            throw new RuntimeException(
                'Falta configurar STRIPE_SECRET_KEY en el archivo .env del backend.'
            );
        }

        $payload = [
            'mode' => 'payment',
            'ui_mode' => 'embedded_page',
            'redirect_on_completion' => 'never',
            'line_items' => $lineItems,
        ];

        // http_build_query convierte automaticamente los arrays anidados al
        // formato que Stripe espera, p. ej.:
        // line_items[0][price_data][currency]=usd
        $body = http_build_query($payload, '', '&', PHP_QUERY_RFC3986);

        $curl = curl_init(self::ENDPOINT);

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded',
            ],
            CURLOPT_USERPWD => $secretKey . ':',
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($curl);
        $httpStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);

        if ($response === false) {
            throw new RuntimeException('Error de conexion con Stripe: ' . $curlError);
        }

        $decoded = json_decode((string) $response, true);

        if ($httpStatus >= 400) {
            $message = is_array($decoded) && isset($decoded['error']['message'])
                ? (string) $decoded['error']['message']
                : 'Error desconocido al crear la sesion de pago en Stripe.';

            throw new RuntimeException($message);
        }

        if (!is_array($decoded)) {
            throw new RuntimeException('Stripe devolvio una respuesta inesperada.');
        }

        return $decoded;
    }

    /**
     * Construye el line_item de Stripe para un libro, igual que hacian
     * startCheckoutSession() y startCartCheckoutSession() en
     * app/actions/stripe.ts.
     *
     * @param array<string, mixed> $book
     * @return array<string, mixed>
     */
    public static function lineItemForBook(array $book, int $quantity = 1): array
    {
        return [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => $book['title'],
                    'description' => $book['author'] . ' · ' . $book['genre'],
                ],
                'unit_amount' => $book['priceInCents'],
            ],
            'quantity' => max(1, $quantity),
        ];
    }
}

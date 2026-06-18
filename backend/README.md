# SpaceBook · Backend (PHP)

API REST en PHP puro (sin frameworks, sin Composer) que sirve el catálogo de
libros de SpaceBook y crea las sesiones de pago de Stripe. Es la conversión
directa de lo que antes eran las rutas `app/api/*` y `app/actions/stripe.ts`
de la versión en Next.js del proyecto.

## Requisitos

- PHP 8.1 o superior.
- Extensión `curl` habilitada (viene activada por defecto en la mayoría de
  instalaciones; en XAMPP/WAMP revisa que `extension=curl` esté descomentado
  en tu `php.ini`).
- No se necesita base de datos: el catálogo vive en `data/categories.php`.
- No se necesita Composer ni ninguna librería externa.

## Instalación

1. Copia `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y coloca tu clave secreta de Stripe y el origen de tu
   frontend:

   ```
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
   CORS_ALLOWED_ORIGIN=http://localhost:5173
   ```

## Ejecutar en desarrollo

Con el servidor embebido de PHP, sirviendo esta misma carpeta como raíz:

```bash
php -S localhost:8000 -t .
```

La API quedará disponible en `http://localhost:8000/api/...` (ver
endpoints abajo).

## Desplegar en un hosting normal (Apache / LiteSpeed / etc.)

Sube toda la carpeta `backend/` a tu servidor (por ejemplo dentro de
`public_html/backend`). No necesitas configurar nada especial: los archivos
`.htaccess` incluidos ya bloquean el acceso directo a `.env`, `config/`,
`data/` y `src/`. Sube también tu `.env` (con tus claves reales) directamente
en el servidor; nunca lo subas a un repositorio Git público.

La URL base de tu API sería entonces algo como:
`https://tu-dominio.com/backend`

## Endpoints

### `GET /api/books.php`

Lista de libros. Acepta query params opcionales:

| Parámetro  | Descripción                                              |
|------------|-----------------------------------------------------------|
| `id`       | Devuelve un solo libro: `{ "data": { ...libro } }`         |
| `category` | Filtra por slug o nombre de categoría (ej. `romance`)      |
| `search`   | Filtra por título o autor (contiene, sin distinguir mayúsculas) |

Ejemplos:

```
GET /api/books.php
GET /api/books.php?id=ro1
GET /api/books.php?category=fantasia
GET /api/books.php?search=dune
```

Respuesta (sin `id`):

```json
{
  "data": [ { "id": "ro1", "title": "Heartstopper", "...": "..." } ],
  "total": 50,
  "categories": [
    { "name": "Romance", "slug": "romance", "count": 10 }
  ]
}
```

### `GET /api/categories.php`

Todas las categorías con sus libros completos.

```json
{
  "data": [
    { "name": "Romance", "slug": "romance", "description": "...", "books": [ "..." ] }
  ],
  "total": 5
}
```

### `POST /api/checkout-single.php`

Crea una sesión de Stripe Checkout (modo `embedded_page`) para comprar un
solo libro.

Body:

```json
{ "bookId": "ro1" }
```

Respuesta:

```json
{ "clientSecret": "cs_test_..._secret_..." }
```

### `POST /api/checkout-cart.php`

Crea una sesión de Stripe Checkout para comprar varios libros (carrito).

Body:

```json
{
  "items": [
    { "bookId": "ro1", "quantity": 2 },
    { "bookId": "fa3", "quantity": 1 }
  ]
}
```

Respuesta:

```json
{ "clientSecret": "cs_test_..._secret_..." }
```

### Errores

Todos los endpoints responden errores con la misma forma:

```json
{ "error": "Mensaje descriptivo" }
```

junto con el código HTTP correspondiente (400, 404, 405 o 502).

## Estructura del proyecto

```
backend/
├── api/                   Endpoints públicos (lo único que llama el frontend)
│   ├── books.php
│   ├── categories.php
│   ├── checkout-single.php
│   └── checkout-cart.php
├── config/
│   ├── bootstrap.php      Carga el .env y configura errores
│   └── cors.php           Cabeceras CORS + manejo de OPTIONS
├── data/
│   └── categories.php     El catálogo completo (50 libros, 5 categorías)
├── src/
│   ├── BookRepository.php Consultas, filtros y búsqueda sobre el catálogo
│   ├── Response.php       Helpers para responder JSON
│   └── StripeGateway.php  Llamadas a la API de Stripe vía cURL
├── .env.example
└── .htaccess
```

## Notas de seguridad

- La clave `STRIPE_SECRET_KEY` solo vive en el backend. Nunca la copies al
  frontend ni la incluyas en código que llegue al navegador.
- En producción, define `CORS_ALLOWED_ORIGIN` con el dominio exacto de tu
  frontend (evita dejarlo en `*`).
- Usa siempre HTTPS en producción, tanto para el backend como para el
  frontend, ya que se transmiten datos de pago.

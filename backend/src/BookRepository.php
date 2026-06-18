<?php

declare(strict_types=1);

/**
 * Acceso a los datos del catalogo (categorias y libros).
 *
 * Es el equivalente en PHP de "backend/data/books.ts" del proyecto original:
 * carga los datos una sola vez desde data/categories.php y expone metodos
 * para consultarlos, filtrarlos y buscarlos, igual que hacian
 * getBookById(), getCategoryOfBook() y los filtros dentro de route.ts.
 */
final class BookRepository
{
    /** @var array<int, array<string, mixed>>|null */
    private static ?array $categories = null;

    /**
     * Carga (una sola vez por request) el archivo de datos.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function categories(): array
    {
        if (self::$categories === null) {
            self::$categories = require __DIR__ . '/../data/categories.php';
        }

        return self::$categories;
    }

    /**
     * Todas las categorias, con sus libros incluidos.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function allCategories(): array
    {
        return self::categories();
    }

    /**
     * Todos los libros de todas las categorias, en un solo array plano.
     * Equivalente a ALL_BOOKS = CATEGORIES.flatMap((c) => c.books).
     *
     * @return array<int, array<string, mixed>>
     */
    public static function allBooks(): array
    {
        $books = [];

        foreach (self::categories() as $category) {
            foreach ($category['books'] as $book) {
                $books[] = $book;
            }
        }

        return $books;
    }

    /**
     * Busca un libro por su id. Equivalente a getBookById().
     *
     * @return array<string, mixed>|null
     */
    public static function findById(string $id): ?array
    {
        foreach (self::allBooks() as $book) {
            if ($book['id'] === $id) {
                return $book;
            }
        }

        return null;
    }

    /**
     * Devuelve la categoria a la que pertenece un libro.
     * Equivalente a getCategoryOfBook().
     *
     * @return array<string, mixed>|null
     */
    public static function categoryOfBook(string $bookId): ?array
    {
        foreach (self::categories() as $category) {
            foreach ($category['books'] as $book) {
                if ($book['id'] === $bookId) {
                    return $category;
                }
            }
        }

        return null;
    }

    /**
     * Devuelve los libros de una categoria buscando por slug o por nombre
     * (sin distinguir mayusculas/minusculas), igual que el filtro de
     * category en route.ts.
     *
     * @return array<int, array<string, mixed>>|null null si la categoria no existe
     */
    public static function booksByCategory(string $categoryParam): ?array
    {
        $needle = mb_strtolower($categoryParam);

        foreach (self::categories() as $category) {
            $matchesSlug = $category['slug'] === $categoryParam;
            $matchesName = mb_strtolower($category['name']) === $needle;

            if ($matchesSlug || $matchesName) {
                return $category['books'];
            }
        }

        return null;
    }

    /**
     * Filtra una lista de libros por titulo o autor (contiene, sin distinguir
     * mayusculas/minusculas). Igual que el filtro de "search" en route.ts.
     *
     * @param array<int, array<string, mixed>> $books
     * @return array<int, array<string, mixed>>
     */
    public static function search(array $books, string $query): array
    {
        $needle = mb_strtolower($query);

        $filtered = array_filter($books, static function (array $book) use ($needle): bool {
            return str_contains(mb_strtolower((string) $book['title']), $needle)
                || str_contains(mb_strtolower((string) $book['author']), $needle);
        });

        return array_values($filtered);
    }

    /**
     * Resumen de categorias (nombre, slug y cantidad de libros), tal como
     * se incluye dentro de la respuesta de /api/books.php.
     *
     * @return array<int, array{name:string, slug:string, count:int}>
     */
    public static function categorySummaries(): array
    {
        return array_map(static function (array $category): array {
            return [
                'name' => $category['name'],
                'slug' => $category['slug'],
                'count' => count($category['books']),
            ];
        }, self::categories());
    }
}

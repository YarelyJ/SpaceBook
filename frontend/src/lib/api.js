/**
 * Cliente del backend en PHP.
 *
 * Antes, page.tsx importaba CATEGORIES/ALL_BOOKS directamente desde
 * "backend/data/books.ts" (porque todo corría en el mismo servidor de
 * Next.js), y checkout-modal.tsx llamaba a server actions
 * (startCheckoutSession / startCartCheckoutSession).
 *
 * Ahora que el backend es un servicio PHP aparte, todo eso se convierte en
 * llamadas fetch() normales a la API REST.
 *
 * Forma de los datos que devuelve la API (solo a modo de referencia, ya
 * que en JS no se valida en tiempo de compilación):
 *
 * Book = {
 *   id, title, cover, author, year, description, genre,
 *   tags: string[], popularity, rating, reviews, pages, emoji, priceInCents
 * }
 * Category = { name, slug, description, books: Book[] }
 */

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

async function request(path, options) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error(
      `No se pudo conectar con el backend en ${API_URL}. ¿Está corriendo el servidor PHP?`
    )
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message = body?.error ?? `Error ${response.status} al consultar la API`
    throw new Error(message)
  }

  return body
}

export async function fetchCategories() {
  return request('/api/categories.php')
}

export async function fetchBooks(params) {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.search) query.set('search', params.search)
  const qs = query.toString()

  return request(`/api/books.php${qs ? `?${qs}` : ''}`)
}

export async function fetchBookById(id) {
  const query = new URLSearchParams({ id })
  return request(`/api/books.php?${query.toString()}`)
}

// Compra de un solo libro. Antes era la server action startCheckoutSession().
export async function startCheckoutSession(bookId) {
  const result = await request('/api/checkout-single.php', {
    method: 'POST',
    body: JSON.stringify({ bookId }),
  })
  return result.clientSecret
}

// Compra de varios libros (carrito). Antes era startCartCheckoutSession().
export async function startCartCheckoutSession(cartItems) {
  const result = await request('/api/checkout-cart.php', {
    method: 'POST',
    body: JSON.stringify({ items: cartItems }),
  })
  return result.clientSecret
}

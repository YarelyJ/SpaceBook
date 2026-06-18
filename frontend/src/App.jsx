import { useState, useMemo, useCallback, useEffect } from 'react'
import { fetchCategories } from './lib/api'
import Header from './components/Headre'
import BookCard from './pages/Book_card'
import BookDetail from './pages/Book_detail'
import CheckoutModal from './components/Checkout_modal'
import CartDrawer from './components/Cart_dratail'
import AdminPanel from './pages/Admin_panel'

function getCategoryOfBook(categories, bookId) {
  return categories.find((c) => c.books.some((b) => b.id === bookId))
}

export default function App() {
  // Catálogo, cargado desde la API en PHP al montar la app.
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [view, setView] = useState('catalog') // 'catalog' | 'detail'
  const [selectedBook, setSelectedBook] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Estado del carrito
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  // Estado del checkout
  const [checkoutMode, setCheckoutMode] = useState(null) // 'single' | 'cart' | null
  const [checkoutBook, setCheckoutBook] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Panel de administrador
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data))
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : 'Error al cargar el catálogo')
      )
      .finally(() => setLoading(false))
  }, [])

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  // --- Lógica del carrito ---
  const handleAddToCart = useCallback((book) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.book.id === book.id)
      if (existing) {
        return prev.map((i) =>
          i.book.id === book.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { book, quantity: 1 }]
    })
  }, [])

  const handleRemoveFromCart = useCallback((bookId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.book.id === bookId)
      if (!existing) return prev
      if (existing.quantity === 1) return prev.filter((i) => i.book.id !== bookId)
      return prev.map((i) =>
        i.book.id === bookId ? { ...i, quantity: i.quantity - 1 } : i
      )
    })
  }, [])

  const handleDeleteFromCart = useCallback((bookId) => {
    setCartItems((prev) => prev.filter((i) => i.book.id !== bookId))
  }, [])

  // --- Navegación ---
  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setView('detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setSelectedBook(null)
    setView('catalog')
  }

  // --- Checkout ---
  const handleBuySingle = (book) => {
    setCheckoutBook(book)
    setCheckoutMode('single')
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  const handleCartCheckout = () => {
    setCheckoutMode('cart')
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  const handleCheckoutClose = () => {
    setCheckoutOpen(false)
    setCheckoutMode(null)
    setCheckoutBook(null)
  }

  const handleCheckoutSuccess = () => {
    // Vaciar carrito si fue checkout del carrito
    if (checkoutMode === 'cart') setCartItems([])
  }

  // --- Filtrado por búsqueda ---
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase()
    return categories
      .map((cat) => ({
        ...cat,
        books: cat.books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.genre.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.books.length > 0)
  }, [categories, searchQuery])

  // Estado de carga inicial
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando catálogo...</p>
      </main>
    )
  }

  // Error al conectar con el backend
  if (loadError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="font-medium text-foreground">No se pudo cargar el catálogo</p>
        <p className="max-w-md text-sm text-muted-foreground">{loadError}</p>
        <p className="max-w-md text-xs text-muted-foreground">
          Verifica que el backend en PHP esté corriendo y que la variable VITE_API_URL
          (en el archivo .env del frontend) apunte a su URL correcta.
        </p>
      </main>
    )
  }

  // Vista detalle
  if (view === 'detail' && selectedBook) {
    const category = getCategoryOfBook(categories, selectedBook.id)
    return (
      <main className="min-h-screen bg-background">
        <Header
          cartCount={cartCount}
          onCartOpen={() => setCartOpen(true)}
        />
        <BookDetail
          book={selectedBook}
          category={category}
          onBack={handleBack}
          onBuy={handleBuySingle}
          onAddToCart={handleAddToCart}
        />

        {checkoutMode === 'single' && checkoutBook && (
          <CheckoutModal
            mode="single"
            book={checkoutBook}
            open={checkoutOpen}
            onClose={handleCheckoutClose}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onAdd={handleAddToCart}
          onRemove={handleRemoveFromCart}
          onDelete={handleDeleteFromCart}
          onCheckout={handleCartCheckout}
        />

        {checkoutMode === 'cart' && (
          <CheckoutModal
            mode="cart"
            items={cartItems}
            open={checkoutOpen}
            onClose={handleCheckoutClose}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          SpaceBook · Libreria Universal · {new Date().getFullYear()}
          <button
            onClick={() => setAdminOpen(true)}
            className="ml-3 text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors select-none"
            title="Panel de administrador"
            aria-label="Abrir panel de administrador"
          >
            ·
          </button>
        </footer>

        <AdminPanel
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
          categories={categories}
        />
      </main>
    )
  }

  // Vista catálogo
  return (
    <main className="min-h-screen bg-background">
      <Header
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 text-center md:py-16">
        <h1 className="text-4xl font-bold text-foreground text-balance md:text-5xl">
          Pequeña coleccion de libros
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
          Una biblioteca digital llena de aventuras, romance, misterio y fantasía. 
          Explora cada título, descubre nuevas historias y encuentra tu próxima lectura favorita.
        </p>
      </section>

      {/* Resultados de búsqueda */}
      {searchQuery && (
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <p className="text-sm text-muted-foreground">
            {filteredCategories.reduce((acc, c) => acc + c.books.length, 0)} resultados para{' '}
            <span className="font-medium text-foreground">&ldquo;{searchQuery}&rdquo;</span>
          </p>
        </div>
      )}

      {/* Catálogo por categorías */}
      <div className="mx-auto max-w-6xl px-4 pb-20">
        {filteredCategories.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No se encontraron libros para tu busqueda.</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section
              key={category.slug}
              id={category.slug}
              className="scroll-mt-24 border-t border-border py-10"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                  {category.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
                {category.books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={handleSelectBook}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Carrito lateral */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onDelete={handleDeleteFromCart}
        onCheckout={handleCartCheckout}
      />

      {/* Modal de checkout libro único */}
      {checkoutMode === 'single' && checkoutBook && (
        <CheckoutModal
          mode="single"
          book={checkoutBook}
          open={checkoutOpen}
          onClose={handleCheckoutClose}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Modal de checkout carrito */}
      {checkoutMode === 'cart' && (
        <CheckoutModal
          mode="cart"
          items={cartItems}
          open={checkoutOpen}
          onClose={handleCheckoutClose}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        SpaceBook · Libreria Universal · {new Date().getFullYear()}
        {/* Botón de acceso al panel de administrador*/}
        <button
          onClick={() => setAdminOpen(true)}
          className="ml-3 text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors select-none"
          title="Panel de administrador"
          aria-label="Abrir panel de administrador"
        >
          ·
        </button>
      </footer>

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        categories={categories}
      />
    </main>
  )
}

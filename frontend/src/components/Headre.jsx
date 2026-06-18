import { useState } from 'react'
import { BookOpen, Search, X, ShoppingCart } from 'lucide-react'

function Headre({
  onSearch,
  searchQuery = '',
  cartCount = 0,
  onCartOpen,
}) {
  const [showSearch, setShowSearch] = useState(false)

  const handleSearch = (e) => {
    onSearch?.(e.target.value)
  }

  const clearSearch = () => {
    onSearch?.('')
    setShowSearch(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground font-sans">
            SpaceBook
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar titulo o autor..."
                className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={clearSearch}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cerrar busqueda"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Buscar libros"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          )}

          {/* Botón del carrito */}
          <button
            onClick={onCartOpen}
            className="relative inline-flex items-center justify-center rounded-full border border-border bg-card p-2 text-muted-foreground shadow-sm hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Abrir carrito${cartCount > 0 ? `, ${cartCount} items` : ''}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
export default Headre
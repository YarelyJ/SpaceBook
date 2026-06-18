import { Star, ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import BookCover from './Book_cover'

function formatPrice(cents){
  return `$${(cents / 100).toFixed(2)}`
}

export default function BookCard({ book, onClick, onAddToCart }) {
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    onAddToCart(book)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(book)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(book)}
      className="group flex flex-col gap-2 rounded-xl p-2 cursor-pointer transition-all hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative transition-transform duration-200 group-hover:-translate-y-1">
        <BookCover book={book} />
        {/* Botón carrito superpuesto al hover */}
        <button
          onClick={handleAddToCart}
          aria-label={`Agregar ${book.title} al carrito`}
          className={`absolute bottom-2 right-2 flex items-center justify-center rounded-full p-1.5 shadow-md transition-all duration-200 ${
            added
              ? 'bg-green-500 text-white opacity-100 scale-110'
              : 'bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
          }`}
        >
          {added ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <ShoppingCart className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-0.5 px-1">
        <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2 text-balance">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="font-medium text-foreground">{book.rating}</span>
          </div>
          <span className="text-xs font-bold text-primary">
            {formatPrice(book.priceInCents)}
          </span>
        </div>
      </div>
    </div>
  )
}
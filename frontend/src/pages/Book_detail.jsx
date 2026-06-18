import { ArrowLeft, Star, BookOpen, Users, FileText, TrendingUp, ShoppingCart, Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import BookCover from './Book_cover'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function BookDetail({ book, category, onBack, onBuy, onAddToCart }) {
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    onAddToCart(book)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }
  const year = typeof book.year === 'number' && book.year < 0
    ? `${Math.abs(book.year)} a.C.`
    : book.year

  const stats = [
    { label: 'Valoración', value: book.rating.toString(), icon: <Star className="h-4 w-4 fill-accent text-accent" /> },
    { label: 'Reseñas', value: book.reviews.toLocaleString('es-ES'), icon: <Users className="h-4 w-4 text-primary" /> },
    { label: 'Páginas', value: book.pages.toLocaleString('es-ES'), icon: <FileText className="h-4 w-4 text-primary" /> },
    { label: 'Popularidad', value: `${book.popularity}/100`, icon: <TrendingUp className="h-4 w-4 text-primary" /> },
  ]

  return (
    console.log('BOOK DETAIL', book),
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Regresar al catálogo
      </button>

      <article className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="mx-auto w-44 md:mx-0 md:w-full">
          <BookCover book={book} size="detail" />

          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Precio</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {formatPrice(book.priceInCents)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">USD · Edición digital</p>
            </div>
            <Button
              onClick={() => onBuy(book)}
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4" />
              Comprar ahora
            </Button>
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Agregado al carrito
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Agregar al carrito
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            {category && (
              <Badge variant="secondary" className="mb-2">
                {category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-foreground text-balance md:text-4xl">
              {book.title}
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              {book.author} · {year}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                  {icon}
                  {label}
                </div>
                <span className="text-base font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Sinopsis
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {book.description}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">Género</h2>
            <p className="mt-1 text-sm text-muted-foreground">{book.genre}</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">Temas</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </div>
  )
}

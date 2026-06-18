import { Trash2, Plus, Minus, ShoppingCart, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/Sheet'
import { Button } from './ui/Button'
import BookCover from '../pages/Book_cover'

function formatPrice(cents){
  return `$${(cents / 100).toFixed(2)}`
}

export default function CartDrawer({
  open,
  onClose,
  items,
  onAdd,
  onRemove,
  onDelete,
  onCheckout,
}) {
  const total = items.reduce((sum, item) => sum + item.book.priceInCents * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Carrito
              {totalItems > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">Tu carrito esta vacio</p>
            <p className="text-sm text-muted-foreground">
              Agrega libros desde el catalogo para comenzar.
            </p>
            <Button variant="outline" onClick={onClose} className="mt-2">
              Explorar catalogo
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map(({ book, quantity }) => (
                  <li
                    key={book.id}
                    className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                  >
                    <div className="w-12 flex-shrink-0">
                      <BookCover book={book} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-background">
                          <button
                            onClick={() => onRemove(book.id)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-foreground">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onAdd(book)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(book.priceInCents * quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(book.id)}
                      className="flex-shrink-0 self-start rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Eliminar del carrito"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resumen y checkout */}
            <div className="border-t border-border bg-card px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'libro' : 'libros'})</span>
                <span className="font-semibold text-foreground">{formatPrice(total)}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary text-lg">{formatPrice(total)}</span>
              </div>
              <Button onClick={onCheckout} className="w-full gap-2" size="lg">
                <ShoppingCart className="h-4 w-4" />
                Pagar ahora
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Pago seguro procesado por Stripe
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
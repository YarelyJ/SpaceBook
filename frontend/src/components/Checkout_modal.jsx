import { useCallback, useState } from 'react'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialoj'
import { startCheckoutSession, startCartCheckoutSession } from '../lib/api'
import CartDrawer from "./Cart_dratail";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function CheckoutModal(props) {
  const [checkoutComplete, setCheckoutComplete] = useState(false)

  const fetchClientSecret = useCallback(() => {
    if (props.mode === 'single') {
      return startCheckoutSession(props.book.id)
    }
    if (props.items.length === 0) return Promise.resolve('')
    return startCartCheckoutSession(
      props.items.map((i) => ({ bookId: i.book.id, quantity: i.quantity }))
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.mode,
    props.mode === 'single' ? props.book.id : JSON.stringify(props.items.map(i => `${i.book.id}:${i.quantity}`)),
  ])

  const handleComplete = () => {
    setCheckoutComplete(true)
    props.onSuccess()
  }

  // Título del header según modo
  const title = props.mode === 'single' ? 'Comprar libro' : `Pagar carrito`
  const subtitle =
    props.mode === 'single'
      ? `${props.book.title} · ${props.book.author}`
      : `${props.items.reduce((s, i) => s + i.quantity, 0)} libros · Total ${formatPrice(
          props.items.reduce((s, i) => s + i.book.priceInCents * i.quantity, 0)
        )}`

  const successMessage =
    props.mode === 'single' ? (
      <>
        Gracias por adquirir{' '}
        <span className="font-medium text-foreground">{props.book.title}</span>.
        Recibirás un correo con tu libro digital.
      </>
    ) : (
      <>
        Gracias por tu compra de{' '}
        <span className="font-medium text-foreground">
          {props.items.reduce((s, i) => s + i.quantity, 0)} libros
        </span>
        . Recibirás un correo con tus libros digitales.
      </>
    )

  const isOpen =
    props.mode === 'single' ? props.open : props.items.length > 0 && props.open

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && props.onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            {title}
          </DialogTitle>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{subtitle}</p>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto">
          {checkoutComplete ? (
            <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Compra exitosa</h3>
                <p className="mt-1 text-sm text-muted-foreground">{successMessage}</p>
              </div>
              <button
                onClick={props.onClose}
                className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div id="checkout" className="p-4">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret, onComplete: handleComplete }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import { X, Lock, BookOpen, Tag, BarChart2, LogOut, Eye, EyeOff } from 'lucide-react'

// Credenciales hardcodeadas en el frontend (solo para demo).
// En producción, esto debería validarse contra el backend.
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'spacebook2024'

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function LoginForm({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Simula un pequeño delay para que no parezca instantáneo
    setTimeout(() => {
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        onLogin()
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Acceso Administrador</h2>
          <p className="text-sm text-muted-foreground text-center">
            Ingresa tus credenciales para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="adm-user">
              Usuario
            </label>
            <input
              id="adm-user"
              type="text"
              autoComplete="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="admin"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="adm-pass">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="adm-pass"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Dashboard({ categories, onLogout }) {
  const totalBooks = categories.reduce((acc, c) => acc + c.books.length, 0)
  const totalCategories = categories.length
  const avgRating =
    categories.length === 0
      ? 0
      : (
          categories
            .flatMap((c) => c.books)
            .reduce((acc, b) => acc + (b.rating ?? 0), 0) /
          Math.max(
            categories.flatMap((c) => c.books).length,
            1
          )
        ).toFixed(1)

  const totalReviews = categories
    .flatMap((c) => c.books)
    .reduce((acc, b) => acc + (b.reviews ?? 0), 0)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">SpaceBook Admin</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Stats */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Resumen del catálogo
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Libros totales" value={totalBooks} icon={BookOpen} />
            <StatCard label="Categorías" value={totalCategories} icon={Tag} />
            <StatCard label="Rating promedio" value={avgRating} icon={BarChart2} />
            <StatCard label="Reseñas totales" value={totalReviews.toLocaleString()} icon={BarChart2} />
          </div>
        </div>

        {/* Tabla de categorías */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Libros por categoría
          </h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Categoría</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Libros</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Rating prom.</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => {
                  const avgCat =
                    cat.books.length === 0
                      ? '—'
                      : (
                          cat.books.reduce((a, b) => a + (b.rating ?? 0), 0) /
                          cat.books.length
                        ).toFixed(1)
                  return (
                    <tr
                      key={cat.slug}
                      className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}
                    >
                      <td className="px-4 py-2.5 font-medium text-foreground">{cat.name}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{cat.books.length}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{avgCat}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista completa de libros */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Inventario completo
          </h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Título</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Autor</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Precio</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground hidden md:table-cell">Rating</th>
                </tr>
              </thead>
              <tbody>
                {categories.flatMap((cat) =>
                  cat.books.map((book, i) => (
                    <tr
                      key={book.id}
                      className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}
                    >
                      <td className="px-4 py-2.5 text-foreground max-w-[160px] truncate">
                        {book.emoji && <span className="mr-1">{book.emoji}</span>}
                        {book.title}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{book.author}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        ${((book.priceInCents ?? 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground hidden md:table-cell">
                        {book.rating ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel({ open, onClose, categories = [] }) {
  const [authed, setAuthed] = useState(false)

  // Cerrar panel también resetea la sesión
  const handleClose = () => {
    onClose()
    // Pequeño delay para que no se vea el reset antes de que cierre
    setTimeout(() => setAuthed(false), 300)
  }

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel lateral derecho */}
      <div className="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-background shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Cerrar panel de administrador"
        >
          <X className="h-5 w-5" />
        </button>

        {authed ? (
          <Dashboard
            categories={categories}
            onLogout={() => setAuthed(false)}
          />
        ) : (
          <LoginForm onLogin={() => setAuthed(true)} />
        )}
      </div>
    </div>
  )
}

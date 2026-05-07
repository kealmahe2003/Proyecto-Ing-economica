import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <span className="mono text-7xl font-bold mb-4" style={{ color: 'var(--border)' }}>404</span>
      <h1 className="display text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
        Página no encontrada
      </h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2" style={{ width: 'auto', padding: '0.65rem 1.4rem' }}>
        ← Volver al inicio
      </Link>
    </div>
  )
}

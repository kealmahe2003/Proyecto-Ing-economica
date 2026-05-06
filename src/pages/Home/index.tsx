import { Link } from 'react-router-dom'

const MODULES = [
  { to: '/simple', num: '01', label: 'Interés Simple', desc: 'Crecimiento lineal. Calcula F, P, i o n.', color: '#00C9A7' },
  { to: '/compuesto', num: '02', label: 'Interés Compuesto', desc: 'Capitalización. El poder del tiempo.', color: '#4F7CFF' },
  { to: '/tasas', num: '03', label: 'Conversión de Tasas', desc: 'EA, nominal, anticipada, vencida.', color: '#F5C842' },
  { to: '/amortizacion', num: '04', label: 'Amortización', desc: 'Tablas francés y alemán completas.', color: '#FF6B6B' },
  { to: '/anualidades', num: '05', label: 'Anualidades', desc: 'Series uniformes, PV, FV, PMT.', color: '#A78BFA' },
  { to: '/inflacion', num: '06', label: 'Inflación & Tasas Reales', desc: 'Ecuación de Fisher. Poder adquisitivo.', color: '#34D399' },
]

export default function HomePage() {
  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="mb-14">
        <span className="section-chip mb-4 inline-flex">◈ Ingeniería Económica · 2025</span>
        <h1 className="display text-4xl lg:text-5xl font-semibold mb-4"
          style={{ color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
          Calculadora &<br />
          <span style={{ color: '#00C9A7' }}>Guía de referencia</span>
        </h1>
        <p className="text-base max-w-xl" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
          Herramienta completa para estudiantes de ingeniería. Calculadoras con lógica exacta,
          explicaciones claras y una wiki de conceptos para dominar la materia.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/simple" className="btn-primary inline-flex items-center gap-2"
            style={{ width: 'auto', padding: '0.65rem 1.4rem' }}>
            → Comenzar
          </Link>
          <Link to="/wiki"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
            Wiki de conceptos
          </Link>
        </div>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(m => (
          <Link key={m.to} to={m.to}
            className="glass-card p-5 group transition-all duration-200 hover:scale-[1.01]"
            style={{ textDecoration: 'none', display: 'block' }}>
            <div className="flex items-start justify-between mb-4">
              <span className="mono text-xs" style={{ color: 'var(--muted)' }}>{m.num}</span>
              <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
            </div>
            <h3 className="display text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>{m.label}</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{m.desc}</p>
            <div className="mt-4 text-xs mono transition-all duration-200"
              style={{ color: m.color, opacity: 0.7 }}>
              Abrir calculadora →
            </div>
          </Link>
        ))}
      </div>

      {/* Wiki card */}
      <Link to="/wiki"
        className="mt-4 glass-card p-5 flex items-center justify-between group transition-all duration-200 hover:scale-[1.005]"
        style={{ textDecoration: 'none', display: 'flex', borderColor: 'rgba(79,124,255,0.2)' }}>
        <div>
          <p className="mono text-xs mb-1" style={{ color: '#8AABFF' }}>Referencia</p>
          <h3 className="display text-xl font-semibold" style={{ color: 'var(--text)' }}>Wiki de Conceptos</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            Definiciones, fórmulas y ejemplos de todos los temas del curso — expandibles y buscables.
          </p>
        </div>
        <span className="text-2xl" style={{ color: '#4F7CFF' }}>◎</span>
      </Link>
    </div>
  )
}

import { Link } from 'react-router-dom'

const MODULES = [
  {
    to: '/wiki',
    num: '01',
    label: 'Wiki de Conceptos',
    desc: 'Definiciones, fórmulas y ejemplos — expandibles y buscables.',
  },
  {
    to: '/tasas',
    num: '02',
    label: 'Conversión de Tasas',
    desc: 'EA, nominal, anticipada, vencida.',
  },
  {
    to: '/simple',
    num: '03',
    label: 'Interés Simple',
    desc: 'Crecimiento lineal. Calcula F, P, i o n.',
  },
  {
    to: '/compuesto',
    num: '04',
    label: 'Interés Compuesto',
    desc: 'Capitalización. El poder del tiempo.',
  },
  { to: '/anualidades', num: '05', label: 'Anualidades', desc: 'Series uniformes, PV, FV, PMT.' },
  {
    to: '/amortizacion',
    num: '06',
    label: 'Amortización',
    desc: 'Tablas francés y alemán completas.',
  },
  {
    to: '/inflacion',
    num: '07',
    label: 'Inflación & Tasas Reales',
    desc: 'Ecuación de Fisher. Poder adquisitivo.',
  },
]

export default function HomePage() {
  return (
    <div className="p-6 lg:p-12 max-w-3xl mx-auto">
      {/* Hero */}
      <div className="mb-12">
        <h1
          className="display font-semibold mb-3"
          style={{
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            color: 'var(--text)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}
        >
          Software de apoyo al cálculo de
          <br />
          <span style={{ color: 'var(--accent)' }}>operaciones y transacciones</span>
        </h1>
        <p
          style={{
            color: 'var(--muted)',
            lineHeight: 1.75,
            maxWidth: '44ch',
            margin: '0 0 1.5rem',
          }}
        >
          Herramienta para estudiantes de ingeniería. Calculadoras con lógica exacta y una wiki de
          conceptos para dominar la materia.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/wiki"
            className="btn-primary inline-flex items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            Comenzar →
          </Link>
          <Link
            to="/tasas"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              textDecoration: 'none',
            }}
          >
            Calculadoras
          </Link>
        </div>
      </div>

      {/* Module list — editorial numbered rows */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {MODULES.map((m) => (
          <div key={m.to}>
            <Link to={m.to} className="module-row">
              <span className="module-num">{m.num}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text)', margin: 0, lineHeight: 1.3 }}
                >
                  {m.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', margin: 0 }}>
                  {m.desc}
                </p>
              </div>
              <span className="module-arrow">→</span>
            </Link>
            <div style={{ height: 1, background: 'var(--border)', margin: '0 0.75rem' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

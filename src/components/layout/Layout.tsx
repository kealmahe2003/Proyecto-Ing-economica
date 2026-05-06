import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const NAV = [
  {
    group: 'Calculadoras',
    items: [
      { to: '/simple', label: 'Interés Simple', icon: '₁' },
      { to: '/compuesto', label: 'Interés Compuesto', icon: '²' },
      { to: '/tasas', label: 'Conversión de Tasas', icon: '⇄' },
      { to: '/amortizacion', label: 'Amortización', icon: '≡' },
      { to: '/anualidades', label: 'Anualidades', icon: '∑' },
      { to: '/inflacion', label: 'Inflación & Tasas Reales', icon: '↑' },
    ],
  },
  {
    group: 'Aprender',
    items: [
      { to: '/wiki', label: 'Wiki de Conceptos', icon: '◎' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sideOpen, setSideOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen">
      <div className="page-bg-grid" />
      <div className="page-bg-glow" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300
          ${sideOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:relative lg:flex`}
        style={{ width: 240, minWidth: 240, background: 'rgba(14,18,32,0.97)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#00C9A7,#4F7CFF)', color: '#071A14' }}>
            Σ
          </div>
          <span className="display font-semibold text-base" style={{ color: 'var(--text)' }}>
            Fin<span style={{ color: 'var(--teal)' }}>Calc</span>
          </span>
        </NavLink>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map(({ group, items }) => (
            <div key={group} className="mb-5">
              <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                {group}
              </p>
              {items.map(({ to, label, icon }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-150
                    ${isActive
                      ? 'text-white font-medium'
                      : 'hover:bg-white/5'}`
                  }
                  style={({ isActive }) => isActive
                    ? { background: 'rgba(0,201,167,0.12)', color: '#00C9A7', fontFamily: 'Outfit' }
                    : { color: 'var(--muted)', fontFamily: 'Outfit' }
                  }
                  onClick={() => setSideOpen(false)}
                >
                  <span className="mono text-sm w-5 text-center" style={{ opacity: 0.7 }}>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
          Ingeniería Económica · 2025
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSideOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'rgba(14,18,32,0.95)' }}>
          <button onClick={() => setSideOpen(true)} className="p-2.5 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: 'var(--muted)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="display font-semibold" style={{ color: 'var(--text)' }}>
            Fin<span style={{ color: 'var(--teal)' }}>Calc</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

// ── FIELD ────────────────────────────────────────────────────
interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  unit?: string
  disabled?: boolean
  error?: string
  hint?: string
  type?: 'number' | 'text'
}
export function Field({ label, value, onChange, placeholder, unit, disabled, error, hint, type = 'number' }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</label>
      <div className="relative">
        <input
          type={type}
          className="input-field pr-12"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={0}
          style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs mono" style={{ color: 'var(--muted)' }}>
            {unit}
          </span>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--muted)' }}>{hint}</p>}
    </div>
  )
}

// ── SELECT ───────────────────────────────────────────────────
interface SelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}
export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</label>
      <select className="select-field" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── MODE TABS ─────────────────────────────────────────────────
interface ModeTabsProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}
export function ModeTabs({ options, value, onChange }: ModeTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-all duration-150 touch-manipulation cursor-pointer"
          style={value === o.value
            ? { background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontFamily: 'DM Sans' }
            : { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'DM Sans' }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── RESULT CARD ───────────────────────────────────────────────
interface ResultCardProps {
  label: string
  value: string
  accent?: boolean
  sub?: { label: string; value: string }[]
}
export function ResultCard({ label, value, accent, sub }: ResultCardProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div
      className="rounded-xl p-5 transition-all duration-300"
      style={{
        background: accent ? 'var(--accent-bg)' : 'var(--surface2)',
        border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <p className="text-xs mono uppercase tracking-widest mb-1" style={{ color: accent ? 'var(--accent)' : 'var(--muted)' }}>
        {label}
      </p>
      <p className="result-number text-2xl sm:text-3xl" style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {value}
      </p>
      {sub && (
        <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          {sub.map(s => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</p>
              <p className="text-sm font-medium mono mt-0.5" style={{ color: 'var(--text)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── FORMULA BOX ───────────────────────────────────────────────
export function FormulaBox({ formula }: { formula: string }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm mono overflow-x-auto"
      style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', color: 'var(--gold)' }}
    >
      <span className="whitespace-nowrap">{formula}</span>
    </div>
  )
}

// ── PAGE HEADER ───────────────────────────────────────────────
interface PageHeaderProps {
  chip: string
  title: string
  description: string
}
export function PageHeader({ chip, title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <span className="section-chip mb-4 inline-flex">{chip}</span>
      <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '0.875rem', marginBottom: '0.625rem' }}>
        <h1
          className="display text-3xl lg:text-4xl font-semibold"
          style={{ color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}
        >
          {title}
        </h1>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', maxWidth: '54ch', marginTop: '0.5rem' }}>
        {description}
      </p>
    </div>
  )
}

// ── CALLOUT ───────────────────────────────────────────────────
export function Callout({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'accent' | 'gold' }) {
  const styles = {
    blue: { bg: 'var(--blue-bg)', border: 'var(--blue-border)', text: 'var(--blue)' },
    accent: { bg: 'var(--accent-bg)', border: 'var(--accent-border)', text: 'var(--accent)' },
    gold: { bg: 'var(--gold-bg)', border: 'var(--gold-border)', text: 'var(--gold)' },
  }
  const s = styles[color]
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm leading-relaxed mb-5"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {children}
    </div>
  )
}

// ── DIVIDER ───────────────────────────────────────────────────
export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-xs mono uppercase tracking-widest px-2" style={{ color: 'var(--muted)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

// ── ERROR BOX ─────────────────────────────────────────────────
export function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm mt-3"
      style={{ background: 'var(--destructive-bg)', border: '1px solid var(--destructive-border)', color: 'var(--destructive)' }}
    >
      ⚠ {message}
    </div>
  )
}

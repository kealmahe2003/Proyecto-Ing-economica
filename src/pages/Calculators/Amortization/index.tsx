import { useState } from 'react'
import { PageHeader, Field, Select, ModeTabs, ResultCard, FormulaBox, Callout, Divider, ErrorBox } from '../../../components/ui'
import { calcFrenchAmortization, calcGermanAmortization } from '../../../lib/financial'
import { fmtCOP, fmtPct } from '../../../utils/format'
import type { AmortResult, RateMode } from '../../../types/finance.types'

const SYSTEMS = [
  { value: 'french', label: 'Francés (cuota fija)' },
  { value: 'german', label: 'Alemán (capital constante)' },
]
const MODES = [
  { value: 'vencido', label: 'Mes Vencido (MV)' },
  { value: 'anticipado', label: 'Mes Anticipado (MA)' },
]

const PAGE_SIZE = 12

export default function AmortizationPage() {
  const [system, setSystem] = useState('french')
  const [mode, setMode] = useState<RateMode>('vencido')
  const [P, setP] = useState('10000000')
  const [iPct, setIPct] = useState('1.5')
  const [n, setN] = useState('24')
  const [result, setResult] = useState<AmortResult | null>(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  function calculate() {
    setError('')
    setPage(0)
    try {
      const res = system === 'french'
        ? calcFrenchAmortization(+P, +iPct, +n, mode)
        : calcGermanAmortization(+P, +iPct, +n)
      setResult(res)
    } catch (e: any) { setError(e.message) }
  }

  const rows = result?.rows ?? []
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <PageHeader
        chip="Módulo 04"
        title="Tabla de Amortización"
        description="Genera la tabla completa de un crédito: cuotas, intereses, abono a capital y saldo pendiente período a período."
      />

      <Callout color="blue">
        <strong style={{ color: '#fff' }}>Sistema Francés</strong> (el más común en Colombia):
        la cuota es fija durante toda la vida del crédito. Al inicio se paga más interés que capital;
        al final, más capital que interés. <strong style={{ color: '#fff' }}>Sistema Alemán</strong>:
        el abono a capital es constante, pero la cuota disminuye cada período porque el interés baja.
      </Callout>

      <div className="space-y-2 mb-6">
        <FormulaBox formula="A = P × [i × (1+i)ⁿ] / [(1+i)ⁿ − 1]     — cuota fija (francés)" />
        <FormulaBox formula="Kₜ = P / n     — abono capital constante (alemán)" />
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Sistema</p>
            <ModeTabs options={SYSTEMS} value={system} onChange={v => { setSystem(v); setResult(null) }} />
          </div>
          {system === 'french' && (
            <div>
              <p className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Modalidad</p>
              <ModeTabs options={MODES} value={mode} onChange={v => { setMode(v as RateMode); setResult(null) }} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Field label="Monto del crédito P ($)" value={P} onChange={setP} placeholder="ej: 10000000" unit="$" />
          <Field label="Tasa efectiva por período i" value={iPct} onChange={setIPct} placeholder="ej: 1.5" unit="%" />
          <Field label="Número de cuotas n" value={n} onChange={setN} placeholder="ej: 24" />
        </div>

        <button className="btn-primary" onClick={calculate}>→ Generar tabla</button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ResultCard accent label={result.system === 'french' ? 'Cuota fija' : '1ª Cuota'} value={fmtCOP(result.payment)} />
            <ResultCard label="Total pagado" value={fmtCOP(result.totalPaid)} />
            <ResultCard label="Total intereses" value={fmtCOP(result.totalInterest)} />
            <ResultCard label="Costo financiero"
              value={fmtPct((result.totalInterest / result.totalPrincipal) * 100, 2)}
              sub={[
                { label: 'Sistema', value: result.system === 'french' ? 'Francés' : 'Alemán' },
                { label: 'Modalidad', value: result.mode === 'vencido' ? 'MV' : 'MA' },
              ]}
            />
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Tabla de amortización — {rows.length} períodos
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(28,34,56,0.9)' }}>
                    {['#', 'Saldo inicial', 'Cuota', 'Interés', 'Capital', 'Saldo final'].map(h => (
                      <th key={h} className="py-3 px-4 text-right first:text-center text-xs mono uppercase tracking-wider"
                        style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, idx) => (
                    <tr key={row.period}
                      style={{
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        borderBottom: '1px solid rgba(37,45,69,0.4)',
                      }}>
                      <td className="py-2.5 px-4 text-center mono text-xs" style={{ color: 'var(--muted)' }}>{row.period}</td>
                      <td className="py-2.5 px-4 text-right mono text-xs" style={{ color: 'var(--text)' }}>{fmtCOP(row.initialBalance)}</td>
                      <td className="py-2.5 px-4 text-right mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>{fmtCOP(row.payment)}</td>
                      <td className="py-2.5 px-4 text-right mono text-xs" style={{ color: '#FF8A8A' }}>{fmtCOP(row.interest)}</td>
                      <td className="py-2.5 px-4 text-right mono text-xs" style={{ color: '#8AABFF' }}>{fmtCOP(row.principal)}</td>
                      <td className="py-2.5 px-4 text-right mono text-xs" style={{ color: 'var(--text)' }}>{fmtCOP(row.finalBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: page === 0 ? 'var(--muted)' : 'var(--text)' }}>
                  ← Anterior
                </button>
                <span className="text-xs mono" style={{ color: 'var(--muted)' }}>
                  Pág {page + 1} / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: page === totalPages - 1 ? 'var(--muted)' : 'var(--text)' }}>
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Divider label="Teoría completa" />
      <div className="card p-6 space-y-4 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>¿Qué es amortizar?</h3>
        <p>
          Amortizar significa ir pagando gradualmente una deuda. En cada cuota se paga el <strong style={{ color: 'var(--text)' }}>interés</strong> del
          período (calculado sobre el saldo pendiente) y un <strong style={{ color: 'var(--text)' }}>abono al capital</strong>.
          La suma de todos los abonos a capital debe igualar exactamente el monto original del crédito.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Periodo vencido vs anticipado</h3>
        <p>
          En modalidad <strong style={{ color: 'var(--text)' }}>vencida</strong>, la cuota se paga al final de cada período
          y el interés se calcula sobre el saldo al inicio. En modalidad <strong style={{ color: 'var(--text)' }}>anticipada</strong>,
          la cuota se cobra al inicio del período — la primera cuota se paga en el momento del desembolso.
          Esto reduce el capital disponible desde el primer día, aumentando el costo efectivo del crédito.
        </p>
      </div>
    </div>
  )
}

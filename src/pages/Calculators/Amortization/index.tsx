import { useState } from 'react'
import {
  PageHeader,
  Field,
  ModeTabs,
  ResultCard,
  FormulaBox,
  Callout,
  Divider,
  ErrorBox,
  CashFlowDiagram,
} from '../../../components/ui'
import {
  calcFrenchAmortization,
  calcGermanAmortization,
  calcSimpleFixedAmort,
  calcSimpleConstantPrincipalAmort,
} from '../../../lib/financial'
import { fmtCOP, fmtPct } from '../../../utils/format'
import type { AmortResult, RateMode } from '../../../types/finance.types'

const INTEREST_TYPES = [
  { value: 'compound', label: 'Interés Compuesto' },
  { value: 'simple', label: 'Interés Simple' },
]

const SYSTEMS = [
  { value: 'fixed-payment', label: 'Cuota Fija' },
  { value: 'constant-principal', label: 'Capital Constante + Intereses' },
]

const MODES = [
  { value: 'vencido', label: 'Mes Vencido (MV)' },
  { value: 'anticipado', label: 'Mes Anticipado (MA)' },
]

const PAGE_SIZE = 12

export default function AmortizationPage() {
  const [interestType, setInterestType] = useState('compound')
  const [system, setSystem] = useState('fixed-payment')
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
      let res: AmortResult
      if (interestType === 'simple') {
        res =
          system === 'fixed-payment'
            ? calcSimpleFixedAmort(+P, +iPct, +n)
            : calcSimpleConstantPrincipalAmort(+P, +iPct, +n)
      } else {
        res =
          system === 'fixed-payment'
            ? calcFrenchAmortization(+P, +iPct, +n, mode)
            : calcGermanAmortization(+P, +iPct, +n)
      }
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  

  const rows = result?.rows ?? []
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function downloadExcel() {
    import('xlsx').then((XLSX) => {
      const data = rows.map((row) => ({
        '#': row.period,
        'Saldo inicial': row.initialBalance,
        'Cuota': row.payment,
        'Interés': row.interest,
        'Abono capital': row.principal,
        'Saldo final': row.finalBalance,
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Amortización')
      XLSX.writeFile(wb, 'tabla_amortizacion.xlsx')
    })
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <PageHeader
        chip="Módulo 04"
        title="Tabla de Amortización"
        description="Genera la tabla completa de un crédito: cuotas, intereses, abono a capital y saldo pendiente período a período."
      />

      <Callout color="blue">
        <strong>Cuota Fija:</strong> cuota constante; el interés baja cada período (el saldo
        disminuye) y el abono a capital sube. <strong>Capital Constante:</strong> el abono a capital
        es igual cada período, el interés baja y la cuota total disminuye con el tiempo.{' '}
        <em>
          En cuota fija compuesta, la columna &quot;Abono capital&quot; aumenta periodo a periodo —
          es correcto.
        </em>
      </Callout>

      <div className="space-y-2 mb-6">
        <FormulaBox title="Cuota fija (interés compuesto)" formula="Cuota = P × [i × (1+i)ⁿ] / [(1+i)ⁿ − 1]" />
        <FormulaBox title="Cuota fija (interés simple)" formula="Cuota = P / n + P × i" />
        <FormulaBox title="Capital constante" formula="Kₜ = P / n     Interésₜ = Saldoₜ × i" />
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <p
              className="text-xs mono uppercase tracking-widest mb-2"
              style={{ color: 'var(--muted)' }}
            >
              Tipo de interés
            </p>
            <ModeTabs
              options={INTEREST_TYPES}
              value={interestType}
              onChange={(v) => {
                setInterestType(v)
                setResult(null)
              }}
            />
          </div>
          <div>
            <p
              className="text-xs mono uppercase tracking-widest mb-2"
              style={{ color: 'var(--muted)' }}
            >
              Sistema
            </p>
            <ModeTabs
              options={SYSTEMS}
              value={system}
              onChange={(v) => {
                setSystem(v)
                setResult(null)
              }}
            />
          </div>
        </div>

        {interestType === 'compound' && system === 'fixed-payment' && (
          <div className="mb-4">
            <p
              className="text-xs mono uppercase tracking-widest mb-2"
              style={{ color: 'var(--muted)' }}
            >
              Modalidad
            </p>
            <ModeTabs
              options={MODES}
              value={mode}
              onChange={(v) => {
                setMode(v as RateMode)
                setResult(null)
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Field
            label="Monto del crédito P ($)"
            value={P}
            onChange={setP}
            placeholder="ej: 10000000"
            unit="$"
          />
          <Field
            label="Tasa de interés (i)"
            value={iPct}
            onChange={setIPct}
            placeholder="ej: 1.5"
            unit="%"
          />
          <Field label="Número de cuotas n" value={n} onChange={setN} placeholder="ej: 24" />
        </div>

        <button className="btn-primary" onClick={calculate}>
          → Generar tabla
        </button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up">
          <CashFlowDiagram
            p={result.totalPrincipal}
            pmt={result.payment}
            iPct={+iPct}
            n={+n}
            periodType="mes"
            payments={result.rows}
            type="amortization"
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ResultCard
              accent
              label={result.system === 'fixed-payment' ? 'Cuota fija' : '1ª Cuota'}
              value={fmtCOP(result.payment)}
            />
            <ResultCard label="Total pagado" value={fmtCOP(result.totalPaid)} />
            <ResultCard label="Total intereses" value={fmtCOP(result.totalInterest)} />
            <ResultCard
              label="Costo financiero"
              value={fmtPct((result.totalInterest / result.totalPrincipal) * 100, 2)}
              sub={[
                {
                  label: 'Sistema',
                  value: result.system === 'fixed-payment' ? 'Cuota Fija' : 'Capital Constante',
                },
                {
                  label: 'Interés',
                  value: result.interestType === 'compound' ? 'Compuesto' : 'Simple',
                },
              ]}
            />
          </div>

          <div className="card overflow-hidden">
            <div
              className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}
            >
              <p
                className="text-xs mono uppercase tracking-widest"
                style={{ color: 'var(--muted)' }}
              >
                Tabla de amortización — {rows.length} períodos ·{' '}
                {result.system === 'fixed-payment' ? 'Cuota Fija' : 'Capital Constante + Intereses'}{' '}
                · Interés {result.interestType === 'compound' ? 'Compuesto' : 'Simple'}
              </p>
              <button
                onClick={downloadExcel}
                className="text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                style={{
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent)',
                }}
              >
                ↓ Descargar Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['#', 'Saldo inicial', 'Cuota', 'Interés', 'Abono capital', 'Saldo final'].map(
                      (h) => (
                        <th
                          key={h}
                          className="py-3 px-4 text-right first:text-center text-xs mono uppercase tracking-wider"
                          style={{
                            color: 'var(--muted)',
                            borderBottom: '1px solid var(--border)',
                            fontWeight: 400,
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, idx) => (
                    <tr
                      key={row.period}
                      style={{
                        background: idx % 2 === 0 ? 'transparent' : 'var(--surface2)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <td
                        className="py-2.5 px-4 text-center mono text-xs"
                        style={{ color: 'var(--muted)' }}
                      >
                        {row.period}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs"
                        style={{ color: 'var(--text)' }}
                      >
                        {fmtCOP(row.initialBalance)}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        {fmtCOP(row.payment)}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs"
                        style={{ color: 'var(--destructive)' }}
                      >
                        {fmtCOP(row.interest)}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs"
                        style={{ color: 'var(--blue)' }}
                      >
                        {fmtCOP(row.principal)}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs"
                        style={{ color: 'var(--text)' }}
                      >
                        {fmtCOP(row.finalBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-5 py-3 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: page === 0 ? 'var(--muted)' : 'var(--text)',
                  }}
                >
                  ← Anterior
                </button>
                <span className="text-xs mono" style={{ color: 'var(--muted)' }}>
                  Pág {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: page === totalPages - 1 ? 'var(--muted)' : 'var(--text)',
                  }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Divider label="Teoría completa" />
      <div
        className="card p-6 space-y-4 text-sm"
        style={{ color: 'var(--muted)', lineHeight: 1.75 }}
      >
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          ¿Qué es amortizar?
        </h3>
        <p>
          Amortizar significa ir pagando gradualmente una deuda. En cada cuota se paga el{' '}
          <strong style={{ color: 'var(--text)' }}>interés</strong> del período (calculado sobre el
          saldo pendiente) y un <strong style={{ color: 'var(--text)' }}>abono al capital</strong>.
          La suma de todos los abonos a capital debe igualar exactamente el monto original del
          crédito.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Cuota Fija vs Capital Constante
        </h3>
        <p>
          En el sistema de <strong style={{ color: 'var(--text)' }}>Cuota Fija</strong>, el pago
          total es igual en todos los períodos. Al inicio, la mayor parte es interés; al final,
          mayoritariamente capital. Es el sistema más usado en créditos de consumo e hipotecas.
        </p>
        <p>
          En el sistema de{' '}
          <strong style={{ color: 'var(--text)' }}>Capital Constante + Intereses</strong>, el abono
          al capital es el mismo cada período. Como el saldo decrece regularmente, el interés de
          cada período disminuye y la cuota total va bajando. La primera cuota es la más alta.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Interés Simple vs Compuesto en amortización
        </h3>
        <p>
          Con <strong style={{ color: 'var(--text)' }}>interés compuesto</strong>, el interés de
          cada período se calcula sobre el saldo pendiente aplicando capitalización. Con{' '}
          <strong style={{ color: 'var(--text)' }}>interés simple</strong>, en el sistema de cuota
          fija el interés se calcula siempre sobre el capital original (constante); en el sistema de
          capital constante, el interés se calcula sobre el saldo restante sin capitalización.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Periodo vencido vs anticipado
        </h3>
        <p>
          En modalidad <strong style={{ color: 'var(--text)' }}>vencida</strong>, la cuota se paga
          al final de cada período. En modalidad{' '}
          <strong style={{ color: 'var(--text)' }}>anticipada</strong>, la cuota se cobra al inicio
          — disponible solo con interés compuesto y cuota fija.
        </p>
      </div>
    </div>
  )
}

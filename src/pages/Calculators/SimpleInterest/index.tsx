import { useState } from 'react'
import { PageHeader, Field, Select, ModeTabs, ResultCard, FormulaBox, Callout, Divider, ErrorBox } from '../../../components/ui'
import { calcSimpleF, calcSimpleP, calcSimpleN, calcSimpleI } from '../../../lib/simpleInterest'
import { fmtCOP, fmtPct } from '../../../utils/format'
import type { SimpleResult } from '../../../types/finance.types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Mode = 'F' | 'P' | 'n' | 'i'

const MODES = [
  { value: 'F', label: 'Calcular F (Valor Futuro)' },
  { value: 'P', label: 'Calcular P (Capital)' },
  { value: 'n', label: 'Calcular n (Tiempo)' },
  { value: 'i', label: 'Calcular i (tasa de interés)' },
]

const PERIODS = [
  { value: 'día',          label: 'Días' },
  { value: 'semana',       label: 'Semanas' },
  { value: 'quincena',     label: 'Quincenas' },
  { value: 'mes',          label: 'Meses' },
  { value: 'bimestre',     label: 'Bimestres' },
  { value: 'trimestre',    label: 'Trimestres' },
  { value: 'cuatrimestre', label: 'Cuatrimestres' },
  { value: 'semestre',     label: 'Semestres' },
  { value: 'año',          label: 'Años' },
]

// Períodos por año — para conversión proporcional de tasas (interés simple)
const PERIOD_FREQ: Record<string, number> = {
  día: 365, semana: 52, quincena: 24, mes: 12,
  bimestre: 6, trimestre: 4, cuatrimestre: 3, semestre: 2, año: 1,
}

const PERIOD_RATE_LABEL: Record<string, string> = {
  día: 'diaria', semana: 'semanal', quincena: 'quincenal', mes: 'mensual',
  bimestre: 'bimestral', trimestre: 'trimestral', cuatrimestre: 'cuatrimestral',
  semestre: 'semestral', año: 'anual',
}

const PERIOD_N_LABEL: Record<string, string> = {
  día: 'días', semana: 'semanas', quincena: 'quincenas', mes: 'meses',
  bimestre: 'bimestres', trimestre: 'trimestres', cuatrimestre: 'cuatrimestres',
  semestre: 'semestres', año: 'años',
}

export default function SimpleInterestPage() {
  const [mode, setMode] = useState<Mode>('F')
  const [P, setP] = useState('1000000')
  const [iPct, setIPct] = useState('2.5')
  const [n, setN] = useState('12')
  const [F, setF] = useState('')
  const [period, setPeriod] = useState('mes')
  const [result, setResult] = useState<SimpleResult | null>(null)
  const [error, setError] = useState('')

  // Convierte la tasa proporcionalmente cuando cambia el período
  function handlePeriodChange(newPeriod: string) {
    const parsed = parseFloat(iPct)
    if (parsed > 0 && !isNaN(parsed)) {
      const oldFreq = PERIOD_FREQ[period]
      const newFreq = PERIOD_FREQ[newPeriod]
      const converted = parsed * (oldFreq / newFreq)
      setIPct(parseFloat(converted.toFixed(6)).toString())
    }
    setPeriod(newPeriod)
    setResult(null)
    setError('')
  }

  function calculate() {
    setError('')
    try {
      let res: SimpleResult
      if (mode === 'F') res = calcSimpleF(+P, +iPct, +n)
      else if (mode === 'P') res = calcSimpleP(+F, +iPct, +n)
      else if (mode === 'n') res = calcSimpleN(+P, +F, +iPct)
      else res = calcSimpleI(+P, +F, +n)
      setResult(res)
    } catch (e: any) { setError(e.message) }
  }

  const chartData = result
    ? Array.from({ length: Math.min(Math.ceil(result.n) + 1, 25) }, (_, k) => ({
        n: k,
        'Monto (M)': Math.round(result.P + result.P * result.i * k),
      }))
    : []

  const rateLabel = `Tasa de interés ${PERIOD_RATE_LABEL[period]} (i)`
  const nLabel = `Número de ${PERIOD_N_LABEL[period]} n`
  const nUnit = PERIOD_N_LABEL[period]

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Módulo 01"
        title="Interés Simple"
        description="El interés se calcula siempre sobre el capital inicial. No hay capitalización: los intereses no generan más intereses."
      />

      <Callout color="blue">
        <strong>¿Cómo funciona?</strong> — En interés simple, el rendimiento es proporcional al tiempo y al capital.
        Si tienes $1.000.000 al 2% mensual durante 6 meses, cada mes ganas exactamente $20.000, sin importar el período.
        Total de intereses: $120.000. El dinero crece de forma <em>lineal</em>.
      </Callout>

      <div className="space-y-2 mb-6">
        <FormulaBox formula="I = P × i × n" />
        <FormulaBox formula="M = VF = P × (1 + i × n)" />
        <FormulaBox formula="P = M / (1 + i × n)" />
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <ModeTabs options={MODES} value={mode} onChange={v => { setMode(v as Mode); setResult(null); setError('') }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {mode !== 'P' && <Field label="Capital Inicial P ($)" value={P} onChange={setP} placeholder="ej: 1000000" unit="$" />}
          {(mode === 'P' || mode === 'n' || mode === 'i') && (
            <Field label="Valor Futuro F ($)" value={F} onChange={setF} placeholder="ej: 1300000" unit="$" />
          )}
          {mode !== 'i' && (
            <Field
              label={rateLabel}
              value={iPct}
              onChange={setIPct}
              placeholder="ej: 2.5"
              unit="%"
              hint="La tasa debe corresponder al período seleccionado"
            />
          )}
          {mode !== 'n' && <Field label={nLabel} value={n} onChange={setN} placeholder="ej: 12" />}
          <Select
            label="Unidad de período"
            value={period}
            onChange={handlePeriodChange}
            options={PERIODS}
          />
        </div>

        <button className="btn-primary" onClick={calculate}>→ Calcular</button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <ResultCard
              accent
              label={
                mode === 'F' ? 'Monto M = VF' :
                mode === 'P' ? 'Capital Inicial (P)' :
                mode === 'n' ? `Tiempo (n) en ${nUnit}` :
                'Tasa de interés (i)'
              }
              value={
                mode === 'F' ? fmtCOP(result.F) :
                mode === 'P' ? fmtCOP(result.P) :
                mode === 'n' ? `${result.n.toFixed(2)} ${nUnit}` :
                fmtPct(result.iPct)
              }
            />
            <ResultCard
              label="Interés total generado"
              value={fmtCOP(result.I)}
              sub={[
                { label: 'Capital inicial', value: fmtCOP(result.P) },
                { label: 'Valor futuro', value: fmtCOP(result.F) },
              ]}
            />
          </div>

          <FormulaBox formula={`M = VF = ${fmtCOP(result.P)} × (1 + ${fmtPct(result.iPct, 2)} × ${result.n.toFixed(2)}) = ${fmtCOP(result.F)}`} />

          {chartData.length > 1 && (
            <div className="card p-5 mt-6">
              <p className="text-xs mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                Evolución del capital en el tiempo
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="n" tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: nUnit, position: 'insideBottom', offset: -10, fill: 'var(--chart-tick)', fontSize: 10 }} />
                  <YAxis width={52} tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    formatter={(v: number) => [fmtCOP(v), 'Capital']}
                    labelFormatter={l => `${l} ${nUnit}`}
                  />
                  <Line type="linear" dataKey="Monto (M)" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {result.n >= 1 && result.n <= 120 && (
            <div className="card overflow-hidden mt-6">
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Tabla período a período — {Math.min(Math.ceil(result.n), 60)} {nUnit}
                  {result.n > 60 ? ' (primeros 60)' : ''}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--surface2)' }}>
                      {['#', 'Saldo inicial', 'Interés del período', 'Saldo final'].map(h => (
                        <th key={h} className="py-3 px-4 text-right first:text-center text-xs mono uppercase tracking-wider"
                          style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.min(Math.ceil(result.n), 60) }, (_, k) => {
                      const per = k + 1
                      const isLast = per === Math.ceil(result.n)
                      const initBalance = result.P * (1 + result.i * k)
                      const intPeriod = isLast && result.n !== Math.ceil(result.n)
                        ? result.P * result.i * (result.n - k)
                        : result.P * result.i
                      const finalBal = isLast ? result.F : result.P * (1 + result.i * per)
                      return (
                        <tr key={per} style={{
                          background: k % 2 === 0 ? 'transparent' : 'var(--surface2)',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          <td className="py-2.5 px-4 text-center mono text-xs" style={{ color: 'var(--muted)' }}>{per}</td>
                          <td className="py-2.5 px-4 text-right mono text-xs" style={{ color: 'var(--text)' }}>{fmtCOP(initBalance)}</td>
                          <td className="py-2.5 px-4 text-right mono text-xs" style={{ color: 'var(--destructive)' }}>{fmtCOP(intPeriod)}</td>
                          <td className="py-2.5 px-4 text-right mono text-xs" style={{ color: 'var(--text)' }}>{fmtCOP(finalBal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <Divider label="Teoría completa" />
      <div className="card p-6 space-y-4 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>¿Cuándo se usa interés simple?</h3>
        <p>
          El interés simple se aplica principalmente en operaciones de <strong style={{ color: 'var(--text)' }}>corto plazo</strong>:
          préstamos de consumo, descuentos comerciales, operaciones del mercado monetario y papeles de deuda con vencimiento
          menor a un año. En Colombia, la cartera de crédito de consumo a menos de 30 días generalmente maneja interés simple.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Variables de la fórmula</h3>
        <ul className="space-y-2 list-none">
          {[
            ['P (Capital / Valor Presente)', 'Dinero inicial o monto del préstamo. Siempre en la misma moneda.'],
            ['i (Tasa de interés)', 'Debe coincidir en unidad de tiempo con n. Si n está en meses, i debe ser mensual.'],
            ['n (Número de períodos)', 'Tiempo transcurrido. Pueden ser días, semanas, meses, años. La unidad importa.'],
            ['M = VF (Monto / Valor Futuro)', 'Capital más intereses acumulados. M = P + I.'],
            ['I (Interés)', 'Rentabilidad o costo financiero total. I = P × i × n.'],
          ].map(([term, def]) => (
            <li key={term} className="flex gap-3">
              <span className="mono text-xs pt-1 flex-shrink-0" style={{ color: 'var(--accent)' }}>▸</span>
              <span><strong style={{ color: 'var(--text)' }}>{term}:</strong> {def}</span>
            </li>
          ))}
        </ul>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Conversión entre períodos</h3>
        <p>
          En interés simple, la conversión de tasas es <strong style={{ color: 'var(--text)' }}>proporcional</strong>:
          una tasa mensual del 2% equivale a 24% anual (2% × 12) o a 0.0657% diario (2% × 12/365).
          Al cambiar la unidad de período en la calculadora, la tasa se convierte automáticamente.
        </p>
      </div>
    </div>
  )
}

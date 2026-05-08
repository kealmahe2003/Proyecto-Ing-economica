import { useState } from 'react'
import { PageHeader, Field, Select, ModeTabs, ResultCard, FormulaBox, Callout, Divider, ErrorBox } from '../../../components/ui'
import { calcSimpleF, calcSimpleP, calcSimpleN, calcSimpleI } from '../../../lib/simpleInterest'
import { fmtCOP, fmtPct } from '../../../utils/format'
import type { SimpleResult } from '../../../types/finance.types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Mode = 'F' | 'P' | 'n' | 'i'

const MODES = [
  { value: 'F', label: 'Calcular F (Valor Futuro)' },
  { value: 'P', label: 'Calcular P (Capital)' },
  { value: 'n', label: 'Calcular n (Tiempo)' },
  { value: 'i', label: 'Calcular i (Tasa)' },
]

const PERIODS = [
  { value: 'mes', label: 'Meses' },
  { value: 'año', label: 'Años' },
  { value: 'día', label: 'Días' },
]

export default function SimpleInterestPage() {
  const [mode, setMode] = useState<Mode>('F')
  const [P, setP] = useState('1000000')
  const [iPct, setIPct] = useState('2.5')
  const [n, setN] = useState('12')
  const [F, setF] = useState('')
  const [period, setPeriod] = useState('mes')
  const [result, setResult] = useState<SimpleResult | null>(null)
  const [error, setError] = useState('')

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

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Módulo 01"
        title="Interés Simple"
        description="El interés se calcula siempre sobre el capital inicial. No hay capitalización: los intereses no generan más intereses."
      />

      {/* THEORY */}
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

      {/* CALCULATOR */}
      <div className="card p-6 mb-6">
        <ModeTabs options={MODES} value={mode} onChange={v => { setMode(v as Mode); setResult(null); setError('') }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {mode !== 'P' && <Field label="Capital Inicial P ($)" value={P} onChange={setP} placeholder="ej: 1000000" unit="$" />}
          {(mode === 'P' || mode === 'n' || mode === 'i') && (
            <Field label="Valor Futuro F ($)" value={F} onChange={setF} placeholder="ej: 1300000" unit="$" />
          )}
          {mode !== 'i' && <Field label="Tasa de interés i" value={iPct} onChange={setIPct} placeholder="ej: 2.5" unit="%" />}
          {mode !== 'n' && <Field label="Número de períodos n" value={n} onChange={setN} placeholder="ej: 12" />}
          <Select label="Unidad de período" value={period} onChange={setPeriod} options={PERIODS} />
        </div>

        <button className="btn-primary" onClick={calculate}>→ Calcular</button>
        {error && <ErrorBox message={error} />}
      </div>

      {/* RESULTS */}
      {result && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <ResultCard
              accent
              label={mode === 'F' ? 'Monto M = VF' : mode === 'P' ? 'Capital Inicial (P)' : mode === 'n' ? `Tiempo (n) en ${period}s` : 'Tasa de interés (i)'}
              value={
                mode === 'F' ? fmtCOP(result.F) :
                mode === 'P' ? fmtCOP(result.P) :
                mode === 'n' ? `${result.n.toFixed(2)} ${period}s` :
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

          {/* CHART */}
          {chartData.length > 1 && (
            <div className="card p-5 mt-6">
              <p className="text-xs mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                Evolución del capital en el tiempo
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="n" tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: `Períodos (${period}s)`, position: 'insideBottom', offset: -10, fill: 'var(--chart-tick)', fontSize: 10 }} />
                  <YAxis width={52} tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    formatter={(v: number) => [fmtCOP(v), 'Capital']}
                    labelFormatter={l => `Período ${l}`}
                  />
                  <Line type="linear" dataKey="Monto (M)" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* DEEP THEORY */}
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
            ['n (Número de períodos)', 'Tiempo transcurrido. Pueden ser días, meses, años. La unidad importa.'],
            ['M = VF (Monto / Valor Futuro)', 'Capital más intereses acumulados. M = P + I.'],
            ['I (Interés)', 'Rentabilidad o costo financiero total. I = P × i × n.'],
          ].map(([term, def]) => (
            <li key={term} className="flex gap-3">
              <span className="mono text-xs pt-1 flex-shrink-0" style={{ color: 'var(--accent)' }}>▸</span>
              <span><strong style={{ color: 'var(--text)' }}>{term}:</strong> {def}</span>
            </li>
          ))}
        </ul>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Diferencia con interés compuesto</h3>
        <p>
          En interés simple, los intereses de cada período <strong style={{ color: 'var(--text)' }}>no se capitalizan</strong> —
          es decir, no se suman al principal para generar más intereses. El crecimiento es lineal. En interés compuesto,
          cada período los intereses se acumulan al capital, generando un crecimiento exponencial. Para plazos largos,
          la diferencia entre ambos puede ser enorme.
        </p>
      </div>
    </div>
  )
}

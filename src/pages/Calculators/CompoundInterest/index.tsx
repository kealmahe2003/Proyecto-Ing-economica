import { useState } from 'react'
import { PageHeader, Field, Select, ModeTabs, ResultCard, FormulaBox, Callout, Divider, ErrorBox } from '../../../components/ui'
import { calcCompF, calcCompP, calcCompI, calcCompN } from '../../../lib/compoundInterest'
import { fmtCOP, fmtPct } from '../../../utils/format'
import type { CompoundResult } from '../../../types/finance.types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Mode = 'F' | 'P' | 'i' | 'n'

const MODES = [
  { value: 'F', label: 'Valor Futuro (F)' },
  { value: 'P', label: 'Valor Presente (P)' },
  { value: 'i', label: 'Tasa (i)' },
  { value: 'n', label: 'Períodos (n)' },
]

export default function CompoundInterestPage() {
  const [mode, setMode] = useState<Mode>('F')
  const [P, setP] = useState('5000000')
  const [iPct, setIPct] = useState('1.8')
  const [n, setN] = useState('24')
  const [F, setF] = useState('')
  const [result, setResult] = useState<CompoundResult | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    try {
      let res: CompoundResult
      if (mode === 'F') res = calcCompF(+P, +iPct, +n)
      else if (mode === 'P') res = calcCompP(+F, +iPct, +n)
      else if (mode === 'i') res = calcCompI(+P, +F, +n)
      else res = calcCompN(+P, +F, +iPct)
      setResult(res)
    } catch (e: any) { setError(e.message) }
  }

  const chartData = result?.series.map(s => ({
    n: s.period,
    'Interés Compuesto': Math.round(s.balance),
    'Interés Simple': Math.round(s.interestSimple),
  })) ?? []

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Módulo 02"
        title="Interés Compuesto"
        description="Los intereses generados se suman al capital al final de cada período, generando intereses sobre intereses. El dinero crece exponencialmente."
      />

      <Callout color="accent">
        <strong>La clave:</strong> En interés compuesto, cada período los intereses se
        <em> capitalizan</em> — se agregan al principal. Así, en el período siguiente, los intereses se calculan sobre
        un capital mayor. Esto es lo que genera el crecimiento exponencial y lo que hace tan poderoso al ahorro a largo plazo.
      </Callout>

      <div className="space-y-2 mb-6">
        <FormulaBox formula="F = P × (1 + i)ⁿ" />
        <FormulaBox formula="P = F × (1 + i)⁻ⁿ" />
        <FormulaBox formula="i = (F/P)^(1/n) − 1" />
        <FormulaBox formula="n = ln(F/P) / ln(1 + i)" />
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <ModeTabs options={MODES} value={mode} onChange={v => { setMode(v as Mode); setResult(null); setError('') }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {mode !== 'P' && <Field label="Valor Presente P ($)" value={P} onChange={setP} placeholder="ej: 5000000" unit="$" />}
          {(mode === 'P' || mode === 'i' || mode === 'n') && (
            <Field label="Valor Futuro F ($)" value={F} onChange={setF} placeholder="ej: 8000000" unit="$" />
          )}
          {mode !== 'i' && <Field label="Tasa efectiva por período i" value={iPct} onChange={setIPct} placeholder="ej: 1.8" unit="%" />}
          {mode !== 'n' && <Field label="Número de períodos n" value={n} onChange={setN} placeholder="ej: 24" />}
        </div>

        <button className="btn-primary" onClick={calculate}>→ Calcular</button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <ResultCard
              accent
              label={mode === 'F' ? 'Valor Futuro (F)' : mode === 'P' ? 'Valor Presente (P)' : mode === 'i' ? 'Tasa (i)' : 'Períodos (n)'}
              value={
                mode === 'F' ? fmtCOP(result.F) :
                mode === 'P' ? fmtCOP(result.P) :
                mode === 'i' ? fmtPct(result.i * 100) :
                `${result.n.toFixed(2)} períodos`
              }
            />
            <ResultCard label="Interés compuesto" value={fmtCOP(result.I)} />
            <ResultCard label="Factor (1+i)ⁿ" value={result.factor.toFixed(6)}
              sub={[
                { label: 'Si fuera simple', value: fmtCOP(result.iSimple) },
                { label: 'Ventaja compuesto', value: fmtCOP(result.I - result.iSimple) },
              ]}
            />
          </div>

          <FormulaBox formula={`F = ${fmtCOP(result.P)} × (1 + ${fmtPct(result.i * 100, 4)})^${result.n.toFixed(2)} = ${fmtCOP(result.F)}`} />

          {chartData.length > 1 && (
            <div className="card p-5 mt-6">
              <p className="text-xs mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                Compuesto vs Simple — el poder de la capitalización
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="n" tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <YAxis width={52} tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    formatter={(v: number) => [fmtCOP(v)]}
                    labelFormatter={l => `Período ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--chart-tick)' }} />
                  <Line type="monotone" dataKey="Interés Compuesto" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                  <Line type="linear" dataKey="Interés Simple" stroke="var(--chart-2)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <Divider label="Teoría completa" />
      <div className="card p-6 space-y-4 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>La capitalización y el tiempo</h3>
        <p>
          La característica definitoria del interés compuesto es que al final de cada período, los intereses se <strong style={{ color: 'var(--text)' }}>capitalizan</strong>:
          se suman al capital para formar la base del siguiente período. Esto crea un efecto multiplicador que se vuelve más
          dramático con el tiempo — razón por la que Einstein supuestamente llamó al interés compuesto "la octava maravilla del mundo".
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Tasa efectiva por período</h3>
        <p>
          La tasa <strong style={{ color: 'var(--text)' }}>i</strong> en la fórmula de interés compuesto debe ser la tasa
          <em> efectiva del período de capitalización</em>. Si el préstamo capitaliza mensualmente, i debe ser mensual.
          Si capitaliza trimestralmente, i debe ser trimestral. No se puede usar directamente una tasa anual con n mensual.
          Aquí entra la conversión de tasas.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Valor presente y descuento</h3>
        <p>
          Despejar P de la fórmula permite calcular el <strong style={{ color: 'var(--text)' }}>valor presente</strong>:
          cuánto vale hoy un monto futuro descontado a una tasa dada. Esto es fundamental en finanzas: un pago de $5M
          dentro de 3 años no vale $5M hoy, sino P = F × (1+i)⁻ⁿ. Este concepto es la base del VPN.
        </p>
      </div>
    </div>
  )
}

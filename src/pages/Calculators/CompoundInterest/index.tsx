import { useState } from 'react'
import {
  PageHeader,
  Field,
  Select,
  ModeTabs,
  ResultCard,
  FormulaBox,
  Callout,
  Divider,
  ErrorBox,
  CashFlowDiagram,
} from '../../../components/ui'
import { calcCompF, calcCompP, calcCompI, calcCompN } from '../../../lib/compoundInterest'
import { fmtCOP, fmtPct } from '../../../utils/format'
import type { CompoundResult } from '../../../types/finance.types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type Mode = 'F' | 'P' | 'i' | 'n'

const MODES = [
  { value: 'F', label: 'Valor Futuro (F)' },
  { value: 'P', label: 'Valor Presente (P)' },
  { value: 'i', label: 'Calcular i (tasa de interés)' },
  { value: 'n', label: 'Períodos (n)' },
]

const PERIODS = [
  { value: 'día', label: 'Días' },
  { value: 'semana', label: 'Semanas' },
  { value: 'quincena', label: 'Quincenas' },
  { value: 'mes', label: 'Meses' },
  { value: 'bimestre', label: 'Bimestres' },
  { value: 'trimestre', label: 'Trimestres' },
  { value: 'cuatrimestre', label: 'Cuatrimestres' },
  { value: 'semestre', label: 'Semestres' },
  { value: 'año', label: 'Años' },
]

// Períodos por año — para conversión efectiva de tasas (interés compuesto)
const PERIOD_FREQ: Record<string, number> = {
  día: 365,
  semana: 52,
  quincena: 24,
  mes: 12,
  bimestre: 6,
  trimestre: 4,
  cuatrimestre: 3,
  semestre: 2,
  año: 1,
}

const PERIOD_RATE_LABEL: Record<string, string> = {
  día: 'diaria',
  semana: 'semanal',
  quincena: 'quincenal',
  mes: 'mensual',
  bimestre: 'bimestral',
  trimestre: 'trimestral',
  cuatrimestre: 'cuatrimestral',
  semestre: 'semestral',
  año: 'anual',
}

const PERIOD_N_LABEL: Record<string, string> = {
  día: 'días',
  semana: 'semanas',
  quincena: 'quincenas',
  mes: 'meses',
  bimestre: 'bimestres',
  trimestre: 'trimestres',
  cuatrimestre: 'cuatrimestres',
  semestre: 'semestres',
  año: 'años',
}

export default function CompoundInterestPage() {
  const [mode, setMode] = useState<Mode>('F')
  const [P, setP] = useState('5000000')
  const [iPct, setIPct] = useState('1.8')
  const [n, setN] = useState('24')
  const [F, setF] = useState('')
  const [period, setPeriod] = useState('mes')
  const [result, setResult] = useState<CompoundResult | null>(null)
  const [error, setError] = useState('')

  // Convierte la tasa con la fórmula de equivalencia efectiva al cambiar período
  function handlePeriodChange(newPeriod: string) {
    const parsed = parseFloat(iPct)
    if (parsed > 0 && !isNaN(parsed)) {
      const oldFreq = PERIOD_FREQ[period]
      const newFreq = PERIOD_FREQ[newPeriod]
      const i_old = parsed / 100
      const i_new = Math.pow(1 + i_old, oldFreq / newFreq) - 1
      setIPct(parseFloat((i_new * 100).toFixed(6)).toString())
    }
    setPeriod(newPeriod)
    setResult(null)
    setError('')
  }

  function calculate() {
    setError('')
    try {
      let res: CompoundResult
      if (mode === 'F') res = calcCompF(+P, +iPct, +n)
      else if (mode === 'P') res = calcCompP(+F, +iPct, +n)
      else if (mode === 'i') res = calcCompI(+P, +F, +n)
      else res = calcCompN(+P, +F, +iPct)
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const chartData =
    result?.series.map((s) => ({
      n: s.period,
      'Interés Compuesto': Math.round(s.balance),
      'Interés Simple': Math.round(s.interestSimple),
    })) ?? []

  const rateLabel = `Tasa efectiva ${PERIOD_RATE_LABEL[period]} (i)`
  const nLabel = `Número de ${PERIOD_N_LABEL[period]} n`
  const nUnit = PERIOD_N_LABEL[period]

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Módulo 02"
        title="Interés Compuesto"
        description="Los intereses generados se suman al capital al final de cada período, generando intereses sobre intereses. El dinero crece exponencialmente."
      />

      <Callout color="accent">
        <strong>La clave:</strong> En interés compuesto, cada período los intereses se
        <em> capitalizan</em> — se agregan al principal. Así, en el período siguiente, los intereses
        se calculan sobre un capital mayor. Esto es lo que genera el crecimiento exponencial y lo
        que hace tan poderoso al ahorro a largo plazo.
      </Callout>

      <div className="space-y-2 mb-6">
        <FormulaBox formula="F = P × (1 + i)ⁿ" />
        <FormulaBox formula="P = F × (1 + i)⁻ⁿ" />
        <FormulaBox formula="i = (F/P)^(1/n) − 1" />
        <FormulaBox formula="n = ln(F/P) / ln(1 + i)" />
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <ModeTabs
          options={MODES}
          value={mode}
          onChange={(v) => {
            setMode(v as Mode)
            setResult(null)
            setError('')
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {mode !== 'P' && (
            <Field
              label="Valor Presente P ($)"
              value={P}
              onChange={setP}
              placeholder="ej: 5000000"
              unit="$"
            />
          )}
          {(mode === 'P' || mode === 'i' || mode === 'n') && (
            <Field
              label="Valor Futuro F ($)"
              value={F}
              onChange={setF}
              placeholder="ej: 8000000"
              unit="$"
            />
          )}
          {mode !== 'i' && (
            <Field
              label={rateLabel}
              value={iPct}
              onChange={setIPct}
              placeholder="ej: 1.8"
              unit="%"
              hint="Tasa efectiva por período seleccionado"
            />
          )}
          {mode !== 'n' && <Field label={nLabel} value={n} onChange={setN} placeholder="ej: 24" />}
          <Select
            label="Unidad de período"
            value={period}
            onChange={handlePeriodChange}
            options={PERIODS}
          />
        </div>

        <button className="btn-primary" onClick={calculate}>
          → Calcular
        </button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up">
          <CashFlowDiagram
            p={result.P}
            f={result.F}
            iPct={result.i * 100}
            n={result.n}
            periodType={period}
            type="compound"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <ResultCard
              accent
              label={
                mode === 'F'
                  ? 'Valor Futuro (F)'
                  : mode === 'P'
                    ? 'Valor Presente (P)'
                    : mode === 'i'
                      ? `Tasa ${PERIOD_RATE_LABEL[period]} (i)`
                      : `Períodos (${nUnit})`
              }
              value={
                mode === 'F'
                  ? fmtCOP(result.F)
                  : mode === 'P'
                    ? fmtCOP(result.P)
                    : mode === 'i'
                      ? fmtPct(result.i * 100)
                      : `${result.n.toFixed(2)} ${nUnit}`
              }
            />
            <ResultCard label="Interés compuesto" value={fmtCOP(result.I)} />
            <ResultCard
              label="Factor (1+i)ⁿ"
              value={result.factor.toFixed(6)}
              sub={[
                { label: 'Si fuera simple', value: fmtCOP(result.iSimple) },
                { label: 'Ventaja compuesto', value: fmtCOP(result.I - result.iSimple) },
              ]}
            />
          </div>

          <FormulaBox
            formula={`F = ${fmtCOP(result.P)} × (1 + ${fmtPct(result.i * 100, 4)})^${result.n.toFixed(2)} = ${fmtCOP(result.F)}`}
          />

          {chartData.length > 1 && (
            <div className="card p-5 mt-6">
              <p
                className="text-xs mono uppercase tracking-widest mb-4"
                style={{ color: 'var(--muted)' }}
              >
                Compuesto vs Simple — el poder de la capitalización
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis
                    dataKey="n"
                    tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    width={52}
                    tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--chart-tooltip-bg)',
                      border: '1px solid var(--chart-tooltip-border)',
                      borderRadius: 8,
                      fontFamily: 'JetBrains Mono',
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [fmtCOP(v)]}
                    labelFormatter={(l) => `Período ${l}`}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono',
                      color: 'var(--chart-tick)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Interés Compuesto"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="linear"
                    dataKey="Interés Simple"
                    stroke="var(--chart-2)"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {result.series.length > 0 && result.n <= 120 && (
            <div className="card overflow-hidden mt-6">
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p
                  className="text-xs mono uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Tabla período a período — {result.series.length} {nUnit}
                  {result.n > 60 ? ' (primeros 60)' : ''}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--surface2)' }}>
                      {['#', 'Saldo inicial', 'Interés del período', 'Saldo final'].map((h) => (
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
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.series.map((s, idx) => {
                      const initBalance = idx === 0 ? result.P : result.series[idx - 1].balance
                      const intPeriod = s.balance - initBalance
                      return (
                        <tr
                          key={s.period}
                          style={{
                            background: idx % 2 === 0 ? 'transparent' : 'var(--surface2)',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <td
                            className="py-2.5 px-4 text-center mono text-xs"
                            style={{ color: 'var(--muted)' }}
                          >
                            {s.period}
                          </td>
                          <td
                            className="py-2.5 px-4 text-right mono text-xs"
                            style={{ color: 'var(--text)' }}
                          >
                            {fmtCOP(initBalance)}
                          </td>
                          <td
                            className="py-2.5 px-4 text-right mono text-xs"
                            style={{ color: 'var(--destructive)' }}
                          >
                            {fmtCOP(intPeriod)}
                          </td>
                          <td
                            className="py-2.5 px-4 text-right mono text-xs"
                            style={{ color: 'var(--text)' }}
                          >
                            {fmtCOP(s.balance)}
                          </td>
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
      <div
        className="card p-6 space-y-4 text-sm"
        style={{ color: 'var(--muted)', lineHeight: 1.75 }}
      >
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          La capitalización y el tiempo
        </h3>
        <p>
          La característica definitoria del interés compuesto es que al final de cada período, los
          intereses se <strong style={{ color: 'var(--text)' }}>capitalizan</strong>: se suman al
          capital para formar la base del siguiente período. Esto crea un efecto multiplicador que
          se vuelve más dramático con el tiempo — razón por la que Einstein supuestamente llamó al
          interés compuesto &quot;la octava maravilla del mundo&quot;.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Tasa efectiva por período
        </h3>
        <p>
          La tasa <strong style={{ color: 'var(--text)' }}>i</strong> en la fórmula de interés
          compuesto debe ser la tasa
          <em> efectiva del período de capitalización</em>. Si el préstamo capitaliza mensualmente,
          i debe ser mensual. Si capitaliza trimestralmente, i debe ser trimestral. Al cambiar la
          unidad de período, la tasa se convierte automáticamente usando la fórmula de equivalencia:
          i_nueva = (1 + i_original)^(factor) − 1.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Valor presente y descuento
        </h3>
        <p>
          Despejar P de la fórmula permite calcular el{' '}
          <strong style={{ color: 'var(--text)' }}>valor presente</strong>: cuánto vale hoy un monto
          futuro descontado a una tasa dada. Esto es fundamental en finanzas: un pago de $5M dentro
          de 3 años no vale $5M hoy, sino P = F × (1+i)⁻ⁿ. Este concepto es la base del VPN.
        </p>
      </div>
    </div>
  )
}

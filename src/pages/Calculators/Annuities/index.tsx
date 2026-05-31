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
import { calcAnnuityPV, calcAnnuityFV, calcAnnuityPMT } from '../../../lib/financial'
import { fmtCOP } from '../../../utils/format'
import type { AnnuityResult } from '../../../types/finance.types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const MODES = [
  { value: 'PV', label: 'Valor Presente (PV)' },
  { value: 'FV', label: 'Valor Futuro (FV)' },
  { value: 'PMT', label: 'Cuota (PMT)' },
]

export default function AnnuitiesPage() {
  const [mode, setMode] = useState('FV')
  const [PMT, setPMT] = useState('500000')
  const [iPct, setIPct] = useState('1.5')
  const [n, setN] = useState('36')
  const [PV, setPV] = useState('10000000')
  const [result, setResult] = useState<AnnuityResult | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    try {
      let res: AnnuityResult
      if (mode === 'FV') res = calcAnnuityFV(+PMT, +iPct, +n)
      else if (mode === 'PV') res = calcAnnuityPV(+PMT, +iPct, +n)
      else res = calcAnnuityPMT(+PV, +iPct, +n)
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  // Chart: evolución del saldo período a período (limitado a 60 puntos)
  const chartData = result?.series
    ? result.series.slice(0, 60).map((s) => ({
        período: s.period,
        'Saldo acumulado': Math.round(s.balance),
        'Aportes acumulados': Math.round(result.PMT * s.period),
      }))
    : []

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Módulo 05"
        title="Anualidades y Series Uniformes"
        description="Una serie uniforme es un conjunto de pagos iguales realizados en intervalos iguales de tiempo. Permiten calcular créditos, ahorros programados y planes de pensión."
      />

      <Callout color="blue">
        <strong>Serie uniforme ordinaria:</strong> pagos iguales PMT al final de cada período. El
        valor presente PV es el valor hoy de todos esos pagos. El valor futuro FV es la acumulación
        de todos los pagos con sus intereses. Esta es la base matemática de todo crédito y plan de
        ahorro.
      </Callout>

      <div className="space-y-2 mb-6">
        <FormulaBox formula="PV = PMT × [1 − (1+i)^−n] / i     (Valor Presente de la serie)" />
        <FormulaBox formula="FV = PMT × [(1+i)^n − 1] / i       (Valor Futuro de la serie)" />
        <FormulaBox formula="PMT = PV × [i(1+i)^n] / [(1+i)^n − 1]   (Cuota dada PV)" />
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <ModeTabs
          options={MODES}
          value={mode}
          onChange={(v) => {
            setMode(v)
            setResult(null)
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {mode !== 'PMT' && (
            <Field label="Pago periódico PMT ($)" value={PMT} onChange={setPMT} unit="$" />
          )}
          {mode === 'PMT' && (
            <Field label="Valor Presente PV ($)" value={PV} onChange={setPV} unit="$" />
          )}
          <Field
            label="Tasa de interés (i)"
            value={iPct}
            onChange={setIPct}
            unit="%"
            hint="Tasa efectiva por período"
          />
          <Field label="Número de períodos n" value={n} onChange={setN} />
        </div>

        <button className="btn-primary" onClick={calculate}>
          → Calcular
        </button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up">
          <CashFlowDiagram
            p={result.PV}
            f={result.FV}
            pmt={result.PMT}
            iPct={+iPct}
            n={result.n}
            periodType="período"
            type="annuities"
            annuityMode={mode as 'PV' | 'FV' | 'PMT'}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <ResultCard
              accent
              label={
                mode === 'FV'
                  ? 'Valor Futuro (FV)'
                  : mode === 'PV'
                    ? 'Valor Presente (PV)'
                    : 'Cuota (PMT)'
              }
              value={
                mode === 'FV'
                  ? fmtCOP(result.FV)
                  : mode === 'PV'
                    ? fmtCOP(result.PV)
                    : fmtCOP(result.PMT)
              }
            />
            <ResultCard label="Cuota PMT" value={fmtCOP(result.PMT)} />
            <ResultCard label="Total pagado" value={fmtCOP(result.totalPaid)} />
            <ResultCard label="Intereses totales" value={fmtCOP(result.totalInterest)} />
          </div>

          {chartData.length > 1 && (
            <div className="card p-5 mt-2">
              <p
                className="text-xs mono uppercase tracking-widest mb-4"
                style={{ color: 'var(--muted)' }}
              >
                Evolución del valor acumulado vs aportes
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAportes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis
                    dataKey="período"
                    tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    width={56}
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
                  <Area
                    type="monotone"
                    dataKey="Saldo acumulado"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#colorSaldo)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Aportes acumulados"
                    stroke="var(--chart-2)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#colorAportes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                La diferencia entre las dos curvas es el{' '}
                <strong style={{ color: 'var(--accent)' }}>
                  rendimiento generado por los intereses
                </strong>
                .
              </p>
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
          ¿Qué es una anualidad?
        </h3>
        <p>
          Una <strong style={{ color: 'var(--text)' }}>anualidad</strong> (o serie uniforme) es
          cualquier sucesión de pagos iguales en intervalos iguales de tiempo. El nombre puede ser
          confuso: no tienen que ser anuales — pueden ser mensuales, trimestrales o semanales. Lo
          que define la serie es que los pagos son <em>iguales</em>y ocurren en períodos{' '}
          <em>regulares</em>.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Tipos de anualidades
        </h3>
        <ul className="space-y-2 list-none">
          {[
            [
              'Ordinaria (vencida)',
              'El pago ocurre al FINAL de cada período. Es la más común: créditos hipotecarios, tarjetas de crédito, planes de ahorro.',
            ],
            [
              'Anticipada',
              'El pago ocurre al INICIO de cada período. Ejemplo: arrendamientos pagados por adelantado.',
            ],
            [
              'Diferida',
              'La serie comienza después de un período de gracia. El primer pago ocurre k períodos después del presente.',
            ],
            [
              'Perpetua',
              'La serie no tiene fecha de vencimiento: los pagos continúan para siempre. PV = PMT / i.',
            ],
          ].map(([name, desc]) => (
            <li key={name} className="flex gap-3">
              <span className="mono text-xs pt-1 flex-shrink-0" style={{ color: 'var(--blue)' }}>
                ▸
              </span>
              <span>
                <strong style={{ color: 'var(--text)' }}>{name}:</strong> {desc}
              </span>
            </li>
          ))}
        </ul>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Aplicaciones reales
        </h3>
        <p>
          Todo crédito bancario en Colombia usa la fórmula de anualidad ordinaria para calcular la
          cuota mensual. Los planes de pensión voluntaria calculan el valor futuro de una serie de
          aportes. Los fondos de inversión colectiva proyectan el crecimiento con aportes periódicos
          usando estas mismas fórmulas.
        </p>
      </div>
    </div>
  )
}

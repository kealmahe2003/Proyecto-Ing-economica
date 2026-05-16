import { useState } from 'react'
import { PageHeader, Field, ResultCard, FormulaBox, Callout, Divider, ErrorBox } from '../../../components/ui'
import { calcRealRate } from '../../../lib/financial'
import { fmtCOP, fmtPct } from '../../../utils/format'
import type { InflationResult } from '../../../types/finance.types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function InflationPage() {
  const [nominal, setNominal] = useState('14')
  const [inflation, setInflation] = useState('6.5')
  const [P, setP] = useState('10000000')
  const [n, setN] = useState('5')
  const [result, setResult] = useState<InflationResult | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    try {
      setResult(calcRealRate(+nominal, +inflation, +P, +n))
    } catch (e: any) { setError(e.message) }
  }

  // Chart: FV nominal vs FV real año a año
  const chartData = result
    ? Array.from({ length: +n + 1 }, (_, k) => ({
        año: k,
        'FV Nominal': Math.round(+P * Math.pow(1 + result.nominalRate, k)),
        'FV Real (poder adquisitivo)': Math.round(+P * Math.pow(1 + result.realRate, k)),
      }))
    : []

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Módulo 06"
        title="Inflación & Tasas Reales"
        description="La inflación erosiona el poder adquisitivo del dinero. La tasa real mide el rendimiento verdadero después de descontar el efecto inflacionario."
      />

      <Callout color="gold">
        <strong>Ecuación de Fisher:</strong> una tasa nominal del 14% EA con inflación del 6.5%
        no implica que ganaste 14% en términos reales. La tasa real es aproximadamente 7%, pero la fórmula exacta
        de Fisher da un resultado más preciso: (1 + iᵣ) = (1 + iₙ) / (1 + π).
      </Callout>

      <div className="space-y-2 mb-6">
        <FormulaBox formula="(1 + iReal) = (1 + iNominal) / (1 + π)     — Fisher exacta" />
        <FormulaBox formula="iReal ≈ iNominal − π     — aproximación lineal" />
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Field label="Tasa nominal EA (%)" value={nominal} onChange={setNominal} unit="%" hint="Tasa del banco o inversión" />
          <Field label="Inflación anual (%)" value={inflation} onChange={setInflation} unit="%" hint="IPC o inflación proyectada" />
          <Field label="Capital inicial P ($)" value={P} onChange={setP} unit="$" />
          <Field label="Años n" value={n} onChange={setN} />
        </div>

        <button className="btn-primary" onClick={calculate}>→ Calcular tasa real</button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <ResultCard accent label="Tasa Real (Fisher)" value={fmtPct(result.realRatePct, 4)} />
            <ResultCard label="FV nominal" value={fmtCOP(result.nominalFV)}
              sub={[{ label: 'Tasa nominal', value: fmtPct(result.nominalRate * 100, 2) }]} />
            <ResultCard label="FV en poder adquisitivo real" value={fmtCOP(result.realFV)}
              sub={[{ label: 'Pérdida de poder de compra', value: `${result.purchasingPowerLoss}%` }]} />
          </div>

          <FormulaBox formula={`iReal = (1 + ${fmtPct(+nominal)}) / (1 + ${fmtPct(+inflation)}) − 1 = ${fmtPct(result.realRatePct, 4)}`} />

          {chartData.length > 1 && (
            <div className="card p-5 mt-6">
              <p className="text-xs mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                FV nominal vs poder adquisitivo real
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="año" tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Años', position: 'insideBottom', offset: -4, fill: 'var(--chart-tick)', fontSize: 10 }} />
                  <YAxis width={56} tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }}
                    formatter={(v: number) => [fmtCOP(v)]}
                    labelFormatter={l => `Año ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--chart-tick)' }} />
                  <Line type="monotone" dataKey="FV Nominal" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="FV Real (poder adquisitivo)" stroke="var(--chart-2)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                La brecha entre ambas curvas representa el <strong style={{ color: 'var(--gold)' }}>poder adquisitivo perdido</strong> por la inflación.
              </p>
            </div>
          )}
        </div>
      )}

      <Divider label="Teoría completa" />
      <div className="card p-6 space-y-4 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>¿Por qué importa la inflación?</h3>
        <p>
          Si una inversión rinde el 10% anual pero la inflación es del 8%, el rendimiento real es apenas del ~1.85%.
          Estás ganando dinero nominalmente, pero tu poder adquisitivo creció muy poco. En períodos de alta inflación
          (como Colombia en los 90s con más del 25%), muchas inversiones "rentables" en pesos generaban pérdida real.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Ecuación de Fisher</h3>
        <p>
          Desarrollada por Irving Fisher, la ecuación relaciona tasas nominales y reales:
          <strong style={{ color: 'var(--text)' }}> (1 + iₙ) = (1 + iᵣ) × (1 + π)</strong>.
          La aproximación lineal iᵣ ≈ iₙ − π funciona bien cuando las tasas son bajas, pero introduce error significativo
          en entornos inflacionarios. Siempre es mejor usar la fórmula exacta.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Tasas en Colombia</h3>
        <p>
          El Banco de la República fija la tasa de intervención (tasa repo), que influye en todas las demás tasas del sistema.
          Las tasas de crédito nominal siempre incluyen: tasa real esperada + inflación esperada + prima de riesgo del deudor.
          En análisis de proyectos, se puede trabajar con flujos en pesos corrientes (nominales) o en pesos constantes (reales),
          pero la tasa de descuento debe ser consistente con la decisión.
        </p>
      </div>
    </div>
  )
}

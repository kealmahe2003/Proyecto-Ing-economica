import { useState } from 'react'
import { PageHeader, Field, Select, ModeTabs, FormulaBox, Callout, Divider, ErrorBox } from '../../../components/ui'
import {
  convertEAtoNominal, convertNominalToEA, convertEAtoEffective,
  convertEffectiveToEA, convertAnticipatedToVencida, convertVencidaToAnticipated
} from '../../../lib/rateConversion'
import { fmtPct } from '../../../utils/format'
import type { RateConversionResult, CapFreq } from '../../../types/finance.types'

const CONVERSIONS = [
  { value: 'EA-NOM', label: 'EA → Nominal' },
  { value: 'NOM-EA', label: 'Nominal → EA' },
  { value: 'EA-EFF', label: 'EA → Efectiva/período' },
  { value: 'EFF-EA', label: 'Efectiva/período → EA' },
  { value: 'ANT-VEN', label: 'Anticipada → Vencida' },
  { value: 'VEN-ANT', label: 'Vencida → Anticipada' },
]

const FREQS = [
  { value: '12', label: '12 — Mensual' },
  { value: '4', label: '4 — Trimestral' },
  { value: '2', label: '2 — Semestral' },
  { value: '365', label: '365 — Diaria' },
  { value: '52', label: '52 — Semanal' },
  { value: '1', label: '1 — Anual' },
]

const LABELS: Record<string, string> = {
  'EA-NOM': 'Tasa EA (%)', 'NOM-EA': 'Tasa Nominal (%)',
  'EA-EFF': 'Tasa EA (%)', 'EFF-EA': 'Tasa efectiva por período (%)',
  'ANT-VEN': 'Tasa Anticipada MA (%)', 'VEN-ANT': 'Tasa Vencida MV (%)',
}

const needsFreq = (t: string) => !['ANT-VEN', 'VEN-ANT'].includes(t)

export default function RateConversionPage() {
  const [conv, setConv] = useState('EA-NOM')
  const [inputVal, setInputVal] = useState('24')
  const [freq, setFreq] = useState('12')
  const [result, setResult] = useState<RateConversionResult | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    try {
      const v = +inputVal
      const m = +freq as CapFreq
      let res: RateConversionResult
      if (conv === 'EA-NOM') res = convertEAtoNominal(v, m)
      else if (conv === 'NOM-EA') res = convertNominalToEA(v, m)
      else if (conv === 'EA-EFF') res = convertEAtoEffective(v, m)
      else if (conv === 'EFF-EA') res = convertEffectiveToEA(v, m)
      else if (conv === 'ANT-VEN') res = convertAnticipatedToVencida(v)
      else res = convertVencidaToAnticipated(v)
      setResult(res)
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Módulo 03"
        title="Conversión de Tasas"
        description="Convierte entre tasa efectiva anual (EA), nominal, tasa por período, y entre modalidades anticipada y vencida."
      />

      <Callout color="gold">
        <strong style={{ color: '#fff' }}>¿Por qué convertir tasas?</strong> — Las tasas se pueden expresar de múltiples formas,
        pero para calcular el costo real de un crédito o la rentabilidad de una inversión,
        siempre debemos trabajar con la <em>tasa efectiva del período de capitalización</em>.
        Una tasa nominal de 24% anual capitalizable mensualmente NO equivale a 24% anual efectivo.
      </Callout>

      {/* ANT vs VEN explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: 'rgba(28,34,56,0.8)', border: '1px solid var(--border)' }}>
          <p className="text-xs mono uppercase tracking-widest mb-2" style={{ color: '#F5C842' }}>Mes Vencido (MV)</p>
          <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            El interés se cobra al <strong style={{ color: 'var(--text)' }}>final</strong> del período.
            Es la modalidad más común en créditos de consumo y cartera hipotecaria en Colombia.
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(28,34,56,0.8)', border: '1px solid var(--border)' }}>
          <p className="text-xs mono uppercase tracking-widest mb-2" style={{ color: '#F5C842' }}>Mes Anticipado (MA)</p>
          <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            El interés se descuenta al <strong style={{ color: 'var(--text)' }}>inicio</strong> del período.
            Común en títulos de descuento, factoring y algunos CDT.
          </p>
        </div>
      </div>

      <Divider label="Calculadora" />

      <div className="card p-6 mb-6">
        <ModeTabs options={CONVERSIONS} value={conv} onChange={v => { setConv(v); setResult(null); setError('') }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Field label={LABELS[conv]} value={inputVal} onChange={setInputVal} placeholder="ej: 24" unit="%" />
          {needsFreq(conv) && (
            <Select label="Capitalización (veces/año)" value={freq} onChange={setFreq} options={FREQS} />
          )}
        </div>

        <button className="btn-primary" onClick={calculate}>→ Convertir</button>
        {error && <ErrorBox message={error} />}
      </div>

      {result && (
        <div className="animate-fade-up space-y-5">
          {/* Main conversion result */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(0,201,167,0.07)', border: '1px solid rgba(0,201,167,0.25)' }}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs mono uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>{result.inputLabel}</p>
                <p className="result-number text-2xl" style={{ color: 'var(--text)' }}>{fmtPct(result.inputPct, 4)}</p>
              </div>
              <div className="text-2xl" style={{ color: 'var(--teal)' }}>→</div>
              <div className="flex-1">
                <p className="text-xs mono uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>{result.outputLabel}</p>
                <p className="result-number text-2xl" style={{ color: 'var(--accent)' }}>{fmtPct(result.outputPct, 6)}</p>
              </div>
            </div>
          </div>

          <FormulaBox formula={result.formula} />

          {/* Equivalence matrix */}
          <div className="card p-5">
            <p className="text-xs mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
              Tabla de equivalencias — todas las tasas equivalentes
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {result.equivalences.map(eq => (
                <div key={eq.label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(12,15,26,0.8)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mono mb-1" style={{ color: 'var(--muted)' }}>{eq.label}</p>
                  <p className="text-sm mono font-semibold" style={{ color: 'var(--accent)' }}>{fmtPct(eq.pct, 6)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Divider label="Teoría completa" />
      <div className="card p-6 space-y-4 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Tasa Nominal vs Tasa Efectiva</h3>
        <p>
          La <strong style={{ color: 'var(--text)' }}>tasa nominal</strong> es una tasa anunciada que no considera la
          capitalización. Una tasa nominal del 24% NMV (nominal mensual vencida) equivale a una tasa mensual del 2%,
          pero el costo anual real es mayor al 24% porque cada mes los intereses se capitalizan.
        </p>
        <p>
          La <strong style={{ color: 'var(--text)' }}>tasa efectiva anual (EA)</strong> sí refleja el efecto de la
          capitalización. Permite comparar productos financieros con diferentes frecuencias de capitalización en igualdad
          de condiciones. En Colombia, la Superfinanciera exige reportar las tasas de crédito en términos EA.
        </p>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Fórmulas de conversión</h3>
        <div className="space-y-2">
          <FormulaBox formula="EA → Nominal: iₙ = m × [(1 + EA)^(1/m) − 1]" />
          <FormulaBox formula="Nominal → EA: EA = (1 + iₙ/m)^m − 1" />
          <FormulaBox formula="Vencida → Anticipada: iₐ = iᵥ / (1 + iᵥ)" />
          <FormulaBox formula="Anticipada → Vencida: iᵥ = iₐ / (1 − iₐ)" />
        </div>
        <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>Regla de oro</h3>
        <p>
          Antes de cualquier cálculo de interés compuesto, asegúrate de que la tasa y el número de períodos estén en
          <strong style={{ color: 'var(--text)' }}> la misma unidad de tiempo</strong>. Una tasa mensual con n mensual,
          o una tasa trimestral con n trimestral. Jamás mezclar unidades sin convertir primero.
        </p>
      </div>
    </div>
  )
}

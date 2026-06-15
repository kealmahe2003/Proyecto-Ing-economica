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
  InfoTip,
  StepByStep,
  ModuleNav,
  useCarryReceive,
  ModeSwitch,
  WizardShell,
  BigChoice,
  BigSlider,
  MoneyField,
  type UiMode,
  type BigChoiceOption,
} from '../../../components/ui'
import {
  calcFrenchAmortization,
  calcGermanAmortization,
  calcSimpleFixedAmort,
  calcSimpleConstantPrincipalAmort,
  buildAmortSteps,
} from '../../../lib/financial'
import { fmtCOP, fmtPct, fmtNumber, fmtPctShort } from '../../../utils/format'
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

function runCalc(
  interestType: string,
  system: string,
  mode: RateMode,
  P: number,
  iPct: number,
  n: number
): AmortResult {
  if (interestType === 'simple') {
    return system === 'fixed-payment'
      ? calcSimpleFixedAmort(P, iPct, n)
      : calcSimpleConstantPrincipalAmort(P, iPct, n)
  }
  return system === 'fixed-payment'
    ? calcFrenchAmortization(P, iPct, n, mode)
    : calcGermanAmortization(P, iPct, n)
}

const money0 = (v: number) => `$ ${fmtNumber(v, 0, 0)}`

const CHOICES: BigChoiceOption[] = [
  {
    value: 'fixed-payment',
    emoji: '🧾',
    label: 'Cuota fija',
    desc: 'Pago lo mismo todos los meses. La más común en bancos.',
  },
  {
    value: 'constant-principal',
    emoji: '⬇️',
    label: 'Cuota que baja',
    desc: 'Abono lo mismo al capital; la cuota empieza alta y baja.',
  },
]

type FieldKey = 'P' | 'i' | 'n'
const SLIDER: Record<
  FieldKey,
  {
    q: string
    hint: string
    min: number
    max: number
    step: number
    fmt: (v: number) => string
    init: number
  }
> = {
  P: {
    q: '¿De cuánto es el crédito?',
    hint: 'El monto que te prestan hoy.',
    min: 500000,
    max: 200000000,
    step: 500000,
    fmt: money0,
    init: 10000000,
  },
  i: {
    q: '¿Cuál es la tasa por mes?',
    hint: 'El interés mensual, en porcentaje.',
    min: 0.1,
    max: 10,
    step: 0.1,
    fmt: fmtPctShort,
    init: 1.5,
  },
  n: {
    q: '¿En cuántas cuotas?',
    hint: 'El número de meses para pagar.',
    min: 1,
    max: 120,
    step: 1,
    fmt: (v) => `${v} ${v === 1 ? 'cuota' : 'cuotas'}`,
    init: 24,
  },
}
const WIZ_ORDER: FieldKey[] = ['P', 'i', 'n']

export default function AmortizationPage() {
  const [uiMode, setUiMode] = useState<UiMode>('simple')
  const [interestType, setInterestType] = useState('compound')
  const [system, setSystem] = useState('fixed-payment')
  const [mode, setMode] = useState<RateMode>('vencido')
  const [P, setP] = useState('10000000')
  const [iPct, setIPct] = useState('1.5')
  const [n, setN] = useState('24')
  const [result, setResult] = useState<AmortResult | null>(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  // Asistente
  const [wizSystem, setWizSystem] = useState<string | null>(null)
  const [wizStep, setWizStep] = useState(0)
  const [wizVals, setWizVals] = useState({ P: SLIDER.P.init, i: SLIDER.i.init, n: SLIDER.n.init })

  const carried = useCarryReceive((p) => {
    setUiMode('experto')
    const np = p.amount != null ? String(Math.round(p.amount)) : P
    const ni = p.rate != null ? String(+p.rate.toFixed(6)) : iPct
    const nn = p.periods != null ? String(Math.round(p.periods)) : n
    setInterestType('compound')
    setSystem('fixed-payment')
    setMode('vencido')
    setP(np)
    setIPct(ni)
    setN(nn)
    setPage(0)
    try {
      setResult(calcFrenchAmortization(+np, +ni, +nn, 'vencido'))
    } catch {
      /* noop */
    }
  })

  function resetAll() {
    setResult(null)
    setError('')
    setWizSystem(null)
    setWizStep(0)
    setPage(0)
  }
  function switchUiMode(m: UiMode) {
    setUiMode(m)
    resetAll()
  }

  function calculate() {
    setError('')
    setPage(0)
    try {
      setResult(runCalc(interestType, system, mode, +P, +iPct, +n))
    } catch (e: any) {
      setError(e.message)
    }
  }

  function loadExample() {
    setUiMode('experto')
    setInterestType('compound')
    setSystem('fixed-payment')
    setMode('vencido')
    setP('10000000')
    setIPct('1.5')
    setN('24')
    setPage(0)
    setError('')
    try {
      setResult(calcFrenchAmortization(10000000, 1.5, 24, 'vencido'))
    } catch {
      /* noop */
    }
  }

  function pickSystem(value: string) {
    setWizSystem(value)
    setWizVals({ P: SLIDER.P.init, i: SLIDER.i.init, n: SLIDER.n.init })
    setWizStep(1)
    setError('')
  }
  function wizBack() {
    if (wizStep <= 1) {
      setWizSystem(null)
      setWizStep(0)
    } else {
      setWizStep((s) => s - 1)
    }
  }
  function wizNext() {
    if (!wizSystem) return
    if (wizStep < WIZ_ORDER.length) {
      setWizStep((s) => s + 1)
      return
    }
    try {
      const res = runCalc('compound', wizSystem, 'vencido', wizVals.P, wizVals.i, wizVals.n)
      setInterestType('compound')
      setSystem(wizSystem)
      setMode('vencido')
      setP(String(wizVals.P))
      setIPct(String(wizVals.i))
      setN(String(wizVals.n))
      setPage(0)
      setResult(res)
      setError('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  // La tabla arranca en el período 0: el desembolso inicial
  // (saldo de partida = monto del crédito, antes de pagar la primera cuota).
  const rows = result
    ? [
        {
          period: 0,
          initialBalance: 0,
          payment: 0,
          interest: 0,
          principal: 0,
          finalBalance: result.totalPrincipal,
        },
        ...result.rows,
      ]
    : []
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function downloadExcel() {
    import('xlsx').then((XLSX) => {
      const data = rows.map((row) => ({
        '#': row.period,
        'Saldo inicial': row.initialBalance,
        Cuota: row.payment,
        Interés: row.interest,
        'Abono capital': row.principal,
        'Saldo final': row.finalBalance,
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Amortización')
      XLSX.writeFile(wb, 'tabla_amortizacion.xlsx')
    })
  }

  function renderWizard() {
    if (wizStep === 0 || !wizSystem) {
      return (
        <WizardShell
          step={1}
          total={4}
          question="¿Cómo quieres pagar el crédito?"
          hint="Elige el tipo de cuota."
        >
          <BigChoice options={CHOICES} onPick={pickSystem} />
        </WizardShell>
      )
    }
    const key = WIZ_ORDER[wizStep - 1]
    const cfg = SLIDER[key]
    const isLast = wizStep === WIZ_ORDER.length
    return (
      <WizardShell
        step={wizStep + 1}
        total={WIZ_ORDER.length + 1}
        question={cfg.q}
        hint={cfg.hint}
        onBack={wizBack}
        onNext={wizNext}
        nextLabel={isLast ? 'Ver tabla' : 'Siguiente'}
        onRestart={resetAll}
      >
        <BigSlider
          value={wizVals[key]}
          onChange={(v) => setWizVals((w) => ({ ...w, [key]: v }))}
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          format={cfg.fmt}
        />
      </WizardShell>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <PageHeader
        chip="Módulo 05"
        title="Tabla de Amortización"
        description="Genera la tabla completa de un crédito: cuotas, intereses, abono a capital y saldo pendiente período a período."
      />

      <ModeSwitch value={uiMode} onChange={switchUiMode} />

      {carried && (
        <Callout color="blue">
          📥 Trajimos los datos del módulo anterior y generamos la tabla. Puedes ajustarlos.
        </Callout>
      )}

      {uiMode === 'simple' ? (
        <>
          <Callout color="blue">
            <strong>Modo simple:</strong> elige cómo pagar, ajusta el monto, la tasa y las cuotas, y
            verás la tabla con la explicación paso a paso. 🙂
          </Callout>
          {renderWizard()}
          {error && <ErrorBox message={error} />}
        </>
      ) : (
        <>
          <Callout color="blue">
            <strong>Cuota Fija:</strong> cuota constante; el interés baja cada período (el saldo
            disminuye) y el abono a capital sube. <strong>Capital Constante:</strong> el abono a
            capital es igual cada período, el interés baja y la cuota total disminuye con el tiempo.{' '}
            <em>
              En cuota fija compuesta, la columna &quot;Abono capital&quot; aumenta periodo a
              periodo — es correcto.
            </em>
          </Callout>

          <div className="space-y-2 mb-6">
            <FormulaBox
              title="Cuota fija (interés compuesto)"
              formula="Cuota = P × [i × (1+i)ⁿ] / [(1+i)ⁿ − 1]"
            />
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
              <MoneyField
                label={
                  <>
                    Monto del crédito P{' '}
                    <InfoTip>El dinero que te prestan hoy y que vas a pagar en cuotas.</InfoTip>
                  </>
                }
                value={P}
                onChange={setP}
                placeholder="ej: 10000000"
              />
              <Field
                label={
                  <>
                    Tasa de interés (i){' '}
                    <InfoTip>El interés por período (normalmente mensual).</InfoTip>
                  </>
                }
                value={iPct}
                onChange={setIPct}
                placeholder="ej: 1.5"
                unit="%"
              />
              <Field label="Número de cuotas n" value={n} onChange={setN} placeholder="ej: 24" />
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={calculate}>
                → Generar tabla
              </button>
              <button
                onClick={loadExample}
                className="text-sm px-4 py-2.5 rounded-lg cursor-pointer"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                ✨ Cargar ejemplo
              </button>
            </div>
            {error && <ErrorBox message={error} />}
          </div>
        </>
      )}

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

          <StepByStep steps={buildAmortSteps(result, +iPct)} />

          <div className="card overflow-hidden mt-6">
            <div
              className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}
            >
              <p
                className="text-xs mono uppercase tracking-widest"
                style={{ color: 'var(--muted)' }}
              >
                Tabla de amortización — {result.rows.length} cuotas ·{' '}
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
                        {row.period === 0 ? '—' : fmtCOP(row.initialBalance)}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        {row.period === 0 ? '—' : fmtCOP(row.payment)}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs"
                        style={{ color: 'var(--destructive)' }}
                      >
                        {row.period === 0 ? '—' : fmtCOP(row.interest)}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right mono text-xs"
                        style={{ color: 'var(--blue)' }}
                      >
                        {row.period === 0 ? '—' : fmtCOP(row.principal)}
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

      {result && (
        <ModuleNav
          current="/amortizacion"
          buildCarry={() => ({
            rate: +iPct,
            amount: result.totalPrincipal,
            periods: result.rows.length,
          })}
        />
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

import { useState, useEffect } from 'react'
import {
  PageHeader,
  Field,
  ModeTabs,
  ResultCard,
  FormulaBox,
  Callout,
  Divider,
  ErrorBox,
  InfoTip,
  StepByStep,
  ModuleNav,
  useCarryReceive,
  MoneyField,
} from '../../../components/ui'
import {
  calcAcademicLoan,
  buildAcademicLoanSteps,
  type AcademicLoanInputs,
  type AcademicLoanResult,
  type DisbursementFrequency,
  type AccrualMethod,
  type GracePeriodType,
  type AmortizationSystem,
} from '../../../lib/academicLoans'
import { fmtCOP, fmtPct, fmtNumber } from '../../../utils/format'
import { GraduationCap, ArrowRight, Table2, Info, FileSpreadsheet } from 'lucide-react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const FREQUENCIES = [
  { value: 'semester', label: 'Semestral' },
  { value: 'quarter', label: 'Trimestral' },
  { value: 'month', label: 'Mensual' },
]

const ACCRUAL_METHODS = [
  { value: 'professor-recursive', label: 'Acumulación por Períodos Restantes (Profesor)' },
  { value: 'simple-independent', label: 'Interés Simple Independiente' },
  { value: 'compound', label: 'Interés Compuesto Estándar' },
]

const GRACE_TYPES = [
  { value: 'paying-interest', label: 'Cuota de Interés (Paga interés mensual)' },
  { value: 'capitalizing', label: 'Gracia Muerta (Acumula/Capitaliza intereses)' },
]

const AMORT_SYSTEMS = [
  { value: 'french', label: 'Cuota fija' },
  { value: 'german', label: 'Abono fijo a capital' },
]

const PAGE_SIZE = 12

export default function AcademicLoansPage() {
  // Inputs state
  const [disbursementAmount, setDisbursementAmount] = useState('3000000')
  const [numDisbursements, setNumDisbursements] = useState('6')
  const [frequency, setFrequency] = useState<DisbursementFrequency>('semester')
  const [interestRatePct, setInterestRatePct] = useState('1.4')
  const [studyAccrualMethod, setStudyAccrualMethod] = useState<AccrualMethod>('professor-recursive')
  const [gracePeriodMonths, setGracePeriodMonths] = useState('12')
  const [gracePeriodType, setGracePeriodType] = useState<GracePeriodType>('paying-interest')
  const [amortizationMonths, setAmortizationMonths] = useState('36')
  const [amortizationSystem, setAmortizationSystem] = useState<AmortizationSystem>('french')

  const [result, setResult] = useState<AcademicLoanResult | null>(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  // Load carried store data if any
  const carried = useCarryReceive((p) => {
    if (p.amount != null) setDisbursementAmount(String(Math.round(p.amount)))
    if (p.rate != null) setInterestRatePct(String(+p.rate.toFixed(4)))
    if (p.periods != null) setNumDisbursements(String(Math.round(p.periods)))
    setPage(0)
  })

  // Auto-calculate on input changes or mount
  useEffect(() => {
    calculate()
  }, [
    disbursementAmount,
    numDisbursements,
    frequency,
    interestRatePct,
    studyAccrualMethod,
    gracePeriodMonths,
    gracePeriodType,
    amortizationMonths,
    amortizationSystem,
  ])

  function calculate() {
    setError('')
    const amt = parseFloat(disbursementAmount)
    const count = parseInt(numDisbursements)
    const rate = parseFloat(interestRatePct)
    const grace = parseInt(gracePeriodMonths)
    const amort = parseInt(amortizationMonths)

    if (isNaN(amt) || amt <= 0) {
      setError('El monto del desembolso debe ser mayor a 0.')
      return
    }
    if (isNaN(count) || count <= 0) {
      setError('La cantidad de desembolsos debe ser mayor a 0.')
      return
    }
    if (isNaN(rate) || rate < 0) {
      setError('La tasa de interés no puede ser negativa.')
      return
    }
    if (isNaN(grace) || grace < 0) {
      setError('Los meses de gracia no pueden ser negativos.')
      return
    }
    if (isNaN(amort) || amort <= 0) {
      setError('El plazo de amortización debe ser mayor a 0.')
      return
    }

    try {
      const res = calcAcademicLoan({
        disbursementAmount: amt,
        numDisbursements: count,
        frequency,
        interestRatePct: rate,
        studyAccrualMethod,
        gracePeriodMonths: grace,
        gracePeriodType,
        amortizationMonths: amort,
        amortizationSystem,
      })
      setResult(res)
    } catch (e: any) {
      setError(e.message || 'Error en el cálculo.')
    }
  }

  function loadProfessorExercise() {
    setDisbursementAmount('3000000')
    setNumDisbursements('6')
    setFrequency('semester')
    setInterestRatePct('1.4')
    setStudyAccrualMethod('professor-recursive')
    setGracePeriodMonths('12')
    setGracePeriodType('paying-interest')
    setAmortizationMonths('36')
    setAmortizationSystem('french')
    setPage(0)
    setError('')
  }

  function downloadExcel() {
    if (!result) return
    import('xlsx').then((XLSX) => {
      // Sheet 1: Disbursements during study
      const studyData = result.disbursementsTable.map((row) => ({
        'Semestre/Periodo': row.period,
        Desembolso: row.disbursement,
        'Meses al Final': row.monthsRemaining,
        'Factor Interés (i * t)': row.interestFactor,
        'Interés Acumulado': row.interestAccrued,
        'Saldo Acumulado al Final': row.accumulatedBalance,
      }))

      // Sheet 2: Amortization table
      const amortData = result.amortizationTable.map((row) => ({
        Mes: row.month,
        'Saldo Inicial': row.initialBalance,
        Cuota: row.payment,
        Interés: row.interest,
        'Abono Capital': row.principal,
        'Saldo Final': row.finalBalance,
      }))

      const wb = XLSX.utils.book_new()
      const wsStudy = XLSX.utils.json_to_sheet(studyData)
      const wsAmort = XLSX.utils.json_to_sheet(amortData)

      XLSX.utils.book_append_sheet(wb, wsStudy, 'Desembolsos Carrera')
      XLSX.utils.book_append_sheet(wb, wsAmort, 'Amortización')
      XLSX.writeFile(wb, 'credito_educativo_icetex.xlsx')
    })
  }

  // Build chart data
  const chartData: any[] = []
  if (result) {
    const freqMonths = frequency === 'semester' ? 6 : frequency === 'quarter' ? 3 : 1
    // Study phase disbursements
    result.disbursementsTable.forEach((d) => {
      chartData.push({
        time: `Sem ${d.period}`,
        'Flujo Caja': d.disbursement,
        Saldo: d.accumulatedBalance,
        type: 'Estudio',
      })
    })

    // Grace phase (let's add a point for end of grace)
    if (parseInt(gracePeriodMonths) > 0) {
      chartData.push({
        time: 'Gracia',
        'Flujo Caja': gracePeriodType === 'paying-interest' ? - (result.debtEndCareer * (parseFloat(interestRatePct) / 100)) : 0,
        Saldo: result.debtEndGrace,
        type: 'Gracia',
      })
    }

    // Amortization phase (subset of months to avoid cluttering)
    const step = Math.ceil(result.amortizationTable.length / 6)
    result.amortizationTable.forEach((a, index) => {
      if (index === 0 || index === result.amortizationTable.length - 1 || index % step === 0) {
        chartData.push({
          time: `Mes +${a.month}`,
          'Flujo Caja': -a.payment,
          Saldo: a.finalBalance,
          type: 'Pago',
        })
      }
    })
  }

  const totalPages = result ? Math.ceil(result.amortizationTable.length / PAGE_SIZE) : 0
  const pageRows = result ? result.amortizationTable.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : []

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <PageHeader
        chip="Módulo 06"
        title="Crédito Educativo & Desembolsos Periódicos"
        description="Calcula créditos como los del ICETEX, donde recibes desembolsos cada semestre, acumulas intereses en la carrera, tienes un periodo de gracia y luego amortizas la deuda."
      />



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2 border-b pb-2">
              <span>1. Fase de Estudio</span>
            </h3>

            <MoneyField
              label={
                <>
                  Monto del Desembolso{' '}
                  <InfoTip>El valor entregado al estudiante al iniciar cada periodo (ej: semestre).</InfoTip>
                </>
              }
              value={disbursementAmount}
              onChange={setDisbursementAmount}
              placeholder="3000000"
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Desembolsos (#)"
                value={numDisbursements}
                onChange={setNumDisbursements}
                placeholder="6"
              />
              <div>
                <label className="text-xs font-medium block mb-1 text-muted">Frecuencia</label>
                <select
                  className="select-field w-full"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as DisbursementFrequency)}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Field
              label="Tasa de Interés Mensual"
              value={interestRatePct}
              onChange={setInterestRatePct}
              placeholder="1.4"
              unit="%"
              hint="Tasa mensual vencida (MV) aplicada"
            />

            <div>
              <label className="text-xs font-medium block mb-1 text-muted">Método en Carrera</label>
              <select
                className="select-field w-full text-xs"
                value={studyAccrualMethod}
                onChange={(e) => setStudyAccrualMethod(e.target.value as AccrualMethod)}
              >
                {ACCRUAL_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2 border-b pb-2">
              <span>2. Gracia & Amortización</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Meses de Gracia"
                value={gracePeriodMonths}
                onChange={setGracePeriodMonths}
                placeholder="12"
              />
              <Field
                label="Plazo Pago (Meses)"
                value={amortizationMonths}
                onChange={setAmortizationMonths}
                placeholder="36"
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1 text-muted">Tipo de Gracia</label>
              <select
                className="select-field w-full text-xs"
                value={gracePeriodType}
                onChange={(e) => setGracePeriodType(e.target.value as GracePeriodType)}
                disabled={parseInt(gracePeriodMonths) === 0}
              >
                {GRACE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1 text-muted">Sistema de Amortización</label>
              <select
                className="select-field w-full text-xs"
                value={amortizationSystem}
                onChange={(e) => setAmortizationSystem(e.target.value as AmortizationSystem)}
              >
                {AMORT_SYSTEMS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <ErrorBox message={error} />}
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <div className="animate-fade-up space-y-6">
              {/* PRIMARY METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ResultCard
                  accent
                  label="Deuda Fin Carrera (Monto b)"
                  value={fmtCOP(result.debtEndCareer)}
                  sub={[
                    {
                      label: 'Diferencia redondeo',
                      value: studyAccrualMethod === 'professor-recursive' && numDisbursements === '6' && disbursementAmount === '3000000' && interestRatePct === '1.4'
                        ? 'Profesor: $40.748.000'
                        : 'Valor exacto',
                    },
                  ]}
                />
                <ResultCard
                  label="Deuda Fin Gracia (Monto c)"
                  value={fmtCOP(result.debtEndGrace)}
                  sub={[
                    {
                      label: 'Tipo Gracia',
                      value: gracePeriodMonths === '0' ? 'Sin gracia' : gracePeriodType === 'paying-interest' ? 'Paga Int. (No sube)' : 'Capitaliza (Sube)',
                    },
                  ]}
                />
                <ResultCard
                  label="Pago en Gracia (Total)"
                  value={fmtCOP(result.totalPaidGrace)}
                  sub={[
                    {
                      label: 'Cuota mensual',
                      value: gracePeriodType === 'paying-interest' ? fmtCOP(result.debtEndCareer * (parseFloat(interestRatePct) / 100)) : '$0',
                    },
                  ]}
                />
              </div>

              {/* EFFECTIVE RATES CARD */}
              <div className="card p-5">
                <h4 className="text-xs mono uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                  <GraduationCap size={14} className="text-accent" />
                  a. Equivalencia de Tasas de Crédito
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-surface rounded-lg border">
                    <p className="text-xs text-muted">Efectiva Mensual (EM)</p>
                    <p className="text-lg font-bold text-accent">{fmtPct(result.effectiveRates.monthly, 2)}</p>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border">
                    <p className="text-xs text-muted">Efectiva Semestral (ES)</p>
                    <p className="text-lg font-bold text-accent">{fmtPct(result.effectiveRates.semester, 2)}</p>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border">
                    <p className="text-xs text-muted">Efectiva Anual (EA)</p>
                    <p className="text-lg font-bold text-accent">{fmtPct(result.effectiveRates.annual, 2)}</p>
                  </div>
                </div>
              </div>

              {/* FIRST MONTH COMPARISON - SIDE BY SIDE (Solves d) */}
              <div className="card p-5">
                <h4 className="text-xs mono uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                  <Info size={14} className="text-accent" />
                  d. Comparación del Primer Mes de Amortización (Sistemas)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Case 1: German (Cuota Capital Fija) */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${amortizationSystem === 'german' ? 'border-accent bg-accent-bg' : 'border-border bg-surface2'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-sm">1. Abono fijo a capital</p>
                      {amortizationSystem === 'german' && <span className="text-[10px] bg-accent text-on-accent px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Activo</span>}
                    </div>
                    <div className="space-y-1.5 text-xs text-muted">
                      <div className="flex justify-between">
                        <span>Pago Primer Mes (Cuota):</span>
                        <strong className="text-foreground">{fmtCOP(result.firstMonthAmortization.german.payment)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Abono a Capital (Fijo):</span>
                        <strong className="text-blue">{fmtCOP(result.firstMonthAmortization.german.principal)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Intereses Primer Mes:</span>
                        <strong className="text-destructive">{fmtCOP(result.firstMonthAmortization.german.interest)}</strong>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span>Saldo al final del mes:</span>
                        <strong className="text-foreground">{fmtCOP(result.firstMonthAmortization.german.finalBalance)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Case 2: French (Cuota Fija) */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${amortizationSystem === 'french' ? 'border-accent bg-accent-bg' : 'border-border bg-surface2'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-sm">2. Cuota fija</p>
                      {amortizationSystem === 'french' && <span className="text-[10px] bg-accent text-on-accent px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Activo</span>}
                    </div>
                    <div className="space-y-1.5 text-xs text-muted">
                      <div className="flex justify-between">
                        <span>Pago Primer Mes (Cuota):</span>
                        <strong className="text-foreground">{fmtCOP(result.firstMonthAmortization.french.payment)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Abono a Capital:</span>
                        <strong className="text-blue">{fmtCOP(result.firstMonthAmortization.french.principal)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Intereses Primer Mes:</span>
                        <strong className="text-destructive">{fmtCOP(result.firstMonthAmortization.french.interest)}</strong>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span>Saldo al final del mes:</span>
                        <strong className="text-foreground">{fmtCOP(result.firstMonthAmortization.french.finalBalance)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CASH FLOW GRAPH */}
              <div className="card p-5">
                <h4 className="text-xs mono uppercase tracking-wider text-muted mb-4">
                  Visualización del Flujo de Fondos (Carrera y Pagos)
                </h4>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={chartData} margin={{ left: 16, right: 16, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="time" tick={{ fill: 'var(--chart-tick)', fontSize: 10 }} />
                    <YAxis
                      width={60}
                      tick={{ fill: 'var(--chart-tick)', fontSize: 10 }}
                      tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--chart-tooltip-bg)',
                        border: '1px solid var(--chart-tooltip-border)',
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      formatter={(v: number, name: any) => [fmtCOP(v), name]}
                    />
                    <ReferenceLine y={0} stroke="var(--border)" />
                    <Bar dataKey="Flujo Caja" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="Saldo" stroke="var(--chart-2)" strokeWidth={2} dot={true} />
                  </ComposedChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted mt-2 italic text-center">
                  Las barras hacia arriba muestran desembolsos recibidos en carrera (ingresos). Las barras hacia abajo muestran cuotas pagadas en gracia/amortización (egresos). La línea muestra el saldo acumulado.
                </p>
              </div>

              {/* STEP BY STEP STEPS */}
              <StepByStep steps={buildAcademicLoanSteps({
                disbursementAmount: parseFloat(disbursementAmount),
                numDisbursements: parseInt(numDisbursements),
                frequency,
                interestRatePct: parseFloat(interestRatePct),
                studyAccrualMethod,
                gracePeriodMonths: parseInt(gracePeriodMonths),
                gracePeriodType,
                amortizationMonths: parseInt(amortizationMonths),
                amortizationSystem,
              }, result)} />

              {/* STUDY ACCRUAL TABLE */}
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b flex justify-between items-center bg-surface2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Tabla de Acumulación durante la Carrera ({result.disbursementsTable.length} Periodos)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b bg-surface" style={{ borderColor: 'var(--border)' }}>
                        <th className="p-3">Periodo</th>
                        <th className="p-3 text-right">Desembolso</th>
                        <th className="p-3 text-right">Meses Restantes</th>
                        <th className="p-3 text-right">Factor de Interés</th>
                        <th className="p-3 text-right">Interés Acumulado</th>
                        <th className="p-3 text-right font-semibold text-accent">Saldo Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.disbursementsTable.map((row) => (
                        <tr key={row.period} className="border-b" style={{ borderColor: 'var(--border)' }}>
                          <td className="p-3 font-semibold">{frequency === 'semester' ? `Semestre ${row.period}` : `Periodo ${row.period}`}</td>
                          <td className="p-3 text-right">{fmtCOP(row.disbursement)}</td>
                          <td className="p-3 text-right">{row.monthsRemaining} meses</td>
                          <td className="p-3 text-right">{(row.interestFactor * 100).toFixed(2)}%</td>
                          <td className="p-3 text-right text-destructive">{fmtCOP(row.interestAccrued)}</td>
                          <td className="p-3 text-right font-semibold text-accent">{fmtCOP(row.accumulatedBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AMORTIZATION TABLE */}
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b flex items-center justify-between bg-surface2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                    <Table2 size={14} className="text-accent" />
                    Tabla de Amortización Post-Gracia ({result.amortizationTable.length} meses)
                  </span>
                  <button
                    onClick={downloadExcel}
                    className="text-[11px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-accent-bg border border-accent-border text-accent hover:opacity-85"
                  >
                    <FileSpreadsheet size={13} />
                    Descargar Excel
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'var(--surface2)' }}>
                        {['Mes', 'Saldo inicial', 'Cuota de Pago', 'Interés', 'Abono capital', 'Saldo final'].map(
                          (h) => (
                            <th
                              key={h}
                              className="py-3 px-4 text-right first:text-left text-xs font-semibold uppercase tracking-wider border-b"
                              style={{
                                color: 'var(--muted)',
                                borderColor: 'var(--border)',
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
                          key={row.month}
                          style={{
                            background: idx % 2 === 0 ? 'transparent' : 'var(--surface2)',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <td className="py-2.5 px-4 text-left font-medium">Mes {row.month}</td>
                          <td className="py-2.5 px-4 text-right">{fmtCOP(row.initialBalance)}</td>
                          <td className="py-2.5 px-4 text-right font-semibold text-accent">{fmtCOP(row.payment)}</td>
                          <td className="py-2.5 px-4 text-right text-destructive">{fmtCOP(row.interest)}</td>
                          <td className="py-2.5 px-4 text-right text-blue">{fmtCOP(row.principal)}</td>
                          <td className="py-2.5 px-4 text-right font-medium">{fmtCOP(row.finalBalance)}</td>
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
                      className="text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs text-muted">
                      Pág {page + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <ModuleNav
          current="/credito-educativo"
          buildCarry={() => ({
            rate: parseFloat(interestRatePct),
            amount: result.debtEndGrace,
            periods: result.amortizationTable.length,
          })}
        />
      )}

      <Divider label="Teoría completa de créditos educativos" />
      <div
        className="card p-6 space-y-4 text-sm"
        style={{ color: 'var(--muted)', lineHeight: 1.75 }}
      >
        <h3 className="display text-lg font-semibold text-foreground">
          Estructura de un Crédito ICETEX
        </h3>
        <p>
          Los créditos educativos se dividen tradicionalmente en tres etapas muy marcadas:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong className="text-foreground">Etapa de estudios (Desembolsos periódicos):</strong> Cada periodo (semestre) se desembolsa el valor de la matrícula. Durante esta etapa se generan intereses sobre los saldos. El profesor aplica un método de capitalización por períodos restantes para llevar el valor futuro de cada desembolso al final de la carrera.
          </li>
          <li>
            <strong className="text-foreground">Periodo de gracia:</strong> Una vez finalizada la carrera, suele haber un periodo (ej: 1 año) antes de iniciar los pagos de amortización completa. En la modalidad con <em>pago de intereses</em>, el deudor abona los intereses mensuales y mantiene la deuda principal fija. En la modalidad <em>capitalizable</em>, no se realizan pagos y los intereses se suman a la deuda principal.
          </li>
          <li>
            <strong className="text-foreground">Etapa de amortización:</strong> Se inicia el pago mensual de la deuda. Generalmente se liquida por el sistema de Cuota fija o Abono fijo a capital.
          </li>
        </ul>
      </div>
    </div>
  )
}

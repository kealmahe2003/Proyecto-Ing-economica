import type { CalcStep } from '../types/finance.types'
import { fmtCOP, fmtNumber, fmtPct } from '../utils/format'

export type DisbursementFrequency = 'semester' | 'quarter' | 'month'

export type AccrualMethod = 'professor-recursive' | 'simple-independent' | 'compound'

export type GracePeriodType = 'paying-interest' | 'capitalizing'

export type AmortizationSystem = 'french' | 'german'

export interface AcademicLoanInputs {
  disbursementAmount: number
  numDisbursements: number
  frequency: DisbursementFrequency
  interestRatePct: number // monthly rate
  studyAccrualMethod: AccrualMethod
  gracePeriodMonths: number
  gracePeriodType: GracePeriodType
  amortizationMonths: number
  amortizationSystem: AmortizationSystem
}

export interface DisbursementRow {
  period: number
  disbursement: number
  monthsRemaining: number
  interestFactor: number
  interestAccrued: number
  accumulatedBalance: number
}

export interface AmortizationRow {
  month: number
  initialBalance: number
  payment: number
  interest: number
  principal: number
  finalBalance: number
}

export interface AcademicLoanResult {
  effectiveRates: {
    monthly: number
    semester: number
    annual: number
  }
  disbursementsTable: DisbursementRow[]
  debtEndCareer: number
  debtEndGrace: number
  firstMonthAmortization: {
    french: {
      payment: number
      interest: number
      principal: number
      finalBalance: number
    }
    german: {
      payment: number
      interest: number
      principal: number
      finalBalance: number
    }
  }
  amortizationTable: AmortizationRow[]
  totalPaidStudy: number
  totalPaidGrace: number
  totalPaidAmort: number
  totalPaid: number
  totalInterestAccrued: number
}

export function calcAcademicLoan(inputs: AcademicLoanInputs): AcademicLoanResult {
  const {
    disbursementAmount,
    numDisbursements,
    frequency,
    interestRatePct,
    studyAccrualMethod,
    gracePeriodMonths,
    gracePeriodType,
    amortizationMonths,
    amortizationSystem,
  } = inputs

  const i = interestRatePct / 100

  // a. Tasa efectiva
  const rateMonthly = interestRatePct
  const rateSemester = (Math.pow(1 + i, 6) - 1) * 100
  const rateAnnual = (Math.pow(1 + i, 12) - 1) * 100

  // Frequency multiplier
  const freqMonths = frequency === 'semester' ? 6 : frequency === 'quarter' ? 3 : 1
  const totalMonthsStudy = numDisbursements * freqMonths

  // b. Deuda al final de la carrera
  const disbursementsTable: DisbursementRow[] = []
  let debtEndCareer = 0

  if (studyAccrualMethod === 'professor-recursive') {
    // Professor's recursive formula
    // VF_k = (VF_{k-1} + D) * (1 + i * monthsRemaining)
    let balance = 0
    for (let k = 1; k <= numDisbursements; k++) {
      const monthsRemaining = (numDisbursements - k + 1) * freqMonths
      const factor = i * monthsRemaining
      const initial = balance + disbursementAmount
      const interest = initial * factor
      const finalBal = initial + interest

      disbursementsTable.push({
        period: k,
        disbursement: disbursementAmount,
        monthsRemaining,
        interestFactor: factor,
        interestAccrued: interest,
        accumulatedBalance: finalBal,
      })

      balance = finalBal
    }
    debtEndCareer = balance
  } else if (studyAccrualMethod === 'simple-independent') {
    // Independent simple interest
    // VF = Sum (D * (1 + i * monthsRemaining))
    let totalBal = 0
    for (let k = 1; k <= numDisbursements; k++) {
      const monthsRemaining = (numDisbursements - k + 1) * freqMonths
      const factor = i * monthsRemaining
      const interest = disbursementAmount * factor
      const finalBal = disbursementAmount + interest
      totalBal += finalBal

      disbursementsTable.push({
        period: k,
        disbursement: disbursementAmount,
        monthsRemaining,
        interestFactor: factor,
        interestAccrued: interest,
        accumulatedBalance: totalBal,
      })
    }
    debtEndCareer = totalBal
  } else {
    // Compound interest standard
    // VF_k = (VF_{k-1} + D) * (1 + i)^freqMonths
    let balance = 0
    for (let k = 1; k <= numDisbursements; k++) {
      const monthsRemaining = (numDisbursements - k + 1) * freqMonths
      const factor = Math.pow(1 + i, freqMonths) - 1
      const initial = balance + disbursementAmount
      const interest = initial * factor
      const finalBal = initial + interest

      disbursementsTable.push({
        period: k,
        disbursement: disbursementAmount,
        monthsRemaining,
        interestFactor: factor,
        interestAccrued: interest,
        accumulatedBalance: finalBal,
      })
      balance = finalBal
    }
    debtEndCareer = balance
  }

  // c. Deuda al final del periodo de gracia
  let debtEndGrace = debtEndCareer
  let totalPaidGrace = 0
  let totalInterestAccruedGrace = 0

  if (gracePeriodMonths > 0) {
    if (gracePeriodType === 'paying-interest') {
      // pays interest every month: debt stays same
      debtEndGrace = debtEndCareer
      totalPaidGrace = debtEndCareer * i * gracePeriodMonths
      totalInterestAccruedGrace = totalPaidGrace
    } else {
      // capitalizes interest
      // Let's use simple or compound during grace? Typically student loans capitalize compound interest
      const factor = Math.pow(1 + i, gracePeriodMonths)
      debtEndGrace = debtEndCareer * factor
      totalInterestAccruedGrace = debtEndGrace - debtEndCareer
      totalPaidGrace = 0
    }
  }

  // d. Amortization and payments
  // Calculate first month for both systems
  // French (cuota fija)
  const pmtFrench = (debtEndGrace * (i * Math.pow(1 + i, amortizationMonths))) / (Math.pow(1 + i, amortizationMonths) - 1)
  const intFrench1 = debtEndGrace * i
  const prinFrench1 = pmtFrench - intFrench1
  const balFrench1 = debtEndGrace - prinFrench1

  // German (cuota fija capital)
  const prinGerman = debtEndGrace / amortizationMonths
  const intGerman1 = debtEndGrace * i
  const pmtGerman1 = prinGerman + intGerman1
  const balGerman1 = debtEndGrace - prinGerman

  // Build the actual chosen amortization table
  const amortizationTable: AmortizationRow[] = []
  let balanceAmort = debtEndGrace
  let totalPaidAmort = 0

  for (let m = 1; m <= amortizationMonths; m++) {
    const interest = balanceAmort * i
    let principal = 0
    let payment = 0

    if (amortizationSystem === 'french') {
      payment = pmtFrench
      principal = payment - interest
      if (m === amortizationMonths) {
        principal = balanceAmort
        payment = principal + interest
      }
    } else {
      principal = prinGerman
      payment = principal + interest
      if (m === amortizationMonths) {
        principal = balanceAmort
        payment = principal + interest
      }
    }

    const finalBalance = Math.max(0, balanceAmort - principal)
    amortizationTable.push({
      month: m,
      initialBalance: balanceAmort,
      payment,
      interest,
      principal,
      finalBalance,
    })
    balanceAmort = finalBalance
    totalPaidAmort += payment
  }

  return {
    effectiveRates: {
      monthly: rateMonthly,
      semester: rateSemester,
      annual: rateAnnual,
    },
    disbursementsTable,
    debtEndCareer,
    debtEndGrace,
    firstMonthAmortization: {
      french: {
        payment: pmtFrench,
        interest: intFrench1,
        principal: prinFrench1,
        finalBalance: balFrench1,
      },
      german: {
        payment: pmtGerman1,
        interest: intGerman1,
        principal: prinGerman,
        finalBalance: balGerman1,
      },
    },
    amortizationTable,
    totalPaidStudy: 0, // study phase has no repayments usually
    totalPaidGrace,
    totalPaidAmort,
    totalPaid: totalPaidGrace + totalPaidAmort,
    totalInterestAccrued: (debtEndCareer - (disbursementAmount * numDisbursements)) + totalInterestAccruedGrace + (totalPaidAmort - debtEndGrace),
  }
}

export function buildAcademicLoanSteps(inputs: AcademicLoanInputs, r: AcademicLoanResult): CalcStep[] {
  const i = inputs.interestRatePct / 100
  const steps: CalcStep[] = []

  // Paso 1: Tasa
  steps.push({
    title: 'Paso 1 — Equivalencia de Tasas',
    expr: `i = ${fmtPct(inputs.interestRatePct, 2)} mensual`,
    detail: `Tasa Efectiva Anual (EA): (1 + ${i.toFixed(4)})¹² − 1 = ${fmtPct(r.effectiveRates.annual, 2)}.
             Tasa Efectiva Semestral: (1 + ${i.toFixed(4)})⁶ − 1 = ${fmtPct(r.effectiveRates.semester, 2)}.`,
  })

  // Paso 2: Carrera
  if (inputs.studyAccrualMethod === 'professor-recursive') {
    steps.push({
      title: 'Paso 2 — Deuda al final de la carrera (Método del Profesor)',
      expr: `VF_k = (VF_{k-1} + D) × (1 + i × t_k)`,
      detail: `Se calcula acumulando recursivamente los desembolsos e intereses simples por los meses restantes:
               Semestre 1 (t=36 meses): (0 + 3M) × (1 + 1.4% × 36) = ${fmtCOP(r.disbursementsTable[0].accumulatedBalance)}.
               Semestre 2 (t=30 meses): (${fmtCOP(r.disbursementsTable[0].accumulatedBalance)} + 3M) × (1 + 1.4% × 30) = ${fmtCOP(r.disbursementsTable[1].accumulatedBalance)}.
               ... hasta Semestre 6 (t=6 meses): Deuda Final = ${fmtCOP(r.debtEndCareer)}.`,
    })
  } else if (inputs.studyAccrualMethod === 'simple-independent') {
    steps.push({
      title: 'Paso 2 — Deuda al final de la carrera (Interés Simple Independiente)',
      expr: `VF = ∑ [ D × (1 + i × t_k) ]`,
      detail: `Cada desembolso genera interés simple por separado según los meses restantes hasta el fin de la carrera:
               Disb. 1: 3M × (1 + 1.4% × 36) = ${fmtCOP(3000000 * (1 + 0.014 * 36))}.
               Disb. 2: 3M × (1 + 1.4% × 30) = ${fmtCOP(3000000 * (1 + 0.014 * 30))}.
               Suma de todos los desembolsos + intereses: ${fmtCOP(r.debtEndCareer)}.`,
    })
  } else {
    steps.push({
      title: 'Paso 2 — Deuda al final de la carrera (Interés Compuesto)',
      expr: `VF_k = (VF_{k-1} + D) × (1 + i)^t`,
      detail: `Los intereses se capitalizan periódicamente: Deuda final = ${fmtCOP(r.debtEndCareer)}.`,
    })
  }

  // Paso 3: Periodo de gracia
  if (inputs.gracePeriodMonths > 0) {
    if (inputs.gracePeriodType === 'paying-interest') {
      steps.push({
        title: `Paso 3 — Periodo de Gracia (Pagando Intereses)`,
        expr: `Deuda final = Deuda carrera = ${fmtCOP(r.debtEndGrace)}`,
        detail: `Durante los ${inputs.gracePeriodMonths} meses de gracia se pagan intereses mensuales de ${fmtCOP(r.debtEndCareer * i)} sin abonar a capital. La deuda no aumenta. Pago total en gracia: ${fmtCOP(r.totalPaidGrace)}.`,
      })
    } else {
      steps.push({
        title: `Paso 3 — Periodo de Gracia (Muerto / Capitalizable)`,
        expr: `Deuda final = ${fmtCOP(r.debtEndCareer)} × (1 + 1.4%)^${inputs.gracePeriodMonths} = ${fmtCOP(r.debtEndGrace)}`,
        detail: `No se hacen pagos. Los intereses de los ${inputs.gracePeriodMonths} meses se acumulan y capitalizan, aumentando el saldo de la deuda.`,
      })
    }
  } else {
    steps.push({
      title: 'Paso 3 — Sin Periodo de Gracia',
      detail: 'La amortización inicia inmediatamente al finalizar la carrera.',
    })
  }

  // Paso 4: Primer mes
  const sysLabel = inputs.amortizationSystem === 'french' ? 'Cuota fija' : 'Abono fijo a capital'
  const firstMonth = inputs.amortizationSystem === 'french' ? r.firstMonthAmortization.french : r.firstMonthAmortization.german
  steps.push({
    title: `Paso 4 — Primera cuota de amortización (${sysLabel})`,
    expr: `Cuota = ${fmtCOP(firstMonth.payment)}  |  Interés = ${fmtCOP(firstMonth.interest)}  |  Capital = ${fmtCOP(firstMonth.principal)}`,
    detail: `Saldo después del primer mes: ${fmtCOP(firstMonth.finalBalance)}.`,
  })

  return steps
}

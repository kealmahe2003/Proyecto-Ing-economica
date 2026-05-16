import type { AmortResult, AmortRow, AnnuityResult, InflationResult, RateMode } from '../types/finance.types'

// ============================================================
// AMORTIZATION
// ============================================================

export function calcFrenchAmortization(P: number, iPct: number, n: number, mode: RateMode): AmortResult {
  const i = iPct / 100
  let payment: number

  if (mode === 'vencido') {
    payment = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
  } else {
    // Anticipada: cuota al inicio del período
    payment = P * (i * Math.pow(1 + i, n)) / ((Math.pow(1 + i, n) - 1) * (1 + i))
  }

  const rows: AmortRow[] = []
  let balance = P

  for (let k = 1; k <= n; k++) {
    const interest = mode === 'vencido' ? balance * i : balance * i / (1 + i)
    const principal = payment - interest
    const finalBalance = Math.max(0, balance - principal)
    rows.push({
      period: k,
      initialBalance: balance,
      payment,
      interest,
      principal,
      finalBalance,
    })
    balance = finalBalance
  }

  const totalPaid = payment * n
  const totalInterest = totalPaid - P
  return { payment, totalPaid, totalInterest, totalPrincipal: P, rows, system: 'fixed-payment', interestType: 'compound', mode }
}

export function calcGermanAmortization(P: number, iPct: number, n: number): AmortResult {
  const i = iPct / 100
  const principalPerPeriod = P / n
  const rows: AmortRow[] = []
  let balance = P
  let totalPaid = 0

  for (let k = 1; k <= n; k++) {
    const interest = balance * i
    const payment = principalPerPeriod + interest
    const finalBalance = Math.max(0, balance - principalPerPeriod)
    rows.push({ period: k, initialBalance: balance, payment, interest, principal: principalPerPeriod, finalBalance })
    balance = finalBalance
    totalPaid += payment
  }

  return {
    payment: rows[0].payment,
    totalPaid,
    totalInterest: totalPaid - P,
    totalPrincipal: P,
    rows,
    system: 'constant-principal',
    interestType: 'compound',
    mode: 'vencido',
  }
}

export function calcSimpleFixedAmort(P: number, iPct: number, n: number): AmortResult {
  // Cuota Fija con interés simple:
  // El monto total a pagar = P*(1 + i*n); dividido en n cuotas iguales.
  // El interés de cada período se calcula sobre el saldo pendiente (decreciente).
  // La última cuota puede ser menor (cierra exactamente el saldo restante).
  const i = iPct / 100
  const standardPayment = P / n + P * i  // total simple / n
  const rows: AmortRow[] = []
  let balance = P
  let totalPaid = 0

  for (let k = 1; k <= n; k++) {
    const interest = balance * i
    const targetPrincipal = standardPayment - interest
    // Si el abono supera el saldo restante, se cierra en este período
    const principal = targetPrincipal >= balance ? balance : targetPrincipal
    const actualPayment = interest + principal
    const finalBalance = Math.max(0, balance - principal)

    rows.push({
      period: k,
      initialBalance: balance,
      payment: actualPayment,
      interest,
      principal,
      finalBalance,
    })
    balance = finalBalance
    totalPaid += actualPayment
    if (balance <= 0) break
  }

  return {
    payment: rows[0].payment,
    totalPaid,
    totalInterest: totalPaid - P,
    totalPrincipal: P,
    rows,
    system: 'fixed-payment',
    interestType: 'simple',
    mode: 'vencido',
  }
}

export function calcSimpleConstantPrincipalAmort(P: number, iPct: number, n: number): AmortResult {
  // Capital Constante + Intereses con interés simple:
  // Capital por período = P/n (constante)
  // Interés calculado sobre el saldo RESTANTE (decreciente)
  // Cuota decrece cada período
  const i = iPct / 100
  const principalPerPeriod = P / n
  const rows: AmortRow[] = []
  let balance = P
  let totalPaid = 0

  for (let k = 1; k <= n; k++) {
    const interest = balance * i  // sobre saldo restante
    const payment = principalPerPeriod + interest
    const finalBalance = Math.max(0, balance - principalPerPeriod)
    rows.push({
      period: k,
      initialBalance: balance,
      payment,
      interest,
      principal: principalPerPeriod,
      finalBalance,
    })
    balance = finalBalance
    totalPaid += payment
  }

  return {
    payment: rows[0].payment,
    totalPaid,
    totalInterest: totalPaid - P,
    totalPrincipal: P,
    rows,
    system: 'constant-principal',
    interestType: 'simple',
    mode: 'vencido',
  }
}

// ============================================================
// ANNUITIES / SERIES UNIFORMES
// PV = PMT * [1 - (1+i)^-n] / i
// FV = PMT * [(1+i)^n - 1] / i
// ============================================================

export function calcAnnuityPV(PMT: number, iPct: number, n: number): AnnuityResult {
  const i = iPct / 100
  const PV = PMT * (1 - Math.pow(1 + i, -n)) / i
  const FV = PMT * (Math.pow(1 + i, n) - 1) / i
  const totalPaid = PMT * n
  // Balance tras k pagos = VP de los (n-k) pagos restantes
  const series = Array.from({ length: Math.min(n, 60) }, (_, k) => ({
    period: k + 1,
    payment: PMT,
    balance: k < n ? PMT * (1 - Math.pow(1 + i, -(n - k - 1))) / i : 0,
  }))
  return { PV, FV, PMT, n, i, totalPaid, totalInterest: totalPaid - PV, series }
}

export function calcAnnuityFV(PMT: number, iPct: number, n: number): AnnuityResult {
  const i = iPct / 100
  const FV = PMT * (Math.pow(1 + i, n) - 1) / i
  const PV = PMT * (1 - Math.pow(1 + i, -n)) / i
  const totalPaid = PMT * n
  // Saldo acumulado período a período: FV parcial del ahorro
  const series = Array.from({ length: Math.min(n, 60) }, (_, k) => ({
    period: k + 1,
    payment: PMT,
    balance: PMT * (Math.pow(1 + i, k + 1) - 1) / i,
  }))
  return { PV, FV, PMT, n, i, totalPaid, totalInterest: FV - totalPaid, series }
}

export function calcAnnuityPMT(PV: number, iPct: number, n: number): AnnuityResult {
  const i = iPct / 100
  const PMT = PV * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
  const FV = PMT * (Math.pow(1 + i, n) - 1) / i
  // Saldo del crédito pendiente período a período
  const series = Array.from({ length: Math.min(n, 60) }, (_, k) => ({
    period: k + 1,
    payment: PMT,
    balance: PV * Math.pow(1 + i, k + 1) - PMT * (Math.pow(1 + i, k + 1) - 1) / i,
  }))
  return { PV, FV, PMT, n, i, totalPaid: PMT * n, totalInterest: PMT * n - PV, series }
}

// ============================================================
// INFLATION — Fisher equation
// (1 + iReal) = (1 + iNominal) / (1 + inflacion)
// ============================================================

export function calcRealRate(nominalPct: number, inflationPct: number, P: number, n: number): InflationResult {
  const nom = nominalPct / 100
  const inf = inflationPct / 100
  const real = (1 + nom) / (1 + inf) - 1
  const nomFV = P * Math.pow(1 + nom, n)
  const realFV = P * Math.pow(1 + real, n)
  return {
    nominalRate: nom,
    inflationRate: inf,
    realRate: real,
    realRatePct: +(real * 100).toFixed(6),
    nominalFV: nomFV,
    realFV: realFV,
    purchasingPowerLoss: +(((nomFV - realFV) / nomFV) * 100).toFixed(2),
  }
}

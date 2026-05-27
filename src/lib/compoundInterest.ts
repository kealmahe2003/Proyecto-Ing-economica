import type { CompoundResult } from '../types/finance.types'

// ============================================================
// COMPOUND INTEREST — F = P(1+i)^n
// ============================================================

function buildSeries(P: number, i: number, n: number) {
  const simple = P * i
  return Array.from({ length: Math.min(Math.ceil(n), 60) }, (_, k) => ({
    period: k + 1,
    balance: P * Math.pow(1 + i, k + 1),
    interestSimple: P + simple * (k + 1),
  }))
}

export function calcCompF(P: number, iPct: number, n: number): CompoundResult {
  const i = iPct / 100
  const factor = Math.pow(1 + i, n)
  const F = P * factor
  return { P, F, I: F - P, i, n, factor, iSimple: P * i * n, series: buildSeries(P, i, n) }
}

export function calcCompP(F: number, iPct: number, n: number): CompoundResult {
  const i = iPct / 100
  const factor = Math.pow(1 + i, n)
  const P = F / factor
  return { P, F, I: F - P, i, n, factor, iSimple: P * i * n, series: buildSeries(P, i, n) }
}

export function calcCompI(P: number, F: number, n: number): CompoundResult {
  if (F <= 0 || P <= 0) throw new Error('P y F deben ser positivos')
  if (n === 0) throw new Error('n no puede ser 0')
  const factor = F / P
  const i = Math.pow(factor, 1 / n) - 1
  return { P, F, I: F - P, i, n, factor, iSimple: P * i * n, series: buildSeries(P, i, n) }
}

export function calcCompN(P: number, F: number, iPct: number): CompoundResult {
  const i = iPct / 100
  if (i === 0) throw new Error('La tasa no puede ser 0')
  if (F <= P) throw new Error('F debe ser mayor que P')
  const factor = F / P
  const n = Math.log(factor) / Math.log(1 + i)
  return {
    P,
    F,
    I: F - P,
    i,
    n,
    factor,
    iSimple: P * i * n,
    series: buildSeries(P, i, Math.ceil(n)),
  }
}

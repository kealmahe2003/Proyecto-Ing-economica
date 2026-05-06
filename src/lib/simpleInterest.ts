import type { SimpleResult } from '../types/finance.types'

// ============================================================
// SIMPLE INTEREST — Pure functions, no React dependencies
// I = P * i * n
// F = P * (1 + i * n)
// ============================================================

function validate(vals: Record<string, number | undefined>) {
  for (const [k, v] of Object.entries(vals)) {
    if (v === undefined || isNaN(v)) throw new Error(`El campo "${k}" es requerido`)
    if (v < 0) throw new Error(`"${k}" no puede ser negativo`)
  }
}

export function calcSimpleF(P: number, iPct: number, n: number): SimpleResult {
  validate({ P, 'Tasa i': iPct, n })
  const i = iPct / 100
  const I = P * i * n
  const F = P + I
  return { P, F, I, i, n, iPct }
}

export function calcSimpleP(F: number, iPct: number, n: number): SimpleResult {
  validate({ F, 'Tasa i': iPct, n })
  if (n === 0) throw new Error('n no puede ser 0 al despejar P')
  const i = iPct / 100
  const P = F / (1 + i * n)
  const I = F - P
  return { P, F, I, i, n, iPct }
}

export function calcSimpleN(P: number, F: number, iPct: number): SimpleResult {
  validate({ P, F, 'Tasa i': iPct })
  if (iPct === 0) throw new Error('La tasa no puede ser 0 al despejar n')
  if (F <= P) throw new Error('F debe ser mayor que P para calcular n')
  const i = iPct / 100
  const I = F - P
  const n = I / (P * i)
  return { P, F, I, i, n, iPct }
}

export function calcSimpleI(P: number, F: number, n: number): SimpleResult {
  validate({ P, F, n })
  if (n === 0) throw new Error('n no puede ser 0 al despejar la tasa')
  if (F <= P) throw new Error('F debe ser mayor que P')
  const I = F - P
  const i = I / (P * n)
  const iPct = i * 100
  return { P, F, I, i, n, iPct }
}

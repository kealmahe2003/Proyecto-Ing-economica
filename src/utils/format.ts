// ============================================================
// FORMATTERS & UTILITIES
// ============================================================

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function fmtCOP(n: number) {
  return COP.format(n)
}
export function fmtUSD(n: number) {
  return USD.format(n)
}
export function fmtNumber(n: number, decimals = 2) {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: decimals }).format(n)
}
export function fmtPct(n: number, d = 4) {
  return `${n.toFixed(d)}%`
}
export function fmtPctShort(n: number) {
  return `${n.toFixed(2)}%`
}

export function fmtCurrency(n: number, currency: 'COP' | 'USD' = 'COP') {
  return currency === 'COP' ? fmtCOP(n) : fmtUSD(n)
}

export function parseNumber(s: string): number {
  return parseFloat(s.replace(/[^0-9.-]/g, ''))
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

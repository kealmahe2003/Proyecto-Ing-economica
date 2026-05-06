import type { RateConversionResult, CapFreq } from '../types/finance.types'

// ============================================================
// RATE CONVERSION
// EA → Nominal: iN = m * [(1+EA)^(1/m) - 1]
// Nominal → EA: EA = (1 + iN/m)^m - 1
// Anticipada ↔ Vencida: iV = iA/(1-iA), iA = iV/(1+iV)
// ============================================================

const freqLabel: Record<number, string> = {
  1: 'anual', 2: 'semestral', 4: 'trimestral',
  12: 'mensual', 52: 'semanal', 365: 'diaria',
}

function allEquivalences(EA: number) {
  const freqs: { m: number; label: string }[] = [
    { m: 365, label: 'Diaria' }, { m: 52, label: 'Semanal' },
    { m: 12, label: 'Mensual MV' }, { m: 4, label: 'Trimestral' },
    { m: 2, label: 'Semestral' }, { m: 1, label: 'Anual EA' },
  ]
  const monthly = Math.pow(1 + EA, 1 / 12) - 1
  const iMA = monthly / (1 + monthly)
  const results = freqs.map(({ m, label }) => {
    const eff = Math.pow(1 + EA, 1 / m) - 1
    return { label, pct: +(eff * 100).toFixed(8) }
  })
  results.splice(2, 0, { label: 'Mensual MA', pct: +(iMA * 100).toFixed(8) })
  return { equivalences: results, monthly }
}

export function convertEAtoNominal(EAPct: number, m: CapFreq): RateConversionResult {
  const EA = EAPct / 100
  const effPer = Math.pow(1 + EA, 1 / m) - 1
  const iNom = effPer * m
  const { equivalences, monthly } = allEquivalences(EA)
  return {
    inputLabel: `Tasa EA`, inputPct: EAPct,
    outputLabel: `Nominal ${freqLabel[m] || m + 'x/año'}`,
    outputPct: +(iNom * 100).toFixed(8),
    formula: `iₙ = ${m} × [(1 + ${EAPct}%)^(1/${m}) − 1] = ${(iNom * 100).toFixed(6)}%`,
    equivalences, EA: EAPct, monthly: +(monthly * 100).toFixed(8),
  }
}

export function convertNominalToEA(nomPct: number, m: CapFreq): RateConversionResult {
  const effPer = (nomPct / 100) / m
  const EA = Math.pow(1 + effPer, m) - 1
  const { equivalences, monthly } = allEquivalences(EA)
  return {
    inputLabel: `Nominal ${freqLabel[m] || m + 'x/año'}`,
    inputPct: nomPct,
    outputLabel: 'Tasa EA',
    outputPct: +(EA * 100).toFixed(8),
    formula: `EA = (1 + ${nomPct}%/${m})^${m} − 1 = ${(EA * 100).toFixed(6)}%`,
    equivalences, EA: +(EA * 100).toFixed(8), monthly: +(monthly * 100).toFixed(8),
  }
}

export function convertEAtoEffective(EAPct: number, m: CapFreq): RateConversionResult {
  const EA = EAPct / 100
  const effPer = Math.pow(1 + EA, 1 / m) - 1
  const { equivalences, monthly } = allEquivalences(EA)
  return {
    inputLabel: 'Tasa EA', inputPct: EAPct,
    outputLabel: `Efectiva ${freqLabel[m] || 'por período'}`,
    outputPct: +(effPer * 100).toFixed(8),
    formula: `iₑ = (1 + EA)^(1/${m}) − 1 = ${(effPer * 100).toFixed(6)}%`,
    equivalences, EA: EAPct, monthly: +(monthly * 100).toFixed(8),
  }
}

export function convertEffectiveToEA(effPct: number, m: CapFreq): RateConversionResult {
  const eff = effPct / 100
  const EA = Math.pow(1 + eff, m) - 1
  const { equivalences, monthly } = allEquivalences(EA)
  return {
    inputLabel: `Efectiva ${freqLabel[m] || 'por período'}`,
    inputPct: effPct,
    outputLabel: 'Tasa EA',
    outputPct: +(EA * 100).toFixed(8),
    formula: `EA = (1 + ${effPct}%)^${m} − 1 = ${(EA * 100).toFixed(6)}%`,
    equivalences, EA: +(EA * 100).toFixed(8), monthly: +(monthly * 100).toFixed(8),
  }
}

export function convertAnticipatedToVencida(iAPct: number): RateConversionResult {
  const iA = iAPct / 100
  if (iA >= 1) throw new Error('La tasa anticipada debe ser menor al 100%')
  const iV = iA / (1 - iA)
  const EA = Math.pow(1 + iV, 12) - 1
  const { equivalences, monthly } = allEquivalences(EA)
  return {
    inputLabel: 'Tasa Anticipada (MA)', inputPct: iAPct,
    outputLabel: 'Tasa Vencida (MV)',
    outputPct: +(iV * 100).toFixed(8),
    formula: `iᵥ = iₐ / (1 − iₐ) = ${iAPct}% / (1 − ${iAPct}%) = ${(iV * 100).toFixed(6)}%`,
    equivalences, EA: +(EA * 100).toFixed(8), monthly: +(monthly * 100).toFixed(8),
  }
}

export function convertVencidaToAnticipated(iVPct: number): RateConversionResult {
  const iV = iVPct / 100
  const iA = iV / (1 + iV)
  const EA = Math.pow(1 + iV, 12) - 1
  const { equivalences, monthly } = allEquivalences(EA)
  return {
    inputLabel: 'Tasa Vencida (MV)', inputPct: iVPct,
    outputLabel: 'Tasa Anticipada (MA)',
    outputPct: +(iA * 100).toFixed(8),
    formula: `iₐ = iᵥ / (1 + iᵥ) = ${iVPct}% / (1 + ${iVPct}%) = ${(iA * 100).toFixed(6)}%`,
    equivalences, EA: +(EA * 100).toFixed(8), monthly: +(monthly * 100).toFixed(8),
  }
}

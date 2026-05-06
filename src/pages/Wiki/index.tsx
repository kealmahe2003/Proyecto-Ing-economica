import { useState } from 'react'
import { PageHeader } from '../../components/ui'

const CONCEPTS = [
  {
    id: 'valor-tiempo',
    category: 'Fundamentos',
    title: 'Valor del dinero en el tiempo',
    tagline: 'Un peso hoy vale más que un peso mañana',
    body: `El principio más importante en las finanzas: el dinero tiene un valor diferente según el momento en que se recibe o se paga.
    
Un peso hoy es más valioso que un peso en el futuro por tres razones:
• Capacidad productiva: el peso de hoy puede invertirse y generar rendimientos.
• Riesgo: el futuro es incierto; es preferible tener certeza hoy.
• Inflación: el poder adquisitivo del dinero disminuye con el tiempo.

Este principio es la base de todos los cálculos de ingeniería económica. Sin él, no tendría sentido descontar flujos futuros ni calcular tasas de interés.`,
    formula: null,
  },
  {
    id: 'interes-simple',
    category: 'Interés',
    title: 'Interés Simple',
    tagline: 'Rendimiento lineal sobre el capital original',
    body: `En el interés simple, el rendimiento se calcula siempre sobre el capital inicial (P). Los intereses de cada período no se acumulan al principal.

El crecimiento es LINEAL: si inviertes $1.000.000 al 2% mensual, cada mes ganas exactamente $20.000, sin importar cuántos meses hayan pasado.

Usos comunes: descuentos comerciales, operaciones de corto plazo (< 1 año), préstamos de consumo de ciclo corto.

⚠ Advertencia: para períodos mayores a un año, el interés simple subestima significativamente el costo/rendimiento real frente al compuesto.`,
    formula: 'I = P × i × n     F = P × (1 + i × n)',
  },
  {
    id: 'interes-compuesto',
    category: 'Interés',
    title: 'Interés Compuesto',
    tagline: 'Los intereses generan más intereses — crecimiento exponencial',
    body: `En el interés compuesto, al final de cada período los intereses se CAPITALIZAN: se suman al principal y pasan a ser la nueva base de cálculo.

El crecimiento es EXPONENCIAL. Si inviertes $1.000.000 al 2% mensual con capitalización mensual:
• Mes 1: ganas $20.000 → nuevo saldo $1.020.000
• Mes 2: ganas $20.400 (ya no $20.000) → nuevo saldo $1.040.400
• Mes 12: acumulado $1.268.242 (vs $1.240.000 del simple)

La diferencia parece pequeña al principio pero se hace enorme con el tiempo. A 10 años al 2% mensual, el compuesto da $9.5M vs $3.4M del simple sobre $1M inicial.`,
    formula: 'F = P × (1 + i)^n     P = F × (1 + i)^-n',
  },
  {
    id: 'tasa-nominal',
    category: 'Tasas',
    title: 'Tasa Nominal',
    tagline: 'La tasa anunciada, antes de considerar la capitalización',
    body: `La tasa nominal es la tasa que se anuncia o "nombra", expresada en términos anuales, pero sin reflejar el efecto de la capitalización.

Ejemplo: "24% NMV" (Nominal Mensual Vencida) significa que la tasa mensual es 24%/12 = 2% mensual. Pero el costo anual REAL de ese crédito NO es 24%, sino más alto, porque cada mes se capitaliza.

Las tasas nominales son útiles para comunicar condiciones financieras de forma sencilla. En Colombia, la Circular Básica Jurídica de la Superfinanciera obliga a los bancos a reportar también la tasa EA para facilitar la comparación.

Notación común en Colombia:
• NMV: Nominal Mensual Vencido
• NTV: Nominal Trimestral Vencido
• NSV: Nominal Semestral Vencido`,
    formula: 'iₙ = m × iₑ     donde m = veces de capitalización por año',
  },
  {
    id: 'tasa-ea',
    category: 'Tasas',
    title: 'Tasa Efectiva Anual (EA)',
    tagline: 'El verdadero costo o rendimiento, incluyendo la capitalización',
    body: `La tasa efectiva anual (EA) es la tasa que, capitalizada UNA sola vez al año, produce el mismo resultado que la tasa nominal capitalizada m veces.

La EA permite comparar productos financieros con diferentes frecuencias de capitalización en igualdad de condiciones.

Ejemplo: ¿qué es mejor, un CDT al 22% NMV o uno al 23% NSV?
• 22% NMV → EA = (1 + 0.22/12)^12 - 1 = 24.36% EA
• 23% NSV → EA = (1 + 0.23/2)^2 - 1 = 24.32% EA
El CDT del 22% NMV es ligeramente mejor aunque la nominal parezca menor.

⚠ Siempre usa la EA para comparar. La tasa nominal sola no es suficiente.`,
    formula: 'EA = (1 + iₙ/m)^m − 1     |     iₑ = (1 + EA)^(1/m) − 1',
  },
  {
    id: 'tasa-anticipada',
    category: 'Tasas',
    title: 'Tasa Anticipada vs Vencida',
    tagline: 'El momento del cobro del interés cambia el costo real',
    body: `La distinción entre anticipada y vencida se refiere al MOMENTO en que se cobra el interés dentro del período.

VENCIDA (MV — Mes Vencido): el interés se cobra al final del período. Es la modalidad más común. Si tienes un crédito al 2% MV, pagas el interés después de que transcurra el mes.

ANTICIPADA (MA — Mes Anticipado): el interés se cobra al INICIO del período. Si un banco te presta $1.000.000 al 2% MA, te entrega $980.000 hoy y al final del mes pagas $1.000.000. Esto significa que efectivamente pagaste intereses sobre un capital que nunca tuviste completo.

El impacto: una tasa anticipada del 2% equivale a una tasa vencida del 2.0408% (mayor). Por eso la modalidad anticipada siempre es más costosa para el deudor.`,
    formula: 'iᵥ = iₐ / (1 − iₐ)     |     iₐ = iᵥ / (1 + iᵥ)',
  },
  {
    id: 'amortizacion',
    category: 'Crédito',
    title: 'Sistemas de Amortización',
    tagline: 'Cómo se va pagando gradualmente una deuda',
    body: `Amortizar es reducir progresivamente una deuda mediante pagos periódicos. Cada pago tiene dos componentes: interés y abono a capital.

SISTEMA FRANCÉS (el más usado en Colombia): la cuota total es FIJA durante toda la vida del crédito. Al inicio, la mayor parte de la cuota es interés; al final, es mayoritariamente capital. La fórmula es la misma que la de la anualidad ordinaria.

SISTEMA ALEMÁN: el abono al capital es CONSTANTE en cada período. Como el saldo decrece regularmente, el interés de cada período disminuye y la cuota total va bajando. La primera cuota es la más alta y la última la más baja.

SISTEMA AMERICANO: durante toda la vida del préstamo solo se pagan intereses; el capital completo se paga al vencimiento en un solo pago "bullet".`,
    formula: 'Cuota (francés) = P × [i(1+i)^n] / [(1+i)^n − 1]',
  },
  {
    id: 'anualidad',
    category: 'Series',
    title: 'Anualidades y Series Uniformes',
    tagline: 'Pagos iguales en intervalos iguales de tiempo',
    body: `Una serie uniforme es cualquier sucesión de pagos (o ingresos) de igual cuantía que ocurren en intervalos iguales de tiempo.

El nombre "anualidad" es histórico; en la práctica pueden ser pagos mensuales, trimestrales, etc.

TIPOS:
• Ordinaria: pagos al final de cada período (la más común).
• Anticipada: pagos al inicio de cada período.
• Diferida: hay un período de gracia antes de comenzar los pagos.
• Perpetua: los pagos no tienen fin. Su valor presente = PMT / i.

APLICACIONES: cualquier crédito bancario, un plan de ahorro, pensiones voluntarias, proyectos con ingresos regulares.

La relación entre PV y PMT es exactamente la fórmula de amortización del sistema francés — son el mismo fenómeno visto desde perspectivas distintas.`,
    formula: 'PV = PMT × [1 − (1+i)^−n] / i     FV = PMT × [(1+i)^n − 1] / i',
  },
  {
    id: 'inflacion',
    category: 'Inflación',
    title: 'Inflación y Tasas Reales',
    tagline: 'La inflación erosiona el poder adquisitivo del dinero',
    body: `La inflación es el aumento generalizado y sostenido del nivel de precios. Para el análisis financiero, lo relevante es distinguir entre tasas NOMINALES y REALES.

TASA NOMINAL: lo que el banco anuncia o cobra. Incluye la compensación por inflación.
TASA REAL: el rendimiento o costo después de descontar el efecto de la inflación. Refleja el aumento real de poder adquisitivo.

ECUACIÓN DE FISHER (exacta):
(1 + iNominal) = (1 + iReal) × (1 + π)

APROXIMACIÓN (válida para tasas bajas):
iReal ≈ iNominal − π

En Colombia, el IPC (Índice de Precios al Consumidor) es la medida oficial de inflación, publicada mensualmente por el DANE. El Banco de la República fija su meta de inflación anual (generalmente 3%).`,
    formula: '(1 + iₙ) = (1 + iᵣ) × (1 + π)     →     iᵣ = (1+iₙ)/(1+π) − 1',
  },
]

const CATEGORIES = ['Todos', 'Fundamentos', 'Interés', 'Tasas', 'Crédito', 'Series', 'Inflación']

export default function WikiPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Todos')
  const [expanded, setExpanded] = useState<string | null>('interes-compuesto')

  const filtered = CONCEPTS.filter(c => {
    const matchCat = cat === 'Todos' || c.category === cat
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.body.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Referencia"
        title="Wiki de Conceptos"
        description="Definiciones completas, fórmulas y ejemplos de todos los conceptos de Ingeniería Económica. Una referencia rápida para clase y exámenes."
      />

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            className="input-field pl-9"
            placeholder="Buscar concepto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>⌕</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={c === cat
                ? { background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.4)', color: '#00C9A7' }
                : { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }
              }>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Concepts */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>
            No se encontraron conceptos para "{search}"
          </p>
        )}
        {filtered.map(concept => (
          <div key={concept.id} className="glass-card overflow-hidden transition-all duration-200"
            style={{ borderColor: expanded === concept.id ? 'rgba(0,201,167,0.3)' : 'var(--border)' }}>
            <button
              className="w-full flex items-start gap-4 p-5 text-left"
              onClick={() => setExpanded(expanded === concept.id ? null : concept.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs mono uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ background: 'rgba(79,124,255,0.1)', color: '#8AABFF', border: '1px solid rgba(79,124,255,0.2)' }}>
                    {concept.category}
                  </span>
                </div>
                <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>{concept.title}</h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{concept.tagline}</p>
              </div>
              <span className="text-lg mt-1 flex-shrink-0 transition-transform duration-200"
                style={{ color: 'var(--muted)', transform: expanded === concept.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                ∨
              </span>
            </button>

            {expanded === concept.id && (
              <div className="px-5 pb-5 animate-fade-up">
                <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

                {concept.formula && (
                  <div className="rounded-xl px-4 py-3 mb-4 mono text-sm"
                    style={{ background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.2)', color: '#F5C842' }}>
                    {concept.formula}
                  </div>
                )}

                <div className="text-sm space-y-3" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
                  {concept.body.split('\n\n').map((para, i) => (
                    <p key={i} style={{ whiteSpace: 'pre-line' }}
                      dangerouslySetInnerHTML={{
                        __html: para
                          .replace(/\*\*(.*?)\*\*/g, `<strong style="color:var(--text)">$1</strong>`)
                          .replace(/•/g, '<span style="color:#00C9A7;margin-right:6px">▸</span>')
                          .replace(/⚠/g, '<span style="color:#F5C842">⚠</span>')
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

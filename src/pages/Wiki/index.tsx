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

El Valor del Dinero en el Tiempo también está afectado por factores como la inflación, la tasa de interés, el riesgo financiero y la equivalencia económica.

Su importancia es clave para evaluar inversiones, comparar alternativas, analizar préstamos, calcular valores presentes y futuros, y tomar decisiones financieras fundamentadas.

Este principio es la base de todos los cálculos de ingeniería económica. Sin él, no tendría sentido descontar flujos futuros ni calcular tasas de interés.`,
    formula: null,
    variables: null,
  },
  {
    id: 'valor-presente-futuro',
    category: 'Fundamentos',
    title: 'Valor Presente y Valor Futuro',
    tagline: 'Dos perspectivas del mismo valor económico a través del tiempo',
    body: `El valor presente (VP) es la cantidad de dinero que hoy equivale a una suma futura descontada a una tasa de interés. El valor futuro (VF) es el monto que alcanza esa cantidad después de un período de tiempo al aplicarle intereses.

El VP se usa para comparar alternativas financieras al llevar los flujos futuros al presente. El VF se usa para proyectar ahorros, planificar inversiones y medir el crecimiento de un capital.`,
    formula: null,
    variables: [
      ['VP', 'Valor presente — cantidad equivalente hoy a un pago futuro'],
      ['VF', 'Valor futuro — monto que alcanza un capital después de n períodos'],
      ['i', 'Tasa de interés efectiva por período'],
      ['n', 'Número de períodos'],
    ],
  },
  {
    id: 'interes-general',
    category: 'Interés',
    title: 'Interés',
    tagline: 'La compensación por prestar, invertir o diferir dinero',
    body: `El interés es el rendimiento que se obtiene por ceder el uso del dinero durante un período determinado. Puede ser un ingreso para quien presta o un costo para quien recibe el crédito.

El interés puede ser simple o compuesto, dependiendo de si los intereses se capitalizan y generan intereses en períodos posteriores.`,
    formula: null,
    variables: [
      ['P', 'Capital inicial o monto del préstamo'],
      ['F', 'Monto final (capital + intereses)'],
      ['i', 'Tasa de interés por período'],
      ['n', 'Número de períodos'],
    ],
  },
  {
    id: 'historia-interes',
    category: 'Interés',
    title: 'Historia del Interés',
    tagline: 'Cómo cambió la percepción del interés desde la antigüedad hasta la actualidad',
    body: `En la antigüedad el interés era visto con recelo y a menudo se rechazaba como injusto. En la Edad Media comenzó a surgir el concepto, pero siguió siendo cuestionado por razones éticas y religiosas.

Durante la evolución histórica, la Iglesia y los pensadores comenzaron a diferenciar entre usura y un interés legítimo. Huguccio distinguió el cobro abusivo del arrendamiento legítimo, y Hostiense introdujo la idea del lucro cesante.

Más tarde, figuras como Francisco de Vitoria defendieron que el interés podía contribuir al desarrollo económico. Claude Saumaise igualó la ganancia del alquiler con la del préstamo de dinero. Richard Cantillon explicó que el interés compensa el riesgo asumido por el prestamista.

Turgot defendió que nadie puede ser obligado a prestar dinero sin recibir una compensación adecuada. Adam Smith ubicó el interés como ingreso del capital, distinto de los salarios y la renta. Con el tiempo, la prohibición religiosa del cobro de intereses fue cediendo y el interés se consolidó como herramienta financiera.`,
    formula: null,
    variables: null,
  },
  {
    id: 'diagramas-flujo-efectivo',
    category: 'Fundamentos',
    title: 'Diagramas de Flujo de Efectivo',
    tagline: 'Representan ingresos y egresos del proyecto en el tiempo',
    body: `Los diagramas de flujo de efectivo muestran gráficamente los movimientos de dinero de un proyecto a lo largo de los períodos analizados. Facilitan el análisis financiero y hacen visible cuándo ocurren ingresos, egresos e inversiones.

Elementos de un diagrama:
• Línea de tiempo: los períodos analizados.
• Período 0: el inicio del análisis.
• Flechas hacia arriba: ingresos, beneficios o recuperaciones de capital.
• Flechas hacia abajo: egresos, inversiones o costos.

Su utilidad principal es ayudar a visualizar flujos, comparar alternativas financieras y aplicar factores de equivalencia económica.`,
    formula: null,
    variables: null,
  },
  {
    id: 'equivalencia-financiera',
    category: 'Fundamentos',
    title: 'Equivalencia Financiera',
    tagline: 'Dos montos en tiempos distintos son equivalentes si tienen igual valor económico',
    body: `La equivalencia financiera establece que dos o más cantidades de dinero en momentos diferentes pueden considerarse equivalentes si generan el mismo valor al compararlas con una tasa de interés adecuada.

El principio fundamental es que dos alternativas son equivalentes cuando producen el mismo valor en un mismo punto del tiempo usando la tasa correcta. Esto permite convertir valores futuros a presentes, o viceversa, y comparar opciones con diferentes momentos de pago.`,
    formula: null,
    variables: null,
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
    variables: [
      ['P', 'Capital inicial (valor presente)'],
      ['i', 'Tasa de interés por período (debe coincidir en unidad con n)'],
      ['n', 'Número de períodos (días, meses, años, etc.)'],
      ['I', 'Interés total ganado: I = P × i × n'],
      ['F', 'Valor futuro (monto final): F = P + I'],
    ],
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
    variables: [
      ['P', 'Capital presente (valor hoy)'],
      ['F', 'Valor futuro (monto después de n períodos)'],
      ['i', 'Tasa efectiva por período (debe ser efectiva, no nominal)'],
      ['n', 'Número de períodos de capitalización'],
    ],
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
    variables: [
      ['iₙ', 'Tasa nominal anual (la que se anuncia)'],
      ['m', 'Número de capitalizaciones por año (12=mensual, 4=trimestral, etc.)'],
      ['iₑ', 'Tasa efectiva por período'],
    ],
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
    variables: [
      ['EA', 'Tasa Efectiva Anual (costo/rendimiento real anual)'],
      ['iₙ', 'Tasa nominal anual'],
      ['m', 'Número de capitalizaciones por año'],
      ['iₑ', 'Tasa efectiva por período'],
    ],
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
    variables: [
      ['iᵥ', 'Tasa vencida (se cobra al final del período)'],
      ['iₐ', 'Tasa anticipada (se cobra al inicio del período)'],
    ],
  },
  {
    id: 'amortizacion',
    category: 'Crédito',
    title: 'Sistemas de Amortización',
    tagline: 'Cómo se va pagando gradualmente una deuda',
    body: `Amortizar es reducir progresivamente una deuda mediante pagos periódicos. Cada pago tiene dos componentes: interés y abono a capital.

CUOTA FIJA (el más usado en Colombia): la cuota total es CONSTANTE durante toda la vida del crédito. Al inicio, la mayor parte de la cuota es interés; al final, es mayoritariamente capital. La fórmula es la misma que la de la anualidad ordinaria.

CAPITAL CONSTANTE + INTERESES: el abono al capital es IGUAL en cada período. Como el saldo decrece regularmente, el interés de cada período disminuye y la cuota total va bajando. La primera cuota es la más alta y la última la más baja.

SISTEMA AMERICANO: durante toda la vida del préstamo solo se pagan intereses; el capital completo se paga al vencimiento en un solo pago "bullet".`,
    formula: 'Cuota fija = P × [i(1+i)^n] / [(1+i)^n − 1]',
    variables: [
      ['P', 'Monto total del crédito (capital prestado)'],
      ['i', 'Tasa de interés efectiva por período'],
      ['n', 'Número de cuotas o períodos del préstamo'],
    ],
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

La relación entre PV y PMT es exactamente la fórmula de amortización de cuota fija — son el mismo fenómeno visto desde perspectivas distintas.`,
    formula: 'PV = PMT × [1 − (1+i)^−n] / i     FV = PMT × [(1+i)^n − 1] / i',
    variables: [
      ['PV', 'Valor presente de la serie (equivalente hoy)'],
      ['FV', 'Valor futuro de la serie (acumulado al final)'],
      ['PMT', 'Pago periódico uniforme (cuota constante)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos de la serie'],
    ],
  },
  {
    id: 'inflacion',
    category: 'Inflación',
    title: 'Inflación y Tasas Reales',
    tagline: 'La inflación erosiona el poder adquisitivo del dinero',
    body: `La inflación es el aumento generalizado y sostenido del nivel de precios. Para el análisis financiero, lo relevante es distinguir entre tasas NOMINALES y REALES.

TASA NOMINAL: lo que el banco anuncia o cobra. Incluye la compensación por inflación.
TASA REAL: el rendimiento o costo después de descontar el efecto de la inflación. Refleja el aumento real de poder adquisitivo.

El poder adquisitivo es la cantidad de bienes y servicios que una persona puede comprar con una cantidad fija de dinero. Si los precios suben más rápido que los ingresos, el poder adquisitivo cae aunque el monto nominal sea mayor.

La inflación afecta especialmente a ahorradores, pensionados, personas con ingresos fijos e inversionistas conservadores. Los deudores con tasas de interés fijas pueden ver reducido el valor real de sus pagos cuando la inflación es alta.

Factores que influyen en la inflación:
• Oferta y demanda.
• Confianza económica.
• Políticas monetarias y fiscales.

ECUACIÓN DE FISHER (exacta):
(1 + iNominal) = (1 + iReal) × (1 + π)

APROXIMACIÓN (válida para tasas bajas):
iReal ≈ iNominal − π

En Colombia, el IPC (Índice de Precios al Consumidor) es la medida oficial de inflación, publicada mensualmente por el DANE. El Banco de la República fija su meta de inflación anual (generalmente 3%).`,
    formula: '(1 + iₙ) = (1 + iᵣ) × (1 + π)     →     iᵣ = (1+iₙ)/(1+π) − 1',
    variables: [
      ['iₙ', 'Tasa nominal (la que el banco anuncia o cobra)'],
      ['iᵣ', 'Tasa real (después de descontar inflación)'],
      ['π', 'Tasa de inflación del período'],
    ],
  },
  {
    id: 'factor-fp',
    category: 'Factores',
    title: 'Factor De Cantidad Compuesta Pago Único (F/P)',
    tagline: 'Busca el Futuro dado un Presente',
    body: `Se usa cuando conoces un capital hoy (P) y quieres saber cuánto valdrá en el futuro después de n períodos a una tasa i.

Casos de uso:
- ¿Cuánto valdrá mi inversión de $1.000.000 en 3 años al 2% mensual?
- ¿Cuál será el saldo de una deuda si no se paga en n períodos?
- Proyectar el valor futuro de cualquier capital inicial.

Notación: F = P(F/P, i%, n)`,
    formula: 'F = P × (1 + i)ⁿ',
    variables: [
      ['P', 'Capital presente (invertido hoy)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos'],
      ['F', 'Valor futuro resultante'],
    ],
  },
  {
    id: 'factor-pf',
    category: 'Factores',
    title: 'Factor De Descuento Pago Único (P/F)',
    tagline: 'Busca el Presente dado un Futuro',
    body: `Se usa cuando conoces un valor futuro (F) y quieres saber cuánto equivale hoy, descontado a una tasa i durante n períodos.

Casos de uso:
- ¿Cuánto debo invertir hoy para tener $5.000.000 en 2 años al 1.5% mensual?
- Calcular el valor presente de un pago único que ocurrirá en el futuro.
- Comparar alternativas que tienen beneficios en momentos distintos.

Notación: P = F(P/F, i%, n)`,
    formula: 'P = F × (1 + i)⁻ⁿ',
    variables: [
      ['F', 'Valor futuro (monto a recibir en el futuro)'],
      ['i', 'Tasa de descuento efectiva por período'],
      ['n', 'Número de períodos'],
      ['P', 'Valor presente resultante'],
    ],
  },
  {
    id: 'factor-fa',
    category: 'Factores',
    title: 'Factor De Cantidad Compuesta Serie Uniforme (F/A)',
    tagline: 'Busca el Futuro dada una Anualidad',
    body: `Se usa cuando realizas pagos o aportes iguales (A) al final de cada período y quieres saber cuánto acumularás al final de n períodos.

Casos de uso:
- ¿Cuánto acumularé si ahorro $200.000 cada mes durante 5 años al 1% mensual?
- Calcular el valor futuro de un plan de ahorro con aportes periódicos iguales.
- Proyectar el valor final de una serie de ingresos regulares.

Notación: F = A(F/A, i%, n)`,
    formula: 'F = A × [(1+i)ⁿ − 1] / i',
    variables: [
      ['A', 'Anualidad (pago periódico igual al final de cada período)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos'],
      ['F', 'Valor futuro acumulado'],
    ],
  },
  {
    id: 'factor-af',
    category: 'Factores',
    title: 'Factor De Fondo de Amortización (A/F)',
    tagline: 'Busca la Anualidad dado un Futuro',
    body: `Se usa cuando necesitas acumular un monto futuro (F) y quieres saber qué cuota igual debes depositar al final de cada período durante n períodos.

Casos de uso:
- ¿Cuánto debo ahorrar cada mes para tener $10.000.000 en 3 años al 1% mensual?
- Planificar aportes periódicos para alcanzar una meta futura específica.
- Calcular cuotas de un fondo de reserva o reemplazo de activos.

Notación: A = F(A/F, i%, n)`,
    formula: 'A = F × i / [(1+i)ⁿ − 1]',
    variables: [
      ['F', 'Valor futuro deseado (meta a alcanzar)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos'],
      ['A', 'Anualidad (cuota periódica a depositar)'],
    ],
  },
  {
    id: 'factor-pa',
    category: 'Factores',
    title: 'Factor De Valor Presente Serie Uniforme (P/A)',
    tagline: 'Busca el Presente dada una Anualidad',
    body: `Se usa cuando recibirás o pagarás cuotas iguales (A) durante n períodos y quieres saber cuánto vale hoy esa serie de pagos.

Casos de uso:
- ¿Cuánto vale hoy una serie de 24 pagos de $500.000 al 1.5% mensual?
- Calcular el monto máximo que puedes pedir prestado si puedes pagar una cuota fija.
- Valorar una renta, pensión o flujo de ingresos regulares.

Notación: P = A(P/A, i%, n)`,
    formula: 'P = A × [1 − (1+i)⁻ⁿ] / i',
    variables: [
      ['A', 'Anualidad (pago periódico igual)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos'],
      ['P', 'Valor presente de la serie'],
    ],
  },
  {
    id: 'factor-ap',
    category: 'Factores',
    title: 'Factor De Recuperación de Capital (A/P)',
    tagline: 'Busca la Anualidad dado un Presente',
    body: `Se usa cuando tienes un capital hoy (P) o una deuda, y quieres saber qué cuota igual debes pagar al final de cada período durante n períodos para recuperarlo o saldarlo.

Casos de uso:
- ¿Cuál es la cuota mensual de un crédito de $10.000.000 a 24 meses al 1.5%?
- Calcular la cuota fija de cualquier crédito o préstamo.
- Determinar los ingresos periódicos necesarios para recuperar una inversión.

⚠ Este factor es exactamente la fórmula de cuota fija (sistema francés).

Notación: A = P(A/P, i%, n)`,
    formula: 'A = P × [i(1+i)ⁿ] / [(1+i)ⁿ − 1]',
    variables: [
      ['P', 'Capital presente (monto del préstamo o inversión)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos'],
      ['A', 'Anualidad (cuota periódica a pagar)'],
    ],
  },
  {
    id: 'factor-pg',
    category: 'Factores',
    title: 'Factor De Valor Presente Gradiente Aritmético (P/G)',
    tagline: 'Busca el Presente de una serie que crece en cantidad constante',
    body: `Se usa cuando los pagos NO son iguales sino que aumentan (o disminuyen) en una cantidad constante G cada período. El primer pago del gradiente puro ocurre en el período 2.

Casos de uso:
- Proyectos donde los costos de mantenimiento aumentan $50.000 cada año.
- Ingresos que crecen una cantidad fija por período.
- Combinado con (P/A) cuando hay una base uniforme más un gradiente.

Nota: G es el incremento constante entre períodos consecutivos. Si los pagos son 0, G, 2G, 3G... se aplica el factor puro. Si los pagos son A, A+G, A+2G... se combina P/A + P/G.

Notación: P = G(P/G, i%, n)`,
    formula: 'P = G × [(1+i)ⁿ − i×n − 1] / [i² × (1+i)ⁿ]',
    variables: [
      ['G', 'Gradiente (incremento constante entre períodos consecutivos)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos'],
      ['P', 'Valor presente del gradiente'],
    ],
  },
  {
    id: 'factor-ag',
    category: 'Factores',
    title: 'Factor De Serie Uniforme Gradiente Aritmético (A/G)',
    tagline: 'Convierte un gradiente aritmético en una anualidad equivalente',
    body: `Se usa para convertir una serie en gradiente aritmético en una serie uniforme equivalente. Es útil cuando necesitas expresar un gradiente como una cuota fija equivalente.

Casos de uso:
- Comparar un gradiente con una anualidad uniforme.
- Simplificar cálculos combinando (A/G) con una anualidad base.
- Encontrar la cuota equivalente de una serie creciente.

Relación con otros factores: A_total = A_base + G × (A/G, i%, n)

Notación: A = G(A/G, i%, n)`,
    formula: 'A = G × [1/i − n/((1+i)ⁿ − 1)]',
    variables: [
      ['G', 'Gradiente (incremento constante entre períodos consecutivos)'],
      ['i', 'Tasa efectiva por período'],
      ['n', 'Número de períodos'],
      ['A', 'Anualidad equivalente resultante'],
    ],
  },
]

const CATEGORIES = [
  'Todos',
  'Fundamentos',
  'Interés',
  'Tasas',
  'Crédito',
  'Series',
  'Inflación',
  'Factores',
]

export default function WikiPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Todos')
  const [expanded, setExpanded] = useState<string | null>('interes-compuesto')

  const filtered = CONCEPTS.filter((c) => {
    const matchCat = cat === 'Todos' || c.category === cat
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
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
            onChange={(e) => setSearch(e.target.value)}
          />
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            ⌕
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                c === cat
                  ? {
                      background: 'var(--accent-bg)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent)',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Concepts */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>
            No se encontraron conceptos para &quot;{search}&quot;
          </p>
        )}
        {filtered.map((concept) => (
          <div
            key={concept.id}
            className="card overflow-hidden transition-all duration-200"
            style={{
              borderColor: expanded === concept.id ? 'var(--accent-border)' : 'var(--border)',
            }}
          >
            <button
              className="w-full flex items-start gap-4 p-5 text-left"
              onClick={() => setExpanded(expanded === concept.id ? null : concept.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs mono uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{
                      background: 'var(--blue-bg)',
                      color: 'var(--blue)',
                      border: '1px solid var(--blue-border)',
                    }}
                  >
                    {concept.category}
                  </span>
                </div>
                <h3 className="display text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  {concept.title}
                </h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                  {concept.tagline}
                </p>
              </div>
              <span
                className="text-lg mt-1 flex-shrink-0 transition-transform duration-200"
                style={{
                  color: 'var(--muted)',
                  transform: expanded === concept.id ? 'rotate(180deg)' : 'rotate(0)',
                }}
              >
                ∨
              </span>
            </button>

            {expanded === concept.id && (
              <div className="px-5 pb-5 animate-fade-up">
                <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

                {concept.formula && (
                  <>
                    <div
                      className="rounded-xl px-4 py-3 mb-3 mono text-sm"
                      style={{
                        background: 'var(--gold-bg)',
                        border: '1px solid var(--gold-border)',
                        color: 'var(--gold)',
                      }}
                    >
                      {concept.formula}
                    </div>
                    {concept.variables && (
                      <div
                        className="rounded-xl px-4 py-3 mb-4 text-xs"
                        style={{
                          background: 'var(--surface2)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <p
                          className="mono uppercase tracking-widest mb-2 font-semibold"
                          style={{ color: 'var(--muted)', fontSize: '0.65rem' }}
                        >
                          Variables
                        </p>
                        <ul className="space-y-1">
                          {concept.variables.map(([varName, varDesc]) => (
                            <li key={varName} className="flex gap-2">
                              <span
                                className="mono font-semibold flex-shrink-0"
                                style={{ color: 'var(--accent)', minWidth: 28 }}
                              >
                                {varName}
                              </span>
                              <span style={{ color: 'var(--muted)' }}>{varDesc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <div
                  className="text-sm space-y-3"
                  style={{ color: 'var(--muted)', lineHeight: 1.8 }}
                >
                  {concept.body.split('\n\n').map((para, i) => (
                    <p
                      key={i}
                      style={{ whiteSpace: 'pre-line' }}
                      dangerouslySetInnerHTML={{
                        __html: para
                          .replace(
                            /\*\*(.*?)\*\*/g,
                            `<strong style="color:var(--text)">$1</strong>`
                          )
                          .replace(
                            /•/g,
                            '<span style="color:var(--accent);margin-right:6px">▸</span>'
                          )
                          .replace(/⚠/g, '<span style="color:var(--gold)">⚠</span>'),
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

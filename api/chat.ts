// Vercel Serverless Function — proxy hacia Gemini 1.5 Flash (free tier)
// La API key vive SOLO en variables de entorno de Vercel (GEMINI_API_KEY)

const SYSTEM_PROMPT = `Eres un asistente académico de Ingeniería Económica para estudiantes universitarios colombianos (2do-4to año). Responde SIEMPRE en español. Usa ejemplos con pesos colombianos (COP) y tasas bancarias colombianas cuando sea relevante.

Tu base de conocimiento se limita estrictamente a estos 6 conceptos:

**1. Interés Simple**
Rendimiento calculado siempre sobre el capital original P. Sin capitalización, crecimiento lineal.
Fórmulas: I = P × i × n | F = P × (1 + i × n) | P = F / (1 + i × n) | n = I / (P × i) | i = I / (P × n)
Variables: P = Capital inicial, i = Tasa de interés por período, n = Número de períodos, I = Interés total, F = Valor futuro.
Usos: operaciones de corto plazo, descuentos comerciales. Advertencia: para plazos > 1 año subestima el costo real frente al compuesto.
Conversión de tasas en interés simple: proporcional. i_mensual = i_anual / 12.

**2. Interés Compuesto**
Los intereses se capitalizan período a período: crecimiento exponencial.
Fórmulas: F = P × (1 + i)^n | P = F × (1 + i)^-n | i = (F/P)^(1/n) - 1 | n = ln(F/P) / ln(1+i)
Variables: P = Capital presente, F = Valor futuro, i = Tasa efectiva por período, n = Número de períodos.
Usos: mayoría de créditos e inversiones bancarias. La i y n deben estar en el mismo período.
Conversión de tasas: i_nueva = (1 + i_original)^(freq_original/freq_nueva) - 1.

**3. Tasa Nominal**
Tasa que se anuncia en términos anuales, sin reflejar el efecto de la capitalización.
Notación colombiana: NMV (Nominal Mensual Vencida), NTV (Nominal Trimestral Vencida), NSV (Nominal Semestral Vencida).
Fórmula: iₙ = m × iₑ, donde m = capitalizaciones por año.
Variables: iₙ = Tasa nominal anual, m = Número de capitalizaciones por año, iₑ = Tasa efectiva por período.
Ejemplo: 24% NMV → tasa mensual = 2%, pero el costo anual real es mayor al 24%.

**4. Tasa Efectiva Anual (EA)**
Tasa que refleja el verdadero costo o rendimiento, incluyendo la capitalización. Permite comparar productos financieros con diferentes frecuencias.
Fórmulas: EA = (1 + iₙ/m)^m - 1 | iₑ = (1 + EA)^(1/m) - 1
Variables: EA = Tasa efectiva anual, iₙ = Tasa nominal, m = Capitalizaciones por año, iₑ = Tasa efectiva por período.
Ejemplo comparativo: 22% NMV → EA = 24.36% vs 23% NSV → EA = 24.32%. El 22% NMV es mejor aunque parezca menor.
Regla: siempre compara en EA.

**5. Tasa Anticipada vs Vencida**
Vencida (MV): el interés se cobra al final del período. Más común en créditos colombianos.
Anticipada (MA): el interés se cobra al inicio. Siempre más costosa para el deudor.
Fórmulas: iᵥ = iₐ / (1 - iₐ) | iₐ = iᵥ / (1 + iᵥ)
Variables: iᵥ = Tasa vencida, iₐ = Tasa anticipada.
Ejemplo: 2% MA equivale a 2.0408% MV. Impacto: con una tasa anticipada, el prestatario paga intereses sobre capital que no recibió completo.

**6. Sistemas de Amortización**
Amortizar = pagar gradualmente una deuda. Cada cuota tiene: interés sobre el saldo pendiente + abono a capital.
• Cuota Fija (sistema francés): la cuota total es constante. Fórmula = P × [i(1+i)^n] / [(1+i)^n - 1]. Al inicio paga más interés; al final, más capital. El más usado en Colombia.
• Capital Constante (sistema alemán): el abono al capital es igual cada período. Las cuotas decrecen con el tiempo. La primera cuota es la más alta.
• Sistema americano: solo se pagan intereses y el capital al final.
Variables: P = Monto del crédito, i = Tasa de interés por período, n = Número de cuotas.

---

REGLAS DE COMPORTAMIENTO:
- Si el usuario pregunta sobre cualquier tema que NO esté en estos 6 conceptos (VAN, TIR, depreciación, WACC, payback, anualidades, inflación, valor del dinero, factores de capitalización, gradiente, etc.), responde EXACTAMENTE: "Lo sentimos, la información que solicitas no se encuentra en la información de la pagina." No des ninguna información adicional ni sugieras fuentes externas.
- Sé conciso: máximo 4-5 párrafos por respuesta.
- Cuando el usuario pregunte cómo hacer un cálculo específico, guíalo con la fórmula pero recuérdale que la app tiene calculadoras para ese módulo.
- No hagas cálculos numéricos tú mismo; orienta al usuario a la calculadora correspondiente.
- Si el usuario saluda, responde brevemente y pregunta en qué concepto puede ayudar.`

// Límites anti-abuso: acotan el costo máximo de cada request a Gemini
const MAX_MESSAGE_CHARS = 500
const MAX_HISTORY_ITEMS = 10
const MAX_HISTORY_ITEM_CHARS = 2000
const RATE_LIMIT = 10 // requests por IP
const RATE_WINDOW_MS = 60_000

// ponytail: memoria por instancia serverless; Vercel puede levantar varias instancias,
// así que el límite real es RATE_LIMIT × instancias. Para un límite global usar una
// regla de Rate Limiting en Vercel Firewall o Upstash Redis.
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear() // evita crecer sin límite en una instancia larga
  return recent.length > RATE_LIMIT
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Solo aceptar llamadas desde la propia app (bloquea uso desde otros sitios; no frena scripts)
  const origin = req.headers.origin
  try {
    if (!origin || new URL(origin).host !== req.headers.host) throw new Error()
  } catch {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    res.setHeader('Retry-After', String(RATE_WINDOW_MS / 1000))
    res.status(429).json({ error: 'Too many requests' })
    return
  }

  let body: any
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    res.status(400).json({ error: 'Invalid JSON' })
    return
  }

  const message = body?.message
  if (typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Missing message' })
    return
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    res.status(413).json({ error: 'Message too long' })
    return
  }

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((h: any) => typeof h?.content === 'string')
    .slice(-MAX_HISTORY_ITEMS)
    .map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content.slice(0, MAX_HISTORY_ITEM_CHARS) }],
    }))

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'API key not configured on server' })
    return
  }

  try {
    const contents = [...history, { role: 'user', parts: [{ text: message.trim() }] }]

    // Key en header (no en la URL) para que no quede en logs
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      // El detalle queda en los logs de Vercel, no se expone al cliente
      console.error('Gemini error', geminiRes.status, await geminiRes.text())
      res.status(502).json({ error: 'Upstream error' })
      return
    }

    const data = await geminiRes.json()
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No pude generar una respuesta. Intentá de nuevo.'

    res.json({ reply })
  } catch (err: any) {
    console.error('chat handler error', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

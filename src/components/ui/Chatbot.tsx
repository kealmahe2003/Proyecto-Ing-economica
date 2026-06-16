import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Trash2 } from 'lucide-react'

type Role = 'user' | 'assistant'

interface Message {
  id: number
  role: Role
  content: string
}

let messageIdCounter = 1
function getNextId() {
  return messageIdCounter++
}

const QUICK_TOPICS = [
  'Interés Simple',
  'Interés Compuesto',
  'Tasa Nominal',
  'Tasa EA',
  'Anticipada vs Vencida',
  'Amortización',
]

const WELCOME = `Hola. Puedo explicarte los conceptos de Ingeniería Económica que están en la Wiki: interés simple, interés compuesto, tasa nominal, tasa EA, anticipada vs vencida y amortización.

¿Sobre qué quieres aprender?`

const REJECT_MSG = 'Lo sentimos, la información que solicitas no se encuentra en la información de la pagina.'

const LOCAL_CONCEPTS = [
  {
    title: 'Interés Simple',
    keywords: ['simple', 'interes simple', 'interés simple', 'interés', 'interes'],
    body: `El interés simple se calcula siempre sobre el capital original P. Sin capitalización, crecimiento lineal.\n\nFórmulas:\n• I = P × i × n\n• F = P × (1 + i × n)\n• P = F / (1 + i × n)\n\nVariables:\n• P = Capital inicial\n• i = Tasa de interés por período\n• n = Número de períodos\n• I = Interés total\n• F = Valor futuro\n\nUsos: operaciones de corto plazo, descuentos comerciales. Para plazos mayores a 1 año subestima el costo real frente al compuesto.`,
  },
  {
    title: 'Interés Compuesto',
    keywords: ['compuesto', 'interes compuesto', 'interés compuesto', 'capitalizacion', 'capitalización'],
    body: `En el interés compuesto, los intereses se capitalizan período a período: crecimiento exponencial.\n\nFórmulas:\n• F = P × (1 + i)^n\n• P = F × (1 + i)^-n\n• i = (F/P)^(1/n) - 1\n• n = ln(F/P) / ln(1+i)\n\nVariables:\n• P = Capital presente\n• F = Valor futuro\n• i = Tasa efectiva por período\n• n = Número de períodos\n\nUsos: mayoría de créditos e inversiones bancarias. La i y n deben estar en el mismo período.`,
  },
  {
    title: 'Tasa Nominal',
    keywords: ['nominal', 'tasa nominal', 'nmv', 'ntv', 'nsv'],
    body: `La tasa nominal es la tasa que se anuncia en términos anuales, sin reflejar el efecto de la capitalización.\n\nNotación colombiana:\n• NMV = Nominal Mensual Vencido\n• NTV = Nominal Trimestral Vencido\n• NSV = Nominal Semestral Vencido\n\nFórmula: iₙ = m × iₑ\n\nVariables:\n• iₙ = Tasa nominal anual\n• m = Número de capitalizaciones por año\n• iₑ = Tasa efectiva por período\n\nEjemplo: 24% NMV → tasa mensual = 2%, pero el costo anual real es mayor al 24%.`,
  },
  {
    title: 'Tasa Efectiva Anual (EA)',
    keywords: ['ea', 'efectiva', 'tasa ea', 'efectiva anual'],
    body: `La tasa efectiva anual (EA) refleja el verdadero costo o rendimiento, incluyendo la capitalización. Permite comparar productos financieros con diferentes frecuencias.\n\nFórmulas:\n• EA = (1 + iₙ/m)^m - 1\n• iₑ = (1 + EA)^(1/m) - 1\n\nVariables:\n• EA = Tasa efectiva anual\n• iₙ = Tasa nominal\n• m = Capitalizaciones por año\n• iₑ = Tasa efectiva por período\n\nEjemplo: 22% NMV → EA = 24.36% vs 23% NSV → EA = 24.32%. El 22% NMV es mejor aunque parezca menor.\n\nRegla: siempre compara en EA.`,
  },
  {
    title: 'Tasa Anticipada vs Vencida',
    keywords: ['anticipada', 'vencida', 'mv', 'ma', 'anticipado', 'vencido'],
    body: `La distinción entre anticipada y vencida se refiere al momento en que se cobra el interés.\n\n• Vencida (MV): el interés se cobra al final del período. Más común en créditos colombianos.\n• Anticipada (MA): el interés se cobra al inicio. Siempre más costosa para el deudor.\n\nFórmulas:\n• iᵥ = iₐ / (1 - iₐ)\n• iₐ = iᵥ / (1 + iᵥ)\n\nVariables:\n• iᵥ = Tasa vencida\n• iₐ = Tasa anticipada\n\nEjemplo: 2% MA equivale a 2.0408% MV.`,
  },
  {
    title: 'Amortización',
    keywords: ['amortizacion', 'amortización', 'cuota', 'frances', 'francés', 'aleman', 'alemán', 'deuda', 'prestamo', 'préstamo'],
    body: `Amortizar es pagar gradualmente una deuda. Cada cuota tiene: interés sobre el saldo pendiente + abono a capital.\n\nSistemas:\n• Cuota Fija (sistema francés): la cuota total es constante. Fórmula = P × [i(1+i)^n] / [(1+i)^n - 1]. El más usado en Colombia.\n• Capital Constante (sistema alemán): el abono al capital es igual cada período. Las cuotas decrecen.\n• Sistema americano: solo se pagan intereses y el capital al final.\n\nVariables:\n• P = Monto del crédito\n• i = Tasa de interés por período\n• n = Número de cuotas`,
  },
]

function searchLocal(query: string): string {
  const q = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  if (!q) return REJECT_MSG

  let best = { score: 0, concept: LOCAL_CONCEPTS[0] }
  for (const c of LOCAL_CONCEPTS) {
    let score = 0
    for (const kw of c.keywords) {
      if (q.includes(kw)) score += kw.length
    }
    if (score > best.score) best = { score, concept: c }
  }

  if (best.score === 0) return REJECT_MSG
  return best.concept.body
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', content: WELCOME },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')

    const userMsg: Message = { id: getNextId(), role: 'user', content: q }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)

    try {
      const history = nextMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { reply } = await res.json()

      setMessages((prev) => [...prev, { id: getNextId(), role: 'assistant', content: reply }])
    } catch {
      const reply = searchLocal(q)
      setMessages((prev) => [...prev, { id: getNextId(), role: 'assistant', content: reply }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([{ id: 0, role: 'assistant', content: WELCOME }])
    setInput('')
  }

  return (
    <>
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Abrir asistente"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="icon">◎</div>
          <div className="info">
            <h2>Asistente IA</h2>
            <p>Wiki · 6 conceptos · Gemini</p>
          </div>
          <div className="actions">
            <button onClick={clearChat} title="Limpiar conversación">
              <Trash2 size={15} />
            </button>
            <button onClick={() => setIsOpen(false)} title="Cerrar">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-body">
          <div className="chatbot-msgs">
            {messages.map((m) => (
              <div key={m.id} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>
                <div className="bubble" style={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg bot">
                <div className="bubble chatbot-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="chatbot-input-area">
            <div className="chips">
              {QUICK_TOPICS.map((t) => (
                <span key={t} className="chip" onClick={() => send(t)}>
                  {t}
                </span>
              ))}
            </div>
            <div className="row">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ej: ¿Qué es la tasa EA?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && send(input)}
                disabled={loading}
              />
              <button onClick={() => send(input)} disabled={loading || !input.trim()}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

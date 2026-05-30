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
  'Anualidades',
  'Inflación',
  'Valor del dinero',
]

const WELCOME = `Hola. Puedo explicarte los conceptos de Ingeniería Económica que están en la Wiki: interés simple y compuesto, tasas nominales y efectivas, amortización, anualidades e inflación.

¿Sobre qué quieres aprender?`

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
      setMessages((prev) => [
        ...prev,
        {
          id: getNextId(),
          role: 'assistant',
          content: 'Error al conectar con el asistente. Verificá tu conexión e intentá de nuevo.',
        },
      ])
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
            <p>Wiki · 9 conceptos · Gemini</p>
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

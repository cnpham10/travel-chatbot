import { FormEvent, useEffect, useRef, useState } from 'react'
import './TravelChatbot.css'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ApiMode = 'demo' | 'openai' | 'unknown'

const SUGGESTIONS = [
  'Find flights to NYC',
  "What's your baggage policy?",
  'How do I change a booking?',
]

type Props = {
  defaultOpen?: boolean
}

/** Chat widget wired to Rocket's Express API (`/api/health`, `/api/chat`). */
export function TravelChatbot({ defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<ApiMode>('unknown')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your flights assistant. Ask about routes, bags, changes, refunds, or booking steps.",
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d: { mode?: string }) => {
        if (d.mode === 'openai' || d.mode === 'demo') setMode(d.mode)
        else setMode('demo')
      })
      .catch(() => setMode('demo'))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, busy])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setBusy(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()

      if (!res.ok) {
        const errMsg =
          typeof data?.error === 'string'
            ? data.error
            : 'Something went wrong talking to the chat API.'
        setMessages((m) => [...m, { role: 'assistant', content: errMsg }])
        return
      }

      if (data.mode === 'openai' || data.mode === 'demo') setMode(data.mode)

      const content =
        data.message?.content ||
        "Sorry — I couldn't answer that just now. Try again in a moment."
      setMessages((m) => [...m, { role: 'assistant', content }])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            "Couldn't reach the chat server. Run `npm run server:dev` (port 3001) and `npm run dev` (Vite on 5173).",
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void send(input)
  }

  const badgeLabel = mode === 'openai' ? 'AI' : mode === 'demo' ? 'Demo' : '…'

  return (
    <div className="tc-root">
      {open && (
        <section className="tc-panel" aria-label="Travel chat">
          <header className="tc-header">
            <div>
              <strong>Flight assistant</strong>
              <span className={`tc-badge tc-badge-${mode}`}>{badgeLabel}</span>
            </div>
            <button
              type="button"
              className="tc-icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="tc-messages">
            {messages.map((m, i) => (
              <div key={i} className={`tc-bubble tc-${m.role}`}>
                {m.content}
              </div>
            ))}
            {busy && <div className="tc-bubble tc-assistant tc-typing">Thinking…</div>}
            <div ref={bottomRef} />
          </div>

          <div className="tc-suggestions">
            {SUGGESTIONS.map((p) => (
              <button key={p} type="button" disabled={busy} onClick={() => void send(p)}>
                {p}
              </button>
            ))}
          </div>

          <form className="tc-composer" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about flights…"
              disabled={busy}
              aria-label="Message"
            />
            <button type="submit" disabled={busy || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="tc-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close flight assistant' : 'Open flight assistant'}
      >
        {open ? '×' : '✈️'}
      </button>
    </div>
  )
}

export default TravelChatbot

import { FormEvent, useEffect, useRef, useState } from 'react'
import './TravelChatbot.css'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Find flights to NYC',
  "What's your baggage policy?",
  'How do I change a booking?',
]

type Props = {
  defaultOpen?: boolean
}

/** Front-end chat shell. API wiring comes after Rocket's backend lands. */
export function TravelChatbot({ defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your flights assistant. UI only for now — Rocket is building the chat API.",
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((m) => [
      ...m,
      { role: 'user', content: trimmed },
      {
        role: 'assistant',
        content:
          'Got it. Replies will come from the API once Rocket’s backend is connected.',
      },
    ])
    setInput('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="tc-root">
      {open && (
        <section className="tc-panel" aria-label="Travel chat">
          <header className="tc-header">
            <div>
              <strong>Flight assistant</strong>
              <span className="tc-badge">UI</span>
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
            <div ref={bottomRef} />
          </div>

          <div className="tc-suggestions">
            {SUGGESTIONS.map((p) => (
              <button key={p} type="button" onClick={() => send(p)}>
                {p}
              </button>
            ))}
          </div>

          <form className="tc-composer" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about flights…"
              aria-label="Message"
            />
            <button type="submit" disabled={!input.trim()}>
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

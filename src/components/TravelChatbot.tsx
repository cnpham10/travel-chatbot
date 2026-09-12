import { FormEvent, useEffect, useRef, useState } from 'react'
import './TravelChatbot.css'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  flights?: FlightResult[]
}

export type FlightResult = {
  id: string
  airline: string
  flightNumber: string
  from: string
  to: string
  departAt: string
  arriveAt: string
  durationMinutes: number
  stops: number
  cabin: 'economy' | 'premium' | 'business' | string
  priceUsd: number
}

type ApiMode = 'demo' | 'openai' | 'unknown'

const FALLBACK_SUGGESTIONS = [
  'Find flights from SFO to JFK',
  "What's your baggage policy?",
  'How do I change a booking?',
]

type Props = {
  defaultOpen?: boolean
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function parseFlights(raw: unknown): FlightResult[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  const out: FlightResult[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const f = item as Record<string, unknown>
    if (typeof f.id !== 'string') continue
    out.push({
      id: f.id,
      airline: String(f.airline ?? ''),
      flightNumber: String(f.flightNumber ?? ''),
      from: String(f.from ?? ''),
      to: String(f.to ?? ''),
      departAt: String(f.departAt ?? ''),
      arriveAt: String(f.arriveAt ?? ''),
      durationMinutes: Number(f.durationMinutes) || 0,
      stops: Number(f.stops) || 0,
      cabin: String(f.cabin ?? 'economy'),
      priceUsd: Number(f.priceUsd) || 0,
    })
  }
  return out.length ? out : undefined
}

function parseSuggestions(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const chips = raw.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
  return chips.length ? chips : undefined
}

function FlightCard({ flight }: { flight: FlightResult }) {
  const stopsLabel =
    flight.stops === 0 ? 'Nonstop' : flight.stops === 1 ? '1 stop' : `${flight.stops} stops`

  return (
    <article className="tc-flight-card">
      <div className="tc-flight-top">
        <div>
          <strong>
            {flight.airline} {flight.flightNumber}
          </strong>
          <span className="tc-flight-cabin">{flight.cabin}</span>
        </div>
        <div className="tc-flight-price">${flight.priceUsd.toFixed(0)}</div>
      </div>
      <div className="tc-flight-route">
        <span>{flight.from}</span>
        <span className="tc-flight-arrow" aria-hidden>
          →
        </span>
        <span>{flight.to}</span>
      </div>
      <div className="tc-flight-meta">
        <span>{formatTime(flight.departAt)}</span>
        <span>·</span>
        <span>{formatTime(flight.arriveAt)}</span>
        <span>·</span>
        <span>{formatDuration(flight.durationMinutes)}</span>
        <span>·</span>
        <span>{stopsLabel}</span>
      </div>
    </article>
  )
}

/** Chat widget wired to Cody's Express API (`/api/health`, `/api/chat`). */
export function TravelChatbot({ defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<ApiMode>('unknown')
  const [chipSuggestions, setChipSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your flights assistant. Ask about routes, bags, changes, refunds, or booking steps.",
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
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
      const flights = parseFlights(data.flights)
      const suggestions = parseSuggestions(data.suggestions)
      if (suggestions) setChipSuggestions(suggestions)

      setMessages((m) => [...m, { role: 'assistant', content, flights }])
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
              <div key={i} className={`tc-msg-block tc-${m.role}`}>
                <div className={`tc-bubble tc-${m.role}`}>{m.content}</div>
                {m.flights && m.flights.length > 0 && (
                  <div className="tc-flights" aria-label="Flight results">
                    {m.flights.map((f) => (
                      <FlightCard key={f.id} flight={f} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="tc-bubble tc-assistant tc-typing">Thinking…</div>}
            <div ref={bottomRef} />
          </div>

          <div className="tc-suggestions">
            {chipSuggestions.map((p) => (
              <button key={p} type="button" disabled={busy} onClick={() => void send(p)}>
                {p}
              </button>
            ))}
          </div>

          <form className="tc-composer" onSubmit={onSubmit}>
            <input
              ref={inputRef}
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

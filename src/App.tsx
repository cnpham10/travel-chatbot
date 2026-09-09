import TravelChatbot from './components/TravelChatbot'
import './App.css'

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Flights-only OTA</p>
        <h1>Travel chatbot</h1>
        <p className="lede">
          Chat widget talks to Rocket&apos;s API on port 3001 (proxied via Vite).
        </p>
      </header>
      <main className="card">
        <h2>This commit</h2>
        <ul>
          <li>Wire composer to <code>POST /api/chat</code></li>
          <li>Mode badge from <code>GET /api/health</code></li>
          <li>Vite proxy <code>/api</code> → <code>localhost:3001</code></li>
        </ul>
      </main>
      <TravelChatbot defaultOpen />
    </div>
  )
}

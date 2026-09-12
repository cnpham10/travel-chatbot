import TravelChatbot from './components/TravelChatbot'
import './App.css'

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Flights-only OTA</p>
        <h1>Travel chatbot</h1>
        <p className="lede">
          Floating flight assistant wired to Cody&apos;s API on port 3001 (Vite proxies{' '}
          <code>/api</code>).
        </p>
      </header>

      <main className="card">
        <h2>Try it</h2>
        <p>
          Open the plane button (bottom-right). Demo mode works without a key; set{' '}
          <code>OPENAI_API_KEY</code> in <code>server/.env</code> for live AI.
        </p>
        <ul>
          <li>
            Front end: <code>npm run dev</code> → port 5173
          </li>
          <li>
            Back end: <code>npm run server:dev</code> → port 3001
          </li>
          <li>
            Embed tips: see <strong>Embed the widget</strong> in the README
          </li>
        </ul>
      </main>

      <TravelChatbot defaultOpen />
    </div>
  )
}

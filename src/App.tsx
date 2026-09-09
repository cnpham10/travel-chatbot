import TravelChatbot from './components/TravelChatbot'
import './App.css'

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Flights-only OTA</p>
        <h1>Travel chatbot</h1>
        <p className="lede">
          Front-end chat widget is live. Backend replies come next from Rocket.
        </p>
      </header>
      <main className="card">
        <h2>This commit</h2>
        <ul>
          <li>Floating chat button + panel</li>
          <li>Message list, suggestions, composer</li>
          <li>Local UI-only replies (no API yet)</li>
        </ul>
      </main>
      <TravelChatbot defaultOpen />
    </div>
  )
}

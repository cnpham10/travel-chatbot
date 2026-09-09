import './App.css'

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Flights-only OTA</p>
        <h1>Travel chatbot</h1>
        <p className="lede">
          Front-end shell for the in-site flight assistant. Chat UI lands next.
        </p>
      </header>
      <main className="card">
        <h2>Coming next</h2>
        <ul>
          <li>Floating chat panel</li>
          <li>Message list + composer</li>
          <li>Hook up to Rocket&apos;s API</li>
        </ul>
      </main>
    </div>
  )
}

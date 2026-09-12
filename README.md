# travel-chatbot

AI travel chatbot for the flights-only OTA (US domestic-first).

- **Front end:** Gizmo (this workstream)
- **Back end:** Rocket

Small commits, block by block.

## Status

- [x] Vite + React + TypeScript scaffold + demo page shell
- [x] Chat widget UI
- [x] Wire UI to Rocket's chat API
- [ ] Polish / embed docs
- [x] Express chat API scaffold (`server/`)
- [x] `GET /api/health` + `POST /api/chat` (demo + OpenAI)
- [x] Additive `flights` + `suggestions` on `POST /api/chat` (demo + OpenAI)
- [x] `GET /api/airports?q=` static US airport search

## Run (front end)

```bash
npm install
npm run dev
```

Vite runs on port **5173** and proxies `/api` → `http://localhost:3001`.

## Backend

Express API under `server/` (port **3001**).

### Setup

```bash
cd server && npm install
cp .env.example .env   # optional: set OPENAI_API_KEY for OpenAI mode
```

From the repo root (after installing server deps):

```bash
npm run server:dev   # node --watch
npm run server       # production start
```

Or from `server/`:

```bash
npm run dev
npm start
```

### Environment

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server listen port |
| `OPENAI_API_KEY` | _(empty)_ | If set, chat uses OpenAI; otherwise demo mode |
| `OPENAI_MODEL` | `gpt-4o-mini` | Chat completions model |
| `CORS_ORIGIN` | _(unset)_ | If set, used as the single allowed CORS origin; otherwise localhost / 127.0.0.1 any port |

### API contract

#### `GET /api/health`

**Response**

```json
{ "ok": true, "mode": "demo" }
```

or

```json
{ "ok": true, "mode": "openai" }
```

`mode` reflects whether `OPENAI_API_KEY` is set (`openai`) or not (`demo`).

#### `GET /api/airports?q=`

Static US airport list filtered by IATA code, city, or name. Returns at most **8** matches.

**Response**

```json
{
  "airports": [
    { "code": "SFO", "city": "San Francisco", "name": "San Francisco International Airport" }
  ]
}
```

Omit or empty `q` to get the first 8 airports from the static list.

#### `POST /api/chat`

**Request**

```json
{
  "messages": [
    { "role": "user", "content": "Find flights from SFO to JFK next Friday" }
  ]
}
```

- `messages`: array of `{ role: "user" | "assistant", content: string }` (required, min 1)
- No `system` role in the request body; no `conversationId`

**Response (success)** — existing fields always present; `flights` / `suggestions` are additive

```json
{
  "mode": "demo",
  "message": { "role": "assistant", "content": "..." },
  "suggestions": ["SFO → JFK next Friday", "Round-trip SFO–JFK", "Cheapest nonstop"],
  "flights": [
    {
      "id": "ua-415-sfo-jfk",
      "airline": "United",
      "flightNumber": "UA415",
      "from": "SFO",
      "to": "JFK",
      "departAt": "2026-09-18T08:15:00-07:00",
      "arriveAt": "2026-09-18T16:45:00-04:00",
      "durationMinutes": 330,
      "stops": 0,
      "cabin": "economy",
      "priceUsd": 289
    }
  ]
}
```

or

```json
{
  "mode": "openai",
  "message": { "role": "assistant", "content": "..." },
  "suggestions": ["SFO → JFK next Friday", "Round-trip LAX–ORD", "Cheapest nonstop"]
}
```

- **Existing (required):** `mode` (`"demo"` | `"openai"`), `message: { role: "assistant", content }`
- **Optional:** `warning` (string) — e.g. when OpenAI fails and demo reply is returned
- **Additive optional:**
  - `flights` — array of flight cards; **omit** when the user is not searching a from→to route (or no mock matches). Each item: `id`, `airline`, `flightNumber`, `from`, `to`, `departAt`, `arriveAt`, `durationMinutes`, `stops`, `cabin` (`economy` | `premium` | `business`), `priceUsd`
  - `suggestions` — 2–4 chip strings for the FE (always preferred when possible)
- Demo mode when no `OPENAI_API_KEY` (or when OpenAI fails — may also include optional `warning`)
- OpenAI mode when key is set and the call succeeds; structured `flights` / `suggestions` are still attached from local intent parsing (no tool-calling in v1)
- Flights-only OTA tone; US domestic-first
- FE (Gizmo): render flight cards + suggestion chips when these fields appear; ignore them safely if absent

**Response (validation error)** — HTTP 400

```json
{ "error": "..." }
```

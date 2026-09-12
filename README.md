# travel-chatbot

AI travel chatbot for the flights-only OTA (US domestic-first).

- **Front end:** Gizmo (this workstream)
- **Back end:** Cody

Small commits, block by block.

## Status

- [x] Vite + React + TypeScript scaffold + demo page shell
- [x] Chat widget UI
- [x] Wire UI to Cody's chat API
- [x] Polish / embed docs
- [x] Express chat API scaffold (`server/`)
- [x] `GET /api/health` + `POST /api/chat` (demo + OpenAI)

## Run (front end)

```bash
npm install
npm run dev
```

Vite runs on port **5173** and proxies `/api` → `http://localhost:3001`.

## Embed the widget

Drop the floating assistant into another React app from this repo:

```tsx
import TravelChatbot from './components/TravelChatbot'
import './components/TravelChatbot.css'

export function Layout() {
  return (
    <>
      {/* your page */}
      <TravelChatbot defaultOpen={false} />
    </>
  )
}
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultOpen` | `boolean` | `false` | Open the panel on first render |

### API routing

The widget calls `GET /api/health` and `POST /api/chat` on the **same origin** as the page.

- **This Vite demo:** already proxies `/api` → `http://localhost:3001` (see `vite.config.ts`).
- **Another host app:** proxy `/api` to Cody's Express server, or point a reverse proxy at port **3001**.

Also import `TravelChatbot.css` (or copy its styles) so the FAB + panel look correct.

Keyboard: **Escape** closes the panel; focus moves to the composer when it opens.

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

**Response (success)**

```json
{
  "mode": "demo",
  "message": { "role": "assistant", "content": "..." }
}
```
or

```json
{
  "mode": "openai",
  "message": { "role": "assistant", "content": "..." }
}
```

- Demo mode when no `OPENAI_API_KEY` (or when OpenAI fails — may also include optional `warning`)
- OpenAI mode when key is set and the call succeeds
- Flights-only OTA tone; US domestic-first

**Response (validation error)** — HTTP 400

```json
{ "error": "..." }
```

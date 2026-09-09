# travel-chatbot

AI travel chatbot for the flights-only OTA (US domestic-first).

- **Front end:** Gizmo (this workstream)
- **Back end:** Rocket

Small commits, block by block.

## Status

- [x] Vite + React + TypeScript scaffold + demo page shell
- [x] Chat widget UI
- [ ] Wire UI to Rocket's chat API
- [ ] Polish / embed docs
- [x] Express chat API scaffold (`server/`)
- [x] `GET /api/health` + `POST /api/chat` (demo + OpenAI)

## Run (front end)

```bash
npm install
npm run dev
```

Vite runs on port **5173** and should proxy `/api` → `http://localhost:3001`.

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

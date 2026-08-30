# MediCare AI — FE-06 Streaming Chat

A focused Frontend AI Engineering FE-06 implementation: a responsive health-guidance chat interface with real server-side AI streaming.

## What FE-06 demonstrates

- Real token-by-token streaming from Gemini through a server endpoint
- Thinking → streaming handoff
- Stop generation with `AbortController`
- Partial assistant responses remain usable after stopping
- Multi-turn conversation state
- Local persistence across refreshes
- Auto-scroll while the reader is at the bottom
- Scroll-up releases the pin and exposes **Jump to latest**
- Mobile-friendly input and message layout
- Server-only API key
- Centralized system prompt/model configuration in `server.cjs`
- Accessible labels, focus states, live announcements, and reduced-motion support

## Architecture

```text
Browser
  │
  │ POST /api/chat
  ▼
Express server
  │
  │ Gemini streamGenerateContent (SSE)
  ▼
Google Gemini
  │
  │ streamed chunks
  ▼
Express SSE
  │
  ▼
Chat UI updates assistant message incrementally
```

The browser never receives `GEMINI_API_KEY`.

## Setup

Requirements: Node.js 18+.

```bash
npm install
```

Create `.env` from `.env.example`:

```env
PORT=3000
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Then:

```bash
npm run build
npm run dev
```

Open `http://localhost:3000`.

For a development stylesheet watcher, use a second terminal:

```bash
npm run watch
```

## Verification checklist

1. Send a normal question and confirm the assistant visibly grows while generating.
2. Send a second question to confirm multi-turn state.
3. While a long response is streaming, click **Stop**. The partial response should remain and the input should become usable again.
4. Scroll upward while a response streams. Auto-scroll should stop; **Jump to latest** should appear.
5. Use the interface at phone width.
6. Refresh the page and confirm the conversation persists.
7. Inspect browser source/network: no Gemini API key should be present.

## Environment/security

`.env` is ignored by Git. Commit only `.env.example`. Never put an API key in `index.html`, `js/app.js`, or any client bundle.

## Known limitations

This is an FE-06 streaming demonstration, not the final MediCare AI capstone. Conversation persistence is local to the browser. There is no authentication or database. Health content is educational and the assistant is explicitly instructed not to diagnose or prescribe.

## FE-06 deliverable links

After deployment, submit:
- Preview URL
- Repository URL
- Server route: `POST /api/chat` in `server.cjs`
- Chat component: `index.html` + `js/app.js`

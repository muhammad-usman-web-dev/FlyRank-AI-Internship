const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const SYSTEM_PROMPT = `
You are MediCare AI's educational health guidance assistant.
Provide general educational information only. Do not diagnose conditions, prescribe medication,
pretend to be a doctor, or claim certainty. For potentially urgent symptoms, clearly encourage
the user to contact local emergency services or a qualified healthcare professional.
Be concise, calm, uncertainty-aware, and useful. This is a prototype and not a substitute for care.
`;

function startServer(port = PORT) {
  const server = app.listen(port, () => {
    console.log(`MediCare AI FE-06 running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on ${nextPort}.`);
      startServer(nextPort);
      return;
    }

    console.error("Failed to start the server:", error);
    process.exit(1);
  });

  return server;
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "MediCare AI streaming chat", aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const cleaned = messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content.slice(0, 4000) }] }));

  if (!cleaned.length || !cleaned.some(m => m.role === "user")) {
    return res.status(400).json({ error: "Please provide a message." });
  }
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "mock-api-key-for-testing") {
    return res.status(503).json({ error: "AI service is not configured. Add GEMINI_API_KEY to .env." });
  }

  const controller = new AbortController();
  let timedOut = false;
  req.on("aborted", () => controller.abort());
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 30000);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: cleaned,
    generationConfig: { temperature: 0.3, maxOutputTokens: 700 }
  });

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal
    });

    if (!upstream.ok) {
      let detail = "The AI service could not complete the request.";
      try {
        const err = await upstream.json();
        detail = err?.error?.message || detail;
      } catch {}
      return res.status(upstream.status === 429 ? 429 : 502).json({ error: detail });
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const json = JSON.parse(raw);
          const text = json?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
        } catch {}
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    if (error.name === "AbortError" && !timedOut) return;
    if (timedOut && !res.headersSent) return res.status(504).json({ error: "The AI service took too long to respond. Check your Gemini API key and network connection." });
    if (!res.headersSent) res.status(502).json({ error: "The AI connection failed. Please try again." });
    else res.end();
  } finally {
    clearTimeout(timeout);
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

if (require.main === module) startServer(PORT);

app.app = app;
app.startServer = startServer;
app.SYSTEM_PROMPT = SYSTEM_PROMPT;

module.exports = app;

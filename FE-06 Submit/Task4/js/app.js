const STORAGE_KEY = "medicare-fe06-messages";
const chatBox = document.querySelector("#chatBox");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const stopButton = document.querySelector("#stopButton");
const clearButton = document.querySelector("#clearChatButton");
const liveRegion = document.querySelector("#liveRegion");
const statusText = document.querySelector("#statusText");
const jumpButton = document.querySelector("#jumpButton");
const errorBox = document.querySelector("#errorBox");
const errorText = document.querySelector("#errorText");
const retryButton = document.querySelector("#retryButton");

let messages = loadMessages();
let controller = null;
let isStreaming = false;
let userIsNearBottom = true;
let lastFailedText = "";

function loadMessages() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") : [];
  } catch { return []; }
}
function saveMessages() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {} }
function time() { return new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}); }
function atBottom() { return chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 80; }
function scrollLatest(smooth = true) { chatBox.scrollTo({top: chatBox.scrollHeight, behavior: smooth ? "smooth" : "auto"}); userIsNearBottom = true; jumpButton.classList.add("hidden"); }
function escapeText(text) { return text; }

function render() {
  chatBox.innerHTML = "";
  messages.forEach((m, i) => {
    const wrap = document.createElement("div");
    wrap.className = `message-enter flex ${m.role === "user" ? "justify-end" : "justify-start"}`;
    wrap.dataset.index = i;
    const bubble = document.createElement("div");
    bubble.className = `max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${m.role === "user" ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-received text-ink"}`;
    
    const meta = document.createElement("span");
    meta.className = `mt-1 block text-[11px] ${m.role === "user" ? "text-white/70" : "text-ink-muted"}`;
    meta.textContent = `${m.role === "user" ? "You" : "MediCare AI"} · ${m.time || ""}`;

    if (m.role === "assistant" && !m.content) {
      const dots = document.createElement("div");
      dots.className = "dots-indicator flex items-center gap-1.5 py-1.5 px-0.5";
      for (let d = 0; d < 3; d++) {
        const dot = document.createElement("span");
        dot.className = "h-1.5 w-1.5 rounded-full bg-ink-muted/60 typing-dot";
        dots.appendChild(dot);
      }
      bubble.append(dots, meta);
    } else {
      const text = document.createElement("p");
      text.className = "whitespace-pre-wrap break-words";
      text.textContent = escapeText(m.content);
      bubble.append(text, meta);
    }

    wrap.appendChild(bubble); chatBox.appendChild(wrap);
  });
  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "flex h-full items-center justify-center text-center text-sm text-ink-muted";
    empty.textContent = "Ask an educational health question to begin.";
    chatBox.appendChild(empty);
  }
  scrollLatest(false);
}
function updateControls() {
  const hasText = input.value.trim().length > 0;
  sendButton.disabled = !hasText || isStreaming;
  stopButton.classList.toggle("hidden", !isStreaming);
  sendButton.classList.toggle("hidden", isStreaming);
  input.disabled = isStreaming;
  statusText.lastChild.textContent = isStreaming ? " Generating…" : " Ready";
}
function showError(message) { errorText.textContent = message; errorBox.classList.remove("hidden"); }
function hideError() { errorBox.classList.add("hidden"); }
function updateStreamingBubble(index) {
  const wrap = chatBox.querySelector(`[data-index="${index}"]`);
  let p = wrap?.querySelector("p");
  const dots = wrap?.querySelector(".dots-indicator");
  if (dots) {
    dots.remove();
    const bubble = wrap?.querySelector("div");
    if (bubble) {
      p = document.createElement("p");
      p.className = "whitespace-pre-wrap break-words";
      bubble.insertBefore(p, bubble.lastChild);
    }
  }
  if (p) p.textContent = messages[index].content;
  if (userIsNearBottom) scrollLatest(false);
}
async function streamResponse() {
  const text = input.value.trim();
  if (!text || isStreaming) return;
  hideError(); lastFailedText = text;
  messages.push({role:"user", content:text, time:time()});
  const assistantIndex = messages.push({role:"assistant", content:"", time:time()}) - 1;
  saveMessages(); render(); input.value = ""; updateControls();
  isStreaming = true; controller = new AbortController(); updateControls();
  statusText.lastChild.textContent = " Thinking…";
  liveRegion.textContent = "Assistant is thinking.";

  try {
    const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const apiEndpoint = isLocalDev && window.location.port !== "3000"
      ? "http://localhost:3000/api/chat"
      : "/api/chat";

    const response = await fetch(apiEndpoint, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({messages: messages.slice(0, -1)}),
      signal: controller.signal
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "The AI service is temporarily unavailable.");
    }
    if (!response.body) throw new Error("Streaming is not supported by this connection.");
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = "", firstToken = true;
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {stream:true});
      const chunks = buffer.split(/\r?\n\r?\n/); buffer = chunks.pop() || "";
      for (const chunk of chunks) {
        const line = chunk.split(/\r?\n/).find(x => x.startsWith("data:"));
        if (!line) continue;
        const raw = line.slice(5).trim();
        if (raw === "[DONE]") continue;
        try {
          const payload = JSON.parse(raw);
          if (payload.text) {
            if (firstToken) { firstToken = false; statusText.lastChild.textContent = " Streaming…"; liveRegion.textContent = "Assistant response started."; }
            messages[assistantIndex].content += payload.text;
            updateStreamingBubble(assistantIndex);
          }
        } catch {}
      }
    }
    saveMessages();
    liveRegion.textContent = "Assistant response complete.";
  } catch (error) {
    if (error.name === "AbortError") {
      if (!messages[assistantIndex].content) messages.splice(assistantIndex, 1);
      else saveMessages();
      liveRegion.textContent = "Generation stopped. The partial response was kept.";
    } else {
      if (!messages[assistantIndex].content) messages.splice(assistantIndex, 1);
      saveMessages(); render(); showError(error.message);
      liveRegion.textContent = "Assistant request failed.";
    }
  } finally {
    isStreaming = false; controller = null; updateControls(); input.focus();
  }
}
function stopGeneration() { if (controller) controller.abort(); }
function clearChat() {
  if (!confirm("Clear the entire conversation?")) return;
  if (controller) controller.abort();
  messages = []; saveMessages(); hideError(); render(); input.focus();
}
form.addEventListener("submit", e => { e.preventDefault(); streamResponse(); });
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
});
input.addEventListener("input", updateControls);
stopButton.addEventListener("click", stopGeneration);
clearButton.addEventListener("click", clearChat);
retryButton.addEventListener("click", () => { hideError(); input.value = lastFailedText; input.focus(); updateControls(); });
chatBox.addEventListener("scroll", () => {
  userIsNearBottom = atBottom();
  jumpButton.classList.toggle("hidden", userIsNearBottom);
});
jumpButton.addEventListener("click", () => scrollLatest(true));

render(); updateControls(); input.focus();

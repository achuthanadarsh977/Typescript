import express from "express";
import cors from "cors";
import path from "path";
import { streamChat, clearSession } from "./chatbot";
import { randomUUID } from "crypto";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());
// __dirname is dist/ at runtime — public/ sits one level up at project root
const PUBLIC_DIR = path.join(__dirname, "..", "public");

app.use(express.static(PUBLIC_DIR));

app.get("/", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Streaming chat endpoint using SSE
app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body as {
    message?: string;
    sessionId?: string;
  };

  if (!message?.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const sid = sessionId ?? randomUUID();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Session-Id", sid);
  res.flushHeaders();

  try {
    for await (const chunk of streamChat(sid, message)) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true, sessionId: sid })}\n\n`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
  } finally {
    res.end();
  }
});

// Clear conversation session
app.delete("/session/:id", (req, res) => {
  clearSession(req.params.id);
  res.json({ cleared: true });
});

app.listen(PORT, () => {
  console.log(`\n📦 Shipment Tracker Chatbot running at http://localhost:${PORT}`);
  console.log(`🤖 Using Ollama model: ${process.env.OLLAMA_MODEL ?? "llama3.2"}`);
  console.log(`\nTracking numbers to try:`);
  console.log(`  TRK123456789IN  — In Transit (Blue Dart)`);
  console.log(`  TRK987654321IN  — Delivered (Delhivery)`);
  console.log(`  TRK456789123IN  — Customs Hold (FedEx)`);
  console.log(`  TRK741852963IN  — Out for Delivery (Shadowfax)`);
  console.log(`  TRK369258147IN  — Delayed (Ecom Express)\n`);
});

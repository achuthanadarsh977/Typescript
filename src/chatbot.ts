import ollama, { Message } from "ollama";
import {
  detectIntent,
  answerPhone,
  answerCount,
  answerStats,
  answerList,
  buildLlmContext,
} from "./rag";

// Use the smallest/fastest available model for LLM fallback
const MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:1b";

const SYSTEM_PROMPT = `You are a Gujarat logistics assistant. Answer questions about transport and logistics companies concisely.
The database has 8,677 companies with fields: Company Name, Phone, City, Service Type, Address, Coverage.
Be brief and direct. No unnecessary preamble.`;

const sessions = new Map<string, Message[]>();

export async function* streamChat(
  sessionId: string,
  userMessage: string
): AsyncGenerator<string> {

  const intent = detectIntent(userMessage);

  // ── Fast path: answer directly without LLM ────────────────────────────────
  if (intent.kind !== "llm") {
    let answer = "";

    switch (intent.kind) {
      case "phone":
        answer = answerPhone(intent.phone);
        break;
      case "count":
        answer = answerCount(intent.city);
        break;
      case "stats":
        answer = answerStats();
        break;
      case "list":
        answer = answerList(intent.city, intent.service, intent.coverage, intent.limit);
        break;
    }

    // Stream direct answer in larger chunks — no artificial delay
    const chunkSize = 200;
    for (let i = 0; i < answer.length; i += chunkSize) {
      yield answer.slice(i, i + chunkSize);
    }
    return;
  }

  // ── LLM path: conversational / complex questions ──────────────────────────
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const history = sessions.get(sessionId)!;

  const context = buildLlmContext(userMessage);

  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-4),
    {
      role: "user",
      content: `[DATA]\n${context}\n\n[QUESTION]\n${userMessage}`,
    },
  ];

  const stream = await ollama.chat({
    model: MODEL,
    messages,
    stream: true,
    options: { num_predict: 300 }, // cap output tokens for speed
  });

  let fullReply = "";
  for await (const chunk of stream) {
    const delta = chunk.message.content;
    if (delta) {
      fullReply += delta;
      yield delta;
    }
  }

  history.push({ role: "user",      content: userMessage });
  history.push({ role: "assistant", content: fullReply });
  if (history.length > 8) history.splice(0, 2);
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

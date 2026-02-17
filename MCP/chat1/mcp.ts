import { useState, useRef, useEffect } from "react";

// ─── Mock MCP Server Tools ────────────────────────────────────────────────────
const MCP_TOOLS = [
  {
    name: "calculator",
    description: "Perform arithmetic calculations. Supports add, subtract, multiply, divide.",
    input_schema: {
      type: "object",
      properties: {
        operation: { type: "string", enum: ["add", "subtract", "multiply", "divide"] },
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" },
      },
      required: ["operation", "a", "b"],
    },
  },
  {
    name: "get_weather",
    description: "Get current weather for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name" },
      },
      required: ["city"],
    },
  },
  {
    name: "notes",
    description: "Save or retrieve a text note by key.",
    input_schema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["save", "get", "list"] },
        key: { type: "string", description: "Note key (required for save/get)" },
        content: { type: "string", description: "Note content (required for save)" },
      },
      required: ["action"],
    },
  },
];

// ─── Mock MCP Server Executor ─────────────────────────────────────────────────
const notesStore = {};
function executeTool(name, args) {
  if (name === "calculator") {
    const { operation, a, b } = args;
    let result;
    if (operation === "add") result = a + b;
    else if (operation === "subtract") result = a - b;
    else if (operation === "multiply") result = a * b;
    else if (operation === "divide") result = b !== 0 ? a / b : "Error: division by zero";
    return { result, expression: `${a} ${operation} ${b} = ${result}` };
  }
  if (name === "get_weather") {
    const forecasts = {
      london: { temp: "12°C", condition: "Overcast", humidity: "78%" },
      tokyo: { temp: "22°C", condition: "Sunny", humidity: "55%" },
      "new york": { temp: "18°C", condition: "Partly cloudy", humidity: "62%" },
      paris: { temp: "15°C", condition: "Light rain", humidity: "80%" },
      sydney: { temp: "25°C", condition: "Clear sky", humidity: "48%" },
    };
    const key = args.city.toLowerCase();
    const data = forecasts[key] || { temp: "20°C", condition: "Unknown", humidity: "60%" };
    return { city: args.city, ...data };
  }
  if (name === "notes") {
    if (args.action === "save") {
      notesStore[args.key] = args.content;
      return { success: true, message: `Note "${args.key}" saved.` };
    }
    if (args.action === "get") {
      return { key: args.key, content: notesStore[args.key] || null };
    }
    if (args.action === "list") {
      return { keys: Object.keys(notesStore) };
    }
  }
  return { error: "Unknown tool" };
}

// ─── Protocol Log Entry ───────────────────────────────────────────────────────
function ProtocolEntry({ entry, index }) {
  const [open, setOpen] = useState(false);
  const colors = {
    client: { bg: "#0f1f3a", border: "#1e4080", badge: "#2563eb", label: "CLIENT → SERVER" },
    server: { bg: "#0f2a1a", border: "#1a5c2a", badge: "#16a34a", label: "SERVER → CLIENT" },
    claude: { bg: "#2a1040", border: "#5c1a80", badge: "#9333ea", label: "CLAUDE API" },
    tool: { bg: "#2a1f00", border: "#805c00", badge: "#d97706", label: "TOOL EXEC" },
    result: { bg: "#2a0f1a", border: "#80162a", badge: "#e11d48", label: "FINAL RESULT" },
  };
  const c = colors[entry.type] || colors.client;

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "8px",
        marginBottom: "8px",
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        animation: `fadeSlideIn 0.3s ease ${index * 0.05}s both`,
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            background: c.badge,
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "4px",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          {c.label}
        </span>
        <span style={{ color: "#cbd5e1", fontSize: "12px", flex: 1 }}>{entry.summary}</span>
        <span style={{ color: "#64748b", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div
          style={{
            borderTop: `1px solid ${c.border}`,
            padding: "12px 14px",
            fontSize: "11px",
            color: "#94a3b8",
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(entry.payload, null, 2)}
        </div>
      )}
    </div>
  );
}

// ─── Tool Pill ────────────────────────────────────────────────────────────────
function ToolPill({ tool }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "6px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "rgba(37,99,235,0.12)",
          border: "1px solid rgba(37,99,235,0.3)",
          borderRadius: "6px",
          color: "#93c5fd",
          fontSize: "12px",
          padding: "4px 10px",
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ color: "#60a5fa" }}>⚙</span>
        {tool.name}
        <span style={{ opacity: 0.6, fontSize: "10px" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          style={{
            marginTop: "4px",
            marginLeft: "12px",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: "6px",
            padding: "8px 10px",
            fontSize: "11px",
            color: "#64748b",
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          {tool.description}
          {"\n\nParams: "}
          {Object.keys(tool.input_schema.properties || {}).join(", ")}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MCPClientSimulator() {
  const [messages, setMessages] = useState([]);
  const [log, setLog] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | discovering | calling | executing | responding
  const logRef = useRef(null);
  const inputRef = useRef(null);

  const addLog = (entry) => setLog((prev) => [...prev, entry]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const SUGGESTED = [
    "What is 1337 × 42?",
    "What's the weather in Tokyo?",
    "Save a note called 'idea' with content 'Build MCP server next'",
    "What's 100 divided by 4, and what's the weather in Paris?",
    "List my notes",
  ];

  async function sendMessage(userText) {
    if (!userText.trim() || loading) return;
    setLoading(true);
    setLog([]);

    const userMsg = { role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Step 1: MCP handshake — list tools
    setPhase("discovering");
    addLog({
      type: "client",
      summary: "initialize + tools/list request",
      payload: {
        jsonrpc: "2.0",
        method: "tools/list",
        id: 1,
        params: {},
      },
    });

    await delay(400);

    addLog({
      type: "server",
      summary: `tools/list response — ${MCP_TOOLS.length} tools available`,
      payload: {
        jsonrpc: "2.0",
        id: 1,
        result: { tools: MCP_TOOLS },
      },
    });

    await delay(300);

    // Step 2: Send to Claude with tools
    setPhase("calling");
    addLog({
      type: "claude",
      summary: "POST /v1/messages — sending tools + conversation to Claude",
      payload: {
        model: "claude-sonnet-4-20250514",
        tools: MCP_TOOLS,
        messages: newMessages,
        max_tokens: 1000,
      },
    });

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: MCP_TOOLS,
          messages: newMessages,
        }),
      });

      const data = await response.json();

      addLog({
        type: "claude",
        summary: `Claude responded — stop_reason: ${data.stop_reason}`,
        payload: data,
      });

      // Step 3: Tool use loop
      let currentMessages = [...newMessages];
      let currentData = data;

      while (currentData.stop_reason === "tool_use") {
        const toolUseBlocks = currentData.content.filter((b) => b.type === "tool_use");
        const assistantMsg = { role: "assistant", content: currentData.content };
        currentMessages = [...currentMessages, assistantMsg];

        const toolResults = [];

        for (const toolUse of toolUseBlocks) {
          setPhase("executing");
          addLog({
            type: "client",
            summary: `tools/call → ${toolUse.name}`,
            payload: {
              jsonrpc: "2.0",
              method: "tools/call",
              id: toolUse.id,
              params: { name: toolUse.name, arguments: toolUse.input },
            },
          });

          await delay(350);

          const toolResult = executeTool(toolUse.name, toolUse.input);

          addLog({
            type: "tool",
            summary: `${toolUse.name} executed → ${JSON.stringify(toolResult).slice(0, 60)}…`,
            payload: toolResult,
          });

          addLog({
            type: "server",
            summary: `tools/call result for ${toolUse.name}`,
            payload: {
              jsonrpc: "2.0",
              id: toolUse.id,
              result: { content: [{ type: "text", text: JSON.stringify(toolResult) }] },
            },
          });

          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(toolResult),
          });

          await delay(200);
        }

        // Send results back to Claude
        setPhase("calling");
        const userToolResultMsg = { role: "user", content: toolResults };
        currentMessages = [...currentMessages, userToolResultMsg];

        addLog({
          type: "claude",
          summary: "POST /v1/messages — sending tool results back to Claude",
          payload: {
            model: "claude-sonnet-4-20250514",
            messages: currentMessages,
            max_tokens: 1000,
          },
        });

        const nextResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            tools: MCP_TOOLS,
            messages: currentMessages,
          }),
        });

        currentData = await nextResponse.json();

        addLog({
          type: "claude",
          summary: `Claude responded — stop_reason: ${currentData.stop_reason}`,
          payload: currentData,
        });
      }

      // Final text response
      setPhase("responding");
      const finalText = currentData.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      addLog({
        type: "result",
        summary: `Final answer delivered to user`,
        payload: { text: finalText },
      });

      const finalAssistantMsg = { role: "assistant", content: finalText };
      setMessages([...currentMessages, finalAssistantMsg]);
    } catch (err) {
      addLog({
        type: "result",
        summary: `Error: ${err.message}`,
        payload: { error: err.message },
      });
    }

    setPhase("idle");
    setLoading(false);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const phaseLabel = {
    idle: null,
    discovering: "🔍 Discovering tools from MCP server…",
    calling: "🤖 Calling Claude API with tools…",
    executing: "⚙️ Executing tool on MCP server…",
    responding: "✅ Delivering final response…",
  };

  const chatMessages = messages.filter(
    (m) => m.role === "user" || (m.role === "assistant" && typeof m.content === "string")
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c14",
        color: "#e2e8f0",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e3a5f",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(0,0,0,0.3)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          ⬡
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", letterSpacing: "0.05em" }}>
            MCP CLIENT SIMULATOR
          </div>
          <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.08em" }}>
            MODEL CONTEXT PROTOCOL · LIVE PROTOCOL INSPECTOR
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              background: "#22c55e",
              borderRadius: "50%",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: "11px", color: "#22c55e" }}>SERVER CONNECTED</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 64px)" }}>

        {/* Left: Chat + Input */}
        <div
          style={{
            width: "42%",
            borderRight: "1px solid #1e3a5f",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Tools panel */}
          <div
            style={{
              borderBottom: "1px solid #1e3a5f",
              padding: "12px 16px",
              background: "rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.1em", marginBottom: "8px" }}>
              AVAILABLE MCP TOOLS
            </div>
            {MCP_TOOLS.map((t) => (
              <ToolPill key={t.name} tool={t} />
            ))}
          </div>

          {/* Chat messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {chatMessages.length === 0 && (
              <div style={{ color: "#334155", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px", opacity: 0.4 }}>⬡</div>
                Send a message to see the MCP protocol in action.
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        background: "rgba(37,99,235,0.08)",
                        border: "1px solid rgba(37,99,235,0.2)",
                        borderRadius: "6px",
                        color: "#64748b",
                        fontSize: "11px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  gap: "8px",
                  animation: "fadeSlideIn 0.25s ease both",
                }}
              >
                <div
                  style={{
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                        : "rgba(255,255,255,0.05)",
                    border: m.role === "assistant" ? "1px solid #1e3a5f" : "none",
                    borderRadius: m.role === "user" ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                    padding: "10px 14px",
                    maxWidth: "85%",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    color: m.role === "user" ? "#fff" : "#cbd5e1",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #1e3a5f",
                    borderTopColor: "#2563eb",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: "11px", color: "#475569", animation: "pulse 1.5s infinite" }}>
                  {phaseLabel[phase]}
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid #1e3a5f",
              padding: "12px 16px",
              display: "flex",
              gap: "8px",
              background: "rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask something that needs a tool…"
              disabled={loading}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid #1e3a5f",
                borderRadius: "8px",
                color: "#e2e8f0",
                padding: "10px 14px",
                fontSize: "12px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? "#1e293b" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                border: "none",
                borderRadius: "8px",
                color: loading || !input.trim() ? "#475569" : "#fff",
                padding: "10px 16px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              ↑
            </button>
          </div>
        </div>

        {/* Right: Protocol Log */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              borderBottom: "1px solid #1e3a5f",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div>
              <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.1em" }}>
                PROTOCOL INSPECTOR
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Click any entry to expand the raw JSON payload
              </div>
            </div>
            {log.length > 0 && (
              <button
                onClick={() => setLog([])}
                style={{
                  background: "transparent",
                  border: "1px solid #1e3a5f",
                  borderRadius: "6px",
                  color: "#475569",
                  fontSize: "10px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Legend */}
          <div
            style={{
              borderBottom: "1px solid #0f1f3a",
              padding: "8px 16px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              flexShrink: 0,
            }}
          >
            {[
              { color: "#2563eb", label: "Client → Server" },
              { color: "#16a34a", label: "Server → Client" },
              { color: "#9333ea", label: "Claude API" },
              { color: "#d97706", label: "Tool Exec" },
              { color: "#e11d48", label: "Final Result" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div
                  style={{ width: "8px", height: "8px", background: color, borderRadius: "2px" }}
                />
                <span style={{ fontSize: "10px", color: "#475569" }}>{label}</span>
              </div>
            ))}
          </div>

          <div
            ref={logRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
            }}
          >
            {log.length === 0 ? (
              <div
                style={{
                  color: "#1e3a5f",
                  fontSize: "11px",
                  textAlign: "center",
                  marginTop: "40px",
                  letterSpacing: "0.08em",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.3 }}>⬡</div>
                NO PROTOCOL ACTIVITY YET
                <br />
                Send a message to watch the MCP handshake live
              </div>
            ) : (
              log.map((entry, i) => <ProtocolEntry key={i} entry={entry} index={i} />)
            )}
          </div>

          {/* Footer: Architecture explanation */}
          <div
            style={{
              borderTop: "1px solid #0f1f3a",
              padding: "10px 16px",
              background: "rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: "10px", color: "#334155", lineHeight: "1.6" }}>
              <span style={{ color: "#1e4080" }}>YOUR APP</span> → discover tools from{" "}
              <span style={{ color: "#1a5c2a" }}>MCP SERVER</span> → pass tools to{" "}
              <span style={{ color: "#5c1a80" }}>CLAUDE</span> → execute tool calls →{" "}
              <span style={{ color: "#5c1a80" }}>CLAUDE</span> synthesizes final answer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
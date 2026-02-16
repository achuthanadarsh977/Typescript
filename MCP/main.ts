import "dotenv/config";
import { MCPClient } from "./mcp-client.js";
import { Claude } from "./core/claude.js";
import { CliChat } from "./core/cli-chat.js";
import { CliApp } from "./core/cli.js";

const claudeModel = process.env.CLAUDE_MODEL ?? "";
const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "";

if (!claudeModel) {
  console.warn("Warning: CLAUDE_MODEL is empty. Update .env for API calls.");
}
if (!anthropicApiKey) {
  console.warn(
    "Warning: ANTHROPIC_API_KEY is empty. Update .env for API calls.",
  );
}

async function main() {
  const claudeService = new Claude(claudeModel);

  const serverScripts = process.argv.slice(2);
  const clients: Record<string, MCPClient> = {};

  const useUv = process.env.USE_UV === "1";
  const command = useUv ? "uv" : "npx";
  const serverArgs = useUv
    ? ["run", "mcp-server.py"]
    : ["tsx", "mcp-server.ts"];

  const docClient = new MCPClient({ command, args: serverArgs });
  await docClient.connect();
  clients["doc_client"] = docClient;

  for (let i = 0; i < serverScripts.length; i++) {
    const serverScript = serverScripts[i];
    const clientId = `client_${i}_${serverScript}`;
    const client = new MCPClient({
      command: "npx",
      args: ["tsx", serverScript],
    });
    await client.connect();
    clients[clientId] = client;
  }

  const chat = new CliChat(docClient, clients, claudeService);
  const cli = new CliApp(chat);
  await cli.initialize();
  await cli.run();

  // Cleanup
  for (const client of Object.values(clients)) {
    await client.cleanup();
  }
}

main().catch(console.error);

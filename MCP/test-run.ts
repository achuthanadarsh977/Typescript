import "dotenv/config";
import { MCPClient } from "./mcp-client.js";
import { Claude } from "./core/claude.js";
import { CliChat } from "./core/cli-chat.js";

const claudeModel = process.env.CLAUDE_MODEL ?? "";

async function main() {
  console.log("Starting MCP server...");
  const docClient = new MCPClient({
    command: "npx",
    args: ["tsx", "mcp-server.ts"],
  });
  await docClient.connect();
  console.log("MCP server connected!");

  // Test listing tools
  const tools = await docClient.listTools();
  console.log(
    "\nAvailable tools:",
    tools.map((t) => t.name),
  );

  // Test listing resources
  const docs = await docClient.readResource("docs://documents");
  console.log("Available documents:", docs);

  // Test reading a document
  const content = await docClient.readResource(
    "docs://documents/deposition.md",
  );
  console.log("deposition.md content:", content);

  // Test listing prompts
  const prompts = await docClient.listPrompts();
  console.log(
    "Available prompts:",
    prompts.map((p) => p.name),
  );

  // Test chat with Claude
  console.log("\nSending test message to Claude...");
  const claudeService = new Claude(claudeModel);
  const clients: Record<string, MCPClient> = { doc_client: docClient };
  const chat = new CliChat(docClient, clients, claudeService);

  const response = await chat.run("What documents are available? List them.");
  console.log("\nClaude's response:\n" + response);

  await docClient.cleanup();
  console.log("\nDone!");
}

main().catch(console.error);

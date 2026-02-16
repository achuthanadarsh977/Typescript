import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class MCPClient {
  private command: string;
  private args: string[];
  private env?: Record<string, string>;
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  constructor(options: {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }) {
    this.command = options.command;
    this.args = options.args;
    this.env = options.env;
  }

  async connect(): Promise<void> {
    this.transport = new StdioClientTransport({
      command: this.command,
      args: this.args,
      env: this.env,
    });
    this.client = new Client({ name: "mcp-chat-client", version: "1.0.0" });
    await this.client.connect(this.transport);
  }

  private getSession(): Client {
    if (!this.client) {
      throw new Error("Client session not initialized. Call connect() first.");
    }
    return this.client;
  }

  async listTools() {
    const result = await this.getSession().listTools();
    return result.tools;
  }

  async callTool(toolName: string, toolInput: Record<string, unknown>) {
    return await this.getSession().callTool({
      name: toolName,
      arguments: toolInput,
    });
  }

  async listPrompts() {
    const result = await this.getSession().listPrompts();
    return result.prompts;
  }

  async getPrompt(promptName: string, args: Record<string, string>) {
    const result = await this.getSession().getPrompt({
      name: promptName,
      arguments: args,
    });
    return result.messages;
  }

  async readResource(uri: string) {
    const result = await this.getSession().readResource({ uri });
    const resource = result.contents[0] as {
      uri: string;
      text?: string;
      mimeType?: string;
    };

    if (resource.mimeType === "application/json" && resource.text) {
      return JSON.parse(resource.text);
    }

    return resource.text;
  }

  async cleanup(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
    }
    this.client = null;
    this.transport = null;
  }
}

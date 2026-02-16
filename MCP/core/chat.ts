import type {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages.js";
import type { Claude } from "./claude.js";
import type { MCPClient } from "../mcp-client.js";
import { ToolManager } from "./tools.js";

export class Chat {
  protected claudeService: Claude;
  protected clients: Record<string, MCPClient>;
  protected messages: MessageParam[] = [];

  constructor(claudeService: Claude, clients: Record<string, MCPClient>) {
    this.claudeService = claudeService;
    this.clients = clients;
  }

  protected async processQuery(query: string): Promise<void> {
    this.messages.push({ role: "user", content: query });
  }

  async run(query: string): Promise<string> {
    let finalTextResponse = "";

    await this.processQuery(query);

    while (true) {
      const allTools = await ToolManager.getAllTools(this.clients);

      const response = await this.claudeService.chat({
        messages: this.messages,
        tools: allTools as Tool[],
      });

      this.claudeService.addAssistantMessage(this.messages, response);

      if (response.stop_reason === "tool_use") {
        console.log(this.claudeService.textFromMessage(response));
        const toolResultParts = await ToolManager.executeToolRequests(
          this.clients,
          response,
        );

        this.claudeService.addUserMessage(
          this.messages,
          toolResultParts as any,
        );
      } else {
        finalTextResponse = this.claudeService.textFromMessage(response);
        break;
      }
    }

    return finalTextResponse;
  }
}

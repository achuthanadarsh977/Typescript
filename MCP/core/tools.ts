import type { Message } from "@anthropic-ai/sdk/resources/messages.js";
import type { MCPClient } from "../mcp-client.js";

interface ToolResultBlock {
  tool_use_id: string;
  type: "tool_result";
  content: string;
  is_error: boolean;
}

export class ToolManager {
  static async getAllTools(
    clients: Record<string, MCPClient>,
  ): Promise<
    Array<{ name: string; description: string; input_schema: unknown }>
  > {
    const tools: Array<{
      name: string;
      description: string;
      input_schema: unknown;
    }> = [];

    for (const client of Object.values(clients)) {
      const toolModels = await client.listTools();
      for (const t of toolModels) {
        tools.push({
          name: t.name,
          description: t.description ?? "",
          input_schema: t.inputSchema,
        });
      }
    }

    return tools;
  }

  private static async findClientWithTool(
    clients: MCPClient[],
    toolName: string,
  ): Promise<MCPClient | null> {
    for (const client of clients) {
      const tools = await client.listTools();
      const tool = tools.find((t) => t.name === toolName);
      if (tool) return client;
    }
    return null;
  }

  private static buildToolResultPart(
    toolUseId: string,
    text: string,
    status: "success" | "error",
  ): ToolResultBlock {
    return {
      tool_use_id: toolUseId,
      type: "tool_result",
      content: text,
      is_error: status === "error",
    };
  }

  static async executeToolRequests(
    clients: Record<string, MCPClient>,
    message: Message,
  ): Promise<ToolResultBlock[]> {
    const toolRequests = message.content.filter(
      (block) => block.type === "tool_use",
    );

    const toolResultBlocks: ToolResultBlock[] = [];

    for (const toolRequest of toolRequests) {
      if (toolRequest.type !== "tool_use") continue;

      const toolUseId = toolRequest.id;
      const toolName = toolRequest.name;
      const toolInput = toolRequest.input as Record<string, unknown>;

      const client = await this.findClientWithTool(
        Object.values(clients),
        toolName,
      );

      if (!client) {
        toolResultBlocks.push(
          this.buildToolResultPart(
            toolUseId,
            "Could not find that tool",
            "error",
          ),
        );
        continue;
      }

      try {
        const toolOutput = await client.callTool(toolName, toolInput);
        const items = toolOutput?.content ?? [];
        const contentList = (items as Array<{ type: string; text?: string }>)
          .filter((item) => item.type === "text")
          .map((item) => item.text ?? "");
        const contentJson = JSON.stringify(contentList);

        toolResultBlocks.push(
          this.buildToolResultPart(
            toolUseId,
            contentJson,
            toolOutput && (toolOutput as any).isError ? "error" : "success",
          ),
        );
      } catch (e) {
        const errorMessage = `Error executing tool '${toolName}': ${e}`;
        console.error(errorMessage);
        toolResultBlocks.push(
          this.buildToolResultPart(
            toolUseId,
            JSON.stringify({ error: errorMessage }),
            "error",
          ),
        );
      }
    }

    return toolResultBlocks;
  }
}

import Anthropic from "@anthropic-ai/sdk";
import type {
  Message,
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages.js";

export class Claude {
  private client: Anthropic;
  private model: string;

  constructor(model: string) {
    this.client = new Anthropic();
    this.model = model;
  }

  addUserMessage(messages: MessageParam[], message: Message | string): void {
    const content = typeof message === "string" ? message : message.content;
    messages.push({ role: "user", content });
  }

  addAssistantMessage(
    messages: MessageParam[],
    message: Message | string,
  ): void {
    const content = typeof message === "string" ? message : message.content;
    messages.push({ role: "assistant", content });
  }

  textFromMessage(message: Message): string {
    return message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("\n");
  }

  async chat(options: {
    messages: MessageParam[];
    system?: string;
    temperature?: number;
    stopSequences?: string[];
    tools?: Tool[];
    thinking?: boolean;
    thinkingBudget?: number;
  }): Promise<Message> {
    const params: Anthropic.MessageCreateParams = {
      model: this.model,
      max_tokens: 8000,
      messages: options.messages,
      temperature: options.temperature ?? 1.0,
    };

    if (options.stopSequences?.length) {
      params.stop_sequences = options.stopSequences;
    }

    if (options.thinking) {
      (params as any).thinking = {
        type: "enabled",
        budget_tokens: options.thinkingBudget ?? 1024,
      };
    }

    if (options.tools) {
      params.tools = options.tools;
    }

    if (options.system) {
      params.system = options.system;
    }

    return await this.client.messages.create(params);
  }
}

import * as readline from "readline";
import type { CliChat } from "./cli-chat.js";

interface Prompt {
  name: string;
  description?: string;
  arguments?: Array<{ name: string }>;
}

export class CliApp {
  private agent: CliChat;
  private resources: string[] = [];
  private prompts: Prompt[] = [];
  private rl: readline.Interface;

  constructor(agent: CliChat) {
    this.agent = agent;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => this.completer(line),
    });
  }

  private completer(line: string): [string[], string] {
    if (line.startsWith("/")) {
      const cmdPrefix = line.slice(1).split(/\s+/)[0] ?? "";
      const parts = line.slice(1).split(/\s+/);

      if (parts.length <= 1) {
        const hits = this.prompts
          .filter((p) => p.name.startsWith(cmdPrefix))
          .map((p) => `/${p.name}`);
        return [hits.length ? hits : [], line];
      }

      if (parts.length === 2) {
        const docPrefix = parts[1];
        const hits = this.resources
          .filter((r) => r.toLowerCase().startsWith(docPrefix.toLowerCase()))
          .map((r) => `/${parts[0]} ${r}`);
        return [hits.length ? hits : [], line];
      }
    }

    if (line.includes("@")) {
      const lastAt = line.lastIndexOf("@");
      const prefix = line.slice(lastAt + 1);
      const hits = this.resources
        .filter((r) => r.toLowerCase().startsWith(prefix.toLowerCase()))
        .map((r) => line.slice(0, lastAt + 1) + r);
      return [hits.length ? hits : [], line];
    }

    return [[], line];
  }

  async initialize(): Promise<void> {
    await this.refreshResources();
    await this.refreshPrompts();
  }

  private async refreshResources(): Promise<void> {
    try {
      this.resources = await this.agent.listDocsIds();
    } catch (e) {
      console.error(`Error refreshing resources: ${e}`);
    }
  }

  private async refreshPrompts(): Promise<void> {
    try {
      this.prompts = (await this.agent.listPrompts()) as Prompt[];
    } catch (e) {
      console.error(`Error refreshing prompts: ${e}`);
    }
  }

  async run(): Promise<void> {
    const prompt = (): Promise<string> =>
      new Promise((resolve) => {
        this.rl.question("> ", (answer) => resolve(answer));
      });

    while (true) {
      try {
        const userInput = await prompt();
        if (!userInput.trim()) continue;

        const response = await this.agent.run(userInput);
        console.log(`\nResponse:\n${response}`);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ERR_USE_AFTER_CLOSE") break;
        break;
      }
    }
  }
}

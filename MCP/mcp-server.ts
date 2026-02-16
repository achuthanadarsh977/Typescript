import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "DocumentMCP",
  version: "1.0.0",
});

const docs: Record<string, string> = {
  "deposition.md": "This deposition covers the testimony of Angela Smith, P.E.",
  "report.pdf": "The report details the state of a 20m condenser tower.",
  "financials.docx":
    "These financials outline the project's budget and expenditures.",
  "outlook.pdf":
    "This document presents the projected future performance of the system.",
  "plan.md": "The plan outlines the steps for the project's implementation.",
  "spec.txt":
    "These specifications define the technical requirements for the equipment.",
};

server.tool(
  "read_doc_contents",
  "Read the contents of a document and return it as a string.",
  { doc_id: z.string().describe("Id of the document to read") },
  async ({ doc_id }) => {
    if (!(doc_id in docs)) {
      throw new Error(`Doc with id ${doc_id} not found`);
    }
    return { content: [{ type: "text", text: docs[doc_id] }] };
  },
);

server.tool(
  "edit_document",
  "Edit a document by replacing a string in the documents content with a new string",
  {
    doc_id: z.string().describe("Id of the document that will be edited"),
    old_str: z
      .string()
      .describe(
        "The text to replace. Must match exactly, including whitespace",
      ),
    new_str: z
      .string()
      .describe("The new text to insert in place of the old text"),
  },
  async ({ doc_id, old_str, new_str }) => {
    if (!(doc_id in docs)) {
      throw new Error(`Doc with id ${doc_id} not found`);
    }
    docs[doc_id] = docs[doc_id].replace(old_str, new_str);
    return {
      content: [{ type: "text", text: "Document updated successfully" }],
    };
  },
);

server.resource("documents-list", "docs://documents", async (uri) => ({
  contents: [
    {
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify(Object.keys(docs)),
    },
  ],
}));

server.resource(
  "document-by-id",
  new ResourceTemplate("docs://documents/{doc_id}", { list: undefined }),
  async (uri, variables) => {
    const doc_id = variables.doc_id as string;
    if (!(doc_id in docs)) {
      throw new Error(`Doc with id ${doc_id} not found`);
    }
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: docs[doc_id],
        },
      ],
    };
  },
);

server.prompt(
  "format",
  "Rewrites the contents of the document in Markdown format.",
  { doc_id: z.string().describe("Id of the document to format") },
  async ({ doc_id }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `
    Your goal is to reformat a document to be written with markdown syntax.

    The id of the document you need to reformat is:
    <document_id>
    ${doc_id}
    </document_id>

    Add in headers, bullet points, tables, etc as necessary. Feel free to add in extra text, but don't change the meaning of the report.
    Use the 'edit_document' tool to edit the document. After the document has been edited, respond with the final version of the doc. Don't explain your changes.
    `,
        },
      },
    ],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

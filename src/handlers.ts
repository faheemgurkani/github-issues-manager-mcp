import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { prompts, promptHandlers } from "./prompts.js";
import { tools, toolHandlers } from "./tools.js";

export function setupHandlers(server: Server): void {
  // Register available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: "resource://issues/list",
        name: "List Open Issues",
        description:
          "Fetches the latest open issues from the configured GitHub repo",
        mimeType: "application/json",
      },
      {
        uri: "resource://issues/{number}",
        name: "Get Single Issue",
        description: "Retrieve a single GitHub issue by its number",
        mimeType: "application/json",
      },
    ],
  }));

  // Register URI templates for resources
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      {
        uriTemplate: "resource://issues/{number}",
        name: "Issue by Number",
        description: "Fetch a specific issue",
        mimeType: "application/json",
      },
    ],
  }));

  // Handle resource reads
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === "resource://issues/list") {
      return await promptHandlers["resource://issues/list"]();
    }
    const match = uri.match(/^resource:\/\/issues\/(\d+)$/);
    if (match) {
      const issue_number = parseInt(match[1], 10);
      return await promptHandlers["resource://issues/{number}"]({
        issue_number,
      });
    }
    throw new Error(`Resource not found: ${uri}`);
  });

  // Prompts: list and get
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: Object.values(prompts),
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = promptHandlers[name as keyof typeof promptHandlers];
    if (!handler) throw new Error(`Prompt not found: ${name}`);
    return handler(args as any);
  });

  // Tools: list and call
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params;
    const handler = toolHandlers[name as keyof typeof toolHandlers];
    if (!handler) throw new Error(`Tool not found: ${name}`);
    // @ts-expect-error validated by schema
    return handler(params);
  });
}

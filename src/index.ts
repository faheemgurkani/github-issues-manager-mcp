import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupHandlers } from "./handlers.js";

async function main() {
  const server = new Server(
    { name: "github-issues-manager-mcp", version: "1.0.0" },
    {
      capabilities: {
        resources: {},
        prompts: {},
        tools: {},
      },
    }
  );

  setupHandlers(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info(
    JSON.stringify({
      jsonrpc: "2.0",
      method: "log",
      params: { message: "GitHub Issues MCP Server running..." },
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

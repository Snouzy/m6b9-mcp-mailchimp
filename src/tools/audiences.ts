import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerAudienceTools(server: McpServer) {
  server.tool(
    "list_audiences",
    "List all Mailchimp audiences (lists)",
    {
      count: z
        .number()
        .optional()
        .describe("Number of results (default 10, max 1000)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ count, offset }) => {
      const data = await mc("/lists", {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "get_audience",
    "Get details of a specific Mailchimp audience",
    { list_id: z.string().describe("The audience/list ID") },
    async ({ list_id }) => {
      const data = await mc(`/lists/${list_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}

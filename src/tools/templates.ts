import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerTemplateTools(server: McpServer) {
  server.tool(
    "list_templates",
    "List Mailchimp email templates",
    {
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
      type: z
        .enum(["user", "base", "gallery"])
        .optional()
        .describe("Filter by template type"),
    },
    async ({ count, offset, type }) => {
      const data = await mc("/templates", {
        params: { count: count ?? 10, offset: offset ?? 0, type },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "get_template",
    "Get a specific template with its HTML content",
    { template_id: z.string().describe("The template ID") },
    async ({ template_id }) => {
      const data = await mc(`/templates/${template_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}

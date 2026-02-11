import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerInterestTools(server: McpServer) {
  server.tool(
    "list_interest_categories",
    "List interest categories (groups) for an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ list_id, count, offset }) => {
      const data = await mc(`/lists/${list_id}/interest-categories`, {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_interest_category",
    "Get details of a specific interest category",
    {
      list_id: z.string().describe("The audience/list ID"),
      category_id: z.string().describe("The interest category ID"),
    },
    async ({ list_id, category_id }) => {
      const data = await mc(`/lists/${list_id}/interest-categories/${category_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "list_interests",
    "List interests within a category",
    {
      list_id: z.string().describe("The audience/list ID"),
      category_id: z.string().describe("The interest category ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ list_id, category_id, count, offset }) => {
      const data = await mc(`/lists/${list_id}/interest-categories/${category_id}/interests`, {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_interest",
    "Get details of a specific interest",
    {
      list_id: z.string().describe("The audience/list ID"),
      category_id: z.string().describe("The interest category ID"),
      interest_id: z.string().describe("The interest ID"),
    },
    async ({ list_id, category_id, interest_id }) => {
      const data = await mc(`/lists/${list_id}/interest-categories/${category_id}/interests/${interest_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}

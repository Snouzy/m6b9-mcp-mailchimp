import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerReportTools(server: McpServer) {
  server.tool(
    "list_reports",
    "List campaign reports with performance stats",
    {
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ count, offset }) => {
      const data = await mc("/reports", {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "get_campaign_report",
    "Get detailed performance report for a specific campaign (opens, clicks, bounces, etc.)",
    { campaign_id: z.string().describe("The campaign ID") },
    async ({ campaign_id }) => {
      const data = await mc(`/reports/${campaign_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}

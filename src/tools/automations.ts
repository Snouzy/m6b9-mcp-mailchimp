import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerAutomationTools(server: McpServer) {
  server.tool(
    "list_automations",
    "List automation workflows",
    {
      status: z.enum(["save", "paused", "sending"]).optional().describe("Filter by automation status"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ status, count, offset }) => {
      const data = await mc("/automations", {
        params: { status, count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_automation",
    "Get details of a specific automation workflow",
    { workflow_id: z.string().describe("The automation workflow ID") },
    async ({ workflow_id }) => {
      const data = await mc(`/automations/${workflow_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "list_automation_emails",
    "List emails in an automation workflow",
    { workflow_id: z.string().describe("The automation workflow ID") },
    async ({ workflow_id }) => {
      const data = await mc(`/automations/${workflow_id}/emails`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_automation_email",
    "Get details of a specific automation email",
    {
      workflow_id: z.string().describe("The automation workflow ID"),
      email_id: z.string().describe("The automation email ID"),
    },
    async ({ workflow_id, email_id }) => {
      const data = await mc(`/automations/${workflow_id}/emails/${email_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}

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

  server.tool(
    "list_audience_activity",
    "Get recent activity feed for an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ list_id, count, offset }) => {
      const data = await mc(`/lists/${list_id}/activity`, {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_audience",
    "Create a new audience/list with contact info and campaign defaults",
    {
      name: z.string().describe("Audience name"),
      company: z.string().describe("Company name"),
      address1: z.string().describe("Street address"),
      city: z.string().describe("City"),
      state: z.string().describe("State/province"),
      zip: z.string().describe("Postal code"),
      country: z.string().describe("Country code (e.g. US, FR)"),
      from_name: z.string().describe("Default from name for campaigns"),
      from_email: z.string().email().describe("Default from email"),
      subject: z.string().describe("Default subject line"),
      language: z.string().describe("Default language (e.g. en, fr)"),
      permission_reminder: z.string().describe("Permission reminder text"),
    },
    async ({ name, company, address1, city, state, zip, country, from_name, from_email, subject, language, permission_reminder }) => {
      const data = await mc("/lists", {
        method: "POST",
        body: {
          name,
          contact: { company, address1, city, state, zip, country },
          permission_reminder,
          email_type_option: false,
          campaign_defaults: { from_name, from_email, subject, language },
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "update_audience",
    "Update audience settings",
    {
      list_id: z.string().describe("The audience/list ID"),
      name: z.string().optional().describe("New audience name"),
      permission_reminder: z.string().optional().describe("New permission reminder"),
    },
    async ({ list_id, name, permission_reminder }) => {
      const body: Record<string, unknown> = {};
      if (name) body.name = name;
      if (permission_reminder) body.permission_reminder = permission_reminder;
      const data = await mc(`/lists/${list_id}`, { method: "PATCH", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_audience",
    "Permanently delete an audience/list",
    { list_id: z.string().describe("The audience/list ID to delete") },
    async ({ list_id }) => {
      await mc(`/lists/${list_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `Audience ${list_id} deleted` }] };
    },
  );
}

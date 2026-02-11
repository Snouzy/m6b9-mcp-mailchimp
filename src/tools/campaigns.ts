import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerCampaignTools(server: McpServer) {
  server.tool(
    "list_campaigns",
    "List Mailchimp campaigns",
    {
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
      status: z
        .enum(["save", "paused", "schedule", "sending", "sent"])
        .optional()
        .describe("Filter by campaign status"),
      type: z
        .enum(["regular", "plaintext", "absplit", "rss", "variate"])
        .optional()
        .describe("Filter by campaign type"),
    },
    async ({ count, offset, status, type }) => {
      const data = await mc("/campaigns", {
        params: { count: count ?? 10, offset: offset ?? 0, status, type },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "get_campaign",
    "Get details of a specific campaign",
    { campaign_id: z.string().describe("The campaign ID") },
    async ({ campaign_id }) => {
      const data = await mc(`/campaigns/${campaign_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "create_campaign",
    "Create a new email campaign",
    {
      type: z
        .enum(["regular", "plaintext", "absplit", "rss", "variate"])
        .describe("Campaign type"),
      list_id: z.string().describe("Audience/list ID to send to"),
      subject: z.string().describe("Email subject line"),
      from_name: z.string().describe("Sender name"),
      reply_to: z.string().email().describe("Reply-to email address"),
      title: z.string().optional().describe("Internal campaign title"),
    },
    async ({ type, list_id, subject, from_name, reply_to, title }) => {
      const data = await mc("/campaigns", {
        method: "POST",
        body: {
          type,
          recipients: { list_id },
          settings: {
            subject_line: subject,
            from_name,
            reply_to,
            title: title ?? subject,
          },
        },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "update_campaign",
    "Update campaign settings",
    {
      campaign_id: z.string().describe("The campaign ID"),
      subject: z.string().optional().describe("New subject line"),
      from_name: z.string().optional().describe("New sender name"),
      reply_to: z.string().email().optional().describe("New reply-to email"),
      title: z.string().optional().describe("New internal title"),
    },
    async ({ campaign_id, subject, from_name, reply_to, title }) => {
      const settings: Record<string, string> = {};
      if (subject) settings.subject_line = subject;
      if (from_name) settings.from_name = from_name;
      if (reply_to) settings.reply_to = reply_to;
      if (title) settings.title = title;
      const data = await mc(`/campaigns/${campaign_id}`, {
        method: "PATCH",
        body: { settings },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "set_campaign_content",
    "Set the HTML content of a campaign",
    {
      campaign_id: z.string().describe("The campaign ID"),
      html: z.string().describe("Full HTML content for the email body"),
    },
    async ({ campaign_id, html }) => {
      const data = await mc(`/campaigns/${campaign_id}/content`, {
        method: "PUT",
        body: { html },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "send_campaign",
    "Send a campaign immediately. This action is irreversible.",
    { campaign_id: z.string().describe("The campaign ID to send") },
    async ({ campaign_id }) => {
      await mc(`/campaigns/${campaign_id}/actions/send`, { method: "POST" });
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${campaign_id} sent successfully`,
          },
        ],
      };
    },
  );

  server.tool(
    "schedule_campaign",
    "Schedule a campaign for a future date/time",
    {
      campaign_id: z.string().describe("The campaign ID"),
      schedule_time: z
        .string()
        .describe("ISO 8601 UTC datetime (e.g. 2025-03-01T10:00:00Z)"),
    },
    async ({ campaign_id, schedule_time }) => {
      await mc(`/campaigns/${campaign_id}/actions/schedule`, {
        method: "POST",
        body: { schedule_time },
      });
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${campaign_id} scheduled for ${schedule_time}`,
          },
        ],
      };
    },
  );

  server.tool(
    "delete_campaign",
    "Permanently delete a campaign",
    { campaign_id: z.string().describe("The campaign ID to delete") },
    async ({ campaign_id }) => {
      await mc(`/campaigns/${campaign_id}`, { method: "DELETE" });
      return {
        content: [{ type: "text", text: `Campaign ${campaign_id} deleted` }],
      };
    },
  );
}

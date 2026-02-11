import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerConversationTools(server: McpServer) {
  server.tool(
    "list_conversations",
    "List conversations (inbox messages)",
    {
      has_unread_messages: z.boolean().optional().describe("Filter to only unread conversations"),
      list_id: z.string().optional().describe("Filter by audience ID"),
      campaign_id: z.string().optional().describe("Filter by campaign ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ has_unread_messages, list_id, campaign_id, count, offset }) => {
      const data = await mc("/conversations", {
        params: {
          has_unread_messages: has_unread_messages !== undefined ? String(has_unread_messages) : undefined,
          list_id,
          campaign_id,
          count: count ?? 10,
          offset: offset ?? 0,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_conversation",
    "Get details of a specific conversation",
    { conversation_id: z.string().describe("The conversation ID") },
    async ({ conversation_id }) => {
      const data = await mc(`/conversations/${conversation_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "list_conversation_messages",
    "List messages in a conversation thread",
    {
      conversation_id: z.string().describe("The conversation ID"),
      is_read: z.boolean().optional().describe("Filter by read status"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ conversation_id, is_read, count, offset }) => {
      const data = await mc(`/conversations/${conversation_id}/messages`, {
        params: {
          is_read: is_read !== undefined ? String(is_read) : undefined,
          count: count ?? 10,
          offset: offset ?? 0,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}

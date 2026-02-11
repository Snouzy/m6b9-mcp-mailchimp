import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc, md5 } from "../client.js";

export function registerMemberTools(server: McpServer) {
  server.tool(
    "list_members",
    "List members of a Mailchimp audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
      status: z
        .enum([
          "subscribed",
          "unsubscribed",
          "cleaned",
          "pending",
          "transactional",
        ])
        .optional()
        .describe("Filter by subscription status"),
    },
    async ({ list_id, count, offset, status }) => {
      const data = await mc(`/lists/${list_id}/members`, {
        params: { count: count ?? 10, offset: offset ?? 0, status },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "get_member",
    "Get a specific member by email from an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      email: z.string().email().describe("Member email address"),
    },
    async ({ list_id, email }) => {
      const data = await mc(`/lists/${list_id}/members/${md5(email)}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "search_members",
    "Search for members across all audiences by email or name",
    { query: z.string().describe("Search query (email or name)") },
    async ({ query }) => {
      const data = await mc("/search-members", { params: { query } });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "add_member",
    "Add a new subscriber to an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      email: z.string().email().describe("Email address"),
      status: z
        .enum(["subscribed", "pending", "unsubscribed", "transactional"])
        .describe("Subscription status"),
      merge_fields: z
        .record(z.string())
        .optional()
        .describe('Merge fields (e.g. { "FNAME": "John", "LNAME": "Doe" })'),
      tags: z.array(z.string()).optional().describe("Tags to assign"),
    },
    async ({ list_id, email, status, merge_fields, tags }) => {
      const data = await mc(`/lists/${list_id}/members`, {
        method: "POST",
        body: { email_address: email, status, merge_fields, tags },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "update_member",
    "Update an existing member in an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      email: z.string().email().describe("Current email address of the member"),
      status: z
        .enum(["subscribed", "pending", "unsubscribed", "cleaned"])
        .optional()
        .describe("New status"),
      merge_fields: z
        .record(z.string())
        .optional()
        .describe("Merge fields to update"),
    },
    async ({ list_id, email, status, merge_fields }) => {
      const body: Record<string, unknown> = {};
      if (status) body.status = status;
      if (merge_fields) body.merge_fields = merge_fields;
      const data = await mc(`/lists/${list_id}/members/${md5(email)}`, {
        method: "PATCH",
        body,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "archive_member",
    "Archive (soft-delete) a member from an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      email: z.string().email().describe("Email address to archive"),
    },
    async ({ list_id, email }) => {
      await mc(`/lists/${list_id}/members/${md5(email)}`, {
        method: "DELETE",
      });
      return {
        content: [
          { type: "text", text: `Archived ${email} from list ${list_id}` },
        ],
      };
    },
  );

  server.tool(
    "tag_member",
    "Add or remove tags on a member",
    {
      list_id: z.string().describe("The audience/list ID"),
      email: z.string().email().describe("Member email address"),
      tags: z
        .array(
          z.object({
            name: z.string().describe("Tag name"),
            status: z
              .enum(["active", "inactive"])
              .describe("active = add, inactive = remove"),
          }),
        )
        .describe("Tags to add or remove"),
    },
    async ({ list_id, email, tags }) => {
      await mc(`/lists/${list_id}/members/${md5(email)}/tags`, {
        method: "POST",
        body: { tags },
      });
      return {
        content: [{ type: "text", text: `Updated tags for ${email}` }],
      };
    },
  );

  server.tool(
    "delete_member",
    "Permanently delete a member from an audience (irreversible, unlike archive)",
    {
      list_id: z.string().describe("The audience/list ID"),
      email: z.string().email().describe("Email address to permanently delete"),
    },
    async ({ list_id, email }) => {
      await mc(`/lists/${list_id}/members/${md5(email)}/actions/delete-permanent`, { method: "POST" });
      return { content: [{ type: "text", text: `Permanently deleted ${email} from list ${list_id}` }] };
    },
  );
}

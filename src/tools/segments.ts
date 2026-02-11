import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerSegmentTools(server: McpServer) {
  server.tool(
    "list_segments",
    "List segments for an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      type: z.enum(["saved", "static", "fuzzy"]).optional().describe("Segment type filter"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ list_id, type, count, offset }) => {
      const data = await mc(`/lists/${list_id}/segments`, {
        params: { type, count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_segment",
    "Get details of a specific segment",
    {
      list_id: z.string().describe("The audience/list ID"),
      segment_id: z.string().describe("The segment ID"),
    },
    async ({ list_id, segment_id }) => {
      const data = await mc(`/lists/${list_id}/segments/${segment_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "list_segment_members",
    "List members in a segment",
    {
      list_id: z.string().describe("The audience/list ID"),
      segment_id: z.string().describe("The segment ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ list_id, segment_id, count, offset }) => {
      const data = await mc(`/lists/${list_id}/segments/${segment_id}/members`, {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_segment",
    "Create a new segment (static or saved/conditional)",
    {
      list_id: z.string().describe("The audience/list ID"),
      name: z.string().describe("Segment name"),
      static_segment: z.array(z.string()).optional().describe("Array of email addresses for static segment"),
      match: z.enum(["any", "all"]).optional().describe("Match condition for saved segments"),
      conditions: z.array(z.record(z.unknown())).optional().describe("Array of condition objects for saved segments"),
    },
    async ({ list_id, name, static_segment, match, conditions }) => {
      const body: Record<string, unknown> = { name };
      if (static_segment) body.static_segment = static_segment;
      if (match || conditions) body.options = { match: match ?? "all", conditions: conditions ?? [] };
      const data = await mc(`/lists/${list_id}/segments`, { method: "POST", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "update_segment",
    "Update a segment's name or conditions",
    {
      list_id: z.string().describe("The audience/list ID"),
      segment_id: z.string().describe("The segment ID"),
      name: z.string().optional().describe("New segment name"),
      static_segment: z.array(z.string()).optional().describe("Updated email list for static segment"),
      match: z.enum(["any", "all"]).optional().describe("Match condition"),
      conditions: z.array(z.record(z.unknown())).optional().describe("Updated conditions"),
    },
    async ({ list_id, segment_id, name, static_segment, match, conditions }) => {
      const body: Record<string, unknown> = {};
      if (name) body.name = name;
      if (static_segment) body.static_segment = static_segment;
      if (match || conditions) body.options = { match, conditions };
      const data = await mc(`/lists/${list_id}/segments/${segment_id}`, { method: "PATCH", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_segment",
    "Delete a segment",
    {
      list_id: z.string().describe("The audience/list ID"),
      segment_id: z.string().describe("The segment ID to delete"),
    },
    async ({ list_id, segment_id }) => {
      await mc(`/lists/${list_id}/segments/${segment_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `Segment ${segment_id} deleted` }] };
    },
  );

  // Tags (implemented as static segments in Mailchimp)
  server.tool(
    "list_tags",
    "List all tags for an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ list_id, count, offset }) => {
      const data = await mc(`/lists/${list_id}/segments`, {
        params: { type: "static", count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_tag",
    "Create a new tag for an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      name: z.string().describe("Tag name"),
    },
    async ({ list_id, name }) => {
      const data = await mc(`/lists/${list_id}/segments`, {
        method: "POST",
        body: { name, static_segment: [] },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_tag",
    "Delete a tag from an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      tag_id: z.string().describe("The tag/segment ID to delete"),
    },
    async ({ list_id, tag_id }) => {
      await mc(`/lists/${list_id}/segments/${tag_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `Tag ${tag_id} deleted` }] };
    },
  );
}

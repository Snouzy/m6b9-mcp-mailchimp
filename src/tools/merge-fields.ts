import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerMergeFieldTools(server: McpServer) {
  server.tool(
    "list_merge_fields",
    "List merge fields (custom fields) for an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      type: z.enum(["text", "number", "address", "phone", "date", "url", "imageurl", "radio", "dropdown", "birthday", "zip"]).optional().describe("Filter by field type"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ list_id, type, count, offset }) => {
      const data = await mc(`/lists/${list_id}/merge-fields`, {
        params: { type, count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_merge_field",
    "Get details of a specific merge field",
    {
      list_id: z.string().describe("The audience/list ID"),
      merge_field_id: z.string().describe("The merge field ID"),
    },
    async ({ list_id, merge_field_id }) => {
      const data = await mc(`/lists/${list_id}/merge-fields/${merge_field_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_merge_field",
    "Create a new merge field for an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      name: z.string().describe("Field display name"),
      tag: z.string().describe("Field tag (uppercase, max 10 chars, e.g. PHONE)"),
      type: z.enum(["text", "number", "address", "phone", "date", "url", "imageurl", "radio", "dropdown", "birthday", "zip"]).describe("Field type"),
      required: z.boolean().optional().describe("Whether the field is required"),
      default_value: z.string().optional().describe("Default value"),
      choices: z.array(z.string()).optional().describe("Options for radio/dropdown fields"),
    },
    async ({ list_id, name, tag, type, required, default_value, choices }) => {
      const body: Record<string, unknown> = { name, tag, type };
      if (required !== undefined) body.required = required;
      if (default_value) body.default_value = default_value;
      if (choices) body.options = { choices };
      const data = await mc(`/lists/${list_id}/merge-fields`, { method: "POST", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "update_merge_field",
    "Update a merge field's properties",
    {
      list_id: z.string().describe("The audience/list ID"),
      merge_field_id: z.string().describe("The merge field ID"),
      name: z.string().optional().describe("New display name"),
      required: z.boolean().optional().describe("Whether the field is required"),
      default_value: z.string().optional().describe("New default value"),
    },
    async ({ list_id, merge_field_id, name, required, default_value }) => {
      const body: Record<string, unknown> = {};
      if (name) body.name = name;
      if (required !== undefined) body.required = required;
      if (default_value) body.default_value = default_value;
      const data = await mc(`/lists/${list_id}/merge-fields/${merge_field_id}`, { method: "PATCH", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_merge_field",
    "Delete a merge field from an audience",
    {
      list_id: z.string().describe("The audience/list ID"),
      merge_field_id: z.string().describe("The merge field ID to delete"),
    },
    async ({ list_id, merge_field_id }) => {
      await mc(`/lists/${list_id}/merge-fields/${merge_field_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `Merge field ${merge_field_id} deleted` }] };
    },
  );
}

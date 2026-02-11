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

  server.tool(
    "create_template",
    "Create a new email template",
    {
      name: z.string().describe("Template name"),
      html: z.string().describe("Template HTML content"),
      folder_id: z.string().optional().describe("Folder ID to organize template"),
    },
    async ({ name, html, folder_id }) => {
      const body: Record<string, unknown> = { name, html };
      if (folder_id) body.folder_id = folder_id;
      const data = await mc("/templates", { method: "POST", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "update_template",
    "Update an existing template's name or HTML",
    {
      template_id: z.string().describe("The template ID"),
      name: z.string().optional().describe("New template name"),
      html: z.string().optional().describe("New HTML content"),
    },
    async ({ template_id, name, html }) => {
      const body: Record<string, unknown> = {};
      if (name) body.name = name;
      if (html) body.html = html;
      const data = await mc(`/templates/${template_id}`, { method: "PATCH", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_template",
    "Delete a template",
    { template_id: z.string().describe("The template ID to delete") },
    async ({ template_id }) => {
      await mc(`/templates/${template_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `Template ${template_id} deleted` }] };
    },
  );

  server.tool(
    "list_template_folders",
    "List template folders",
    {
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ count, offset }) => {
      const data = await mc("/template-folders", {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_template_folder",
    "Create a template folder",
    { name: z.string().describe("Folder name") },
    async ({ name }) => {
      const data = await mc("/template-folders", { method: "POST", body: { name } });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_template_folder",
    "Delete a template folder",
    { folder_id: z.string().describe("The folder ID to delete") },
    async ({ folder_id }) => {
      await mc(`/template-folders/${folder_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `Template folder ${folder_id} deleted` }] };
    },
  );
}

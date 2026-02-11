import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerFileTools(server: McpServer) {
  server.tool(
    "list_files",
    "List files in the Mailchimp file manager",
    {
      type: z.enum(["image", "file"]).optional().describe("Filter by file type"),
      folder_id: z.string().optional().describe("Filter by folder ID"),
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ type, folder_id, count, offset }) => {
      const data = await mc("/file-manager/files", {
        params: { type, folder_id, count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_file",
    "Get details of a specific file",
    { file_id: z.string().describe("The file ID") },
    async ({ file_id }) => {
      const data = await mc(`/file-manager/files/${file_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "upload_file",
    "Upload a file to the Mailchimp file manager (max 10MB)",
    {
      name: z.string().describe("File name with extension"),
      file_data: z.string().describe("Base64-encoded file content"),
      folder_id: z.string().optional().describe("Folder ID to upload into"),
    },
    async ({ name, file_data, folder_id }) => {
      const body: Record<string, unknown> = { name, file_data };
      if (folder_id) body.folder_id = folder_id;
      const data = await mc("/file-manager/files", { method: "POST", body });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_file",
    "Delete a file from the file manager",
    { file_id: z.string().describe("The file ID to delete") },
    async ({ file_id }) => {
      await mc(`/file-manager/files/${file_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `File ${file_id} deleted` }] };
    },
  );

  server.tool(
    "list_file_folders",
    "List folders in the file manager",
    {
      count: z.number().optional().describe("Number of results (default 10)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async ({ count, offset }) => {
      const data = await mc("/file-manager/folders", {
        params: { count: count ?? 10, offset: offset ?? 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_file_folder",
    "Get details of a specific file folder",
    { folder_id: z.string().describe("The folder ID") },
    async ({ folder_id }) => {
      const data = await mc(`/file-manager/folders/${folder_id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_file_folder",
    "Create a new folder in the file manager",
    { name: z.string().describe("Folder name") },
    async ({ name }) => {
      const data = await mc("/file-manager/folders", { method: "POST", body: { name } });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_file_folder",
    "Delete a folder from the file manager",
    { folder_id: z.string().describe("The folder ID to delete") },
    async ({ folder_id }) => {
      await mc(`/file-manager/folders/${folder_id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `File folder ${folder_id} deleted` }] };
    },
  );
}

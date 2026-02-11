#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mc } from "./client.js";
import { registerAudienceTools } from "./tools/audiences.js";
import { registerMemberTools } from "./tools/members.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerTemplateTools } from "./tools/templates.js";
import { registerReportTools } from "./tools/reports.js";

const server = new McpServer({
  name: "mailchimp",
  version: "1.0.0",
});

server.tool(
  "ping",
  "Test connection and get Mailchimp account info",
  {},
  async () => {
    const data = await mc("/");
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
);

registerAudienceTools(server);
registerMemberTools(server);
registerCampaignTools(server);
registerTemplateTools(server);
registerReportTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

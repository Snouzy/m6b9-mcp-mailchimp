#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mc } from "./client.js";
import { registerAudienceTools } from "./tools/audiences.js";
import { registerMemberTools } from "./tools/members.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerTemplateTools } from "./tools/templates.js";
import { registerReportTools } from "./tools/reports.js";
import { registerSegmentTools } from "./tools/segments.js";
import { registerMergeFieldTools } from "./tools/merge-fields.js";
import { registerAutomationTools } from "./tools/automations.js";
import { registerInterestTools } from "./tools/interests.js";
import { registerConversationTools } from "./tools/conversations.js";
import { registerFileTools } from "./tools/files.js";
import { registerDomainTools } from "./tools/domains.js";

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
registerSegmentTools(server);
registerMergeFieldTools(server);
registerAutomationTools(server);
registerInterestTools(server);
registerConversationTools(server);
registerFileTools(server);
registerDomainTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mc } from "../client.js";

export function registerDomainTools(server: McpServer) {
  server.tool(
    "list_verified_domains",
    "List all verified sending domains",
    {},
    async () => {
      const data = await mc("/verified-domains");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_verified_domain",
    "Get verification status of a specific domain",
    { domain: z.string().describe("The domain name (e.g. example.com)") },
    async ({ domain }) => {
      const data = await mc(`/verified-domains/${encodeURIComponent(domain)}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_verified_domain",
    "Add a domain for verification",
    { domain: z.string().describe("Domain name or email address (domain will be extracted)") },
    async ({ domain }) => {
      const d = domain.includes("@") ? domain.split("@")[1] : domain;
      const data = await mc("/verified-domains", { method: "POST", body: { verification_email: `admin@${d}` } });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "send_domain_verification_email",
    "Resend verification email for a domain",
    { domain: z.string().describe("The domain name") },
    async ({ domain }) => {
      const data = await mc(`/verified-domains/${encodeURIComponent(domain)}/actions/verify`, { method: "POST" });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "delete_verified_domain",
    "Remove a verified domain",
    { domain: z.string().describe("The domain name to remove") },
    async ({ domain }) => {
      await mc(`/verified-domains/${encodeURIComponent(domain)}`, { method: "DELETE" });
      return { content: [{ type: "text", text: `Domain ${domain} removed` }] };
    },
  );
}

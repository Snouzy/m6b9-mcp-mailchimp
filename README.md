# @m6b9/mcp-mailchimp

Serveur MCP pour l'API Mailchimp Marketing v3. 72 tools, zero bloat.

## Prerequis

- Node.js >= 20
- Une [cle API Mailchimp](https://mailchimp.com/help/about-api-keys/) (format `xxx-usXX`)

## Installation

```bash
git clone <repo-url> && cd m6b9-mcp-mailchimp
npm install
npm run build
```

## Configuration

Copier le fichier d'environnement et y mettre ta cle API :

```bash
cp .env.example .env
```

```
MAILCHIMP_API_KEY=your-api-key-us00
```

Le server prefix (`us11`, `us21`, etc.) est extrait automatiquement de la cle.

## Lancement

### Mode dev (TypeScript direct)

```bash
MAILCHIMP_API_KEY=xxx-us11 npx tsx src/index.ts
```

Ou avec le `.env` :

```bash
npx tsx --env-file=.env src/index.ts
```

### Mode production (build)

```bash
npm run build
MAILCHIMP_API_KEY=xxx-us11 node dist/index.js
```

## Verification

Tester que le serveur repond correctement :

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"ping","arguments":{}}}\n' \
  | MAILCHIMP_API_KEY=xxx-us11 node dist/index.js 2>/dev/null \
  | tail -1 | python3 -m json.tool
```

Si la connexion est OK, tu verras les infos de ton compte (nom, email, nombre de subscribers).

Pour lister tous les tools disponibles :

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/list"}\n' \
  | MAILCHIMP_API_KEY=xxx-us11 node dist/index.js 2>/dev/null \
  | tail -1 | python3 -c "import sys,json; tools=json.loads(sys.stdin.read())['result']['tools']; [print(t['name']) for t in tools]"
```

## Integration Claude Code

```bash
claude mcp add mailchimp -s user \
  -e MAILCHIMP_API_KEY=xxx-us11 \
  -- node /chemin/absolu/vers/m6b9-mcp-mailchimp/dist/index.js
```

Puis relancer Claude Code. Le serveur sera disponible globalement.

## Integration Claude Desktop

Ajouter dans `~/Library/Application Support/Claude/claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "mailchimp": {
      "command": "node",
      "args": ["/chemin/absolu/vers/m6b9-mcp-mailchimp/dist/index.js"],
      "env": {
        "MAILCHIMP_API_KEY": "xxx-us11"
      }
    }
  }
}
```

## Tools (72)

| Module | Tools | Description |
|--------|-------|-------------|
| **Account** | `ping` | Test connexion + infos compte |
| **Audiences** | `list_audiences` `get_audience` `list_audience_activity` `create_audience` `update_audience` `delete_audience` | CRUD audiences + activite |
| **Members** | `list_members` `get_member` `search_members` `add_member` `update_member` `archive_member` `tag_member` `delete_member` | Gestion complete des abonnes |
| **Campaigns** | `list_campaigns` `get_campaign` `create_campaign` `update_campaign` `set_campaign_content` `get_campaign_content` `send_campaign` `schedule_campaign` `delete_campaign` | Cycle de vie complet des campagnes |
| **Templates** | `list_templates` `get_template` `create_template` `update_template` `delete_template` `list_template_folders` `create_template_folder` `delete_template_folder` | Templates + organisation en dossiers |
| **Reports** | `list_reports` `get_campaign_report` | Analytics et performance |
| **Segments** | `list_segments` `get_segment` `list_segment_members` `create_segment` `update_segment` `delete_segment` | Segments statiques et conditionnels |
| **Tags** | `list_tags` `create_tag` `delete_tag` | Gestion des tags (segments statiques) |
| **Merge Fields** | `list_merge_fields` `get_merge_field` `create_merge_field` `update_merge_field` `delete_merge_field` | Champs personnalises |
| **Automations** | `list_automations` `get_automation` `list_automation_emails` `get_automation_email` | Workflows automatises |
| **Interests** | `list_interest_categories` `get_interest_category` `list_interests` `get_interest` | Groupes d'interets |
| **Conversations** | `list_conversations` `get_conversation` `list_conversation_messages` | Messagerie inbox |
| **File Manager** | `list_files` `get_file` `upload_file` `delete_file` `list_file_folders` `get_file_folder` `create_file_folder` `delete_file_folder` | Gestion de fichiers et images |
| **Domains** | `list_verified_domains` `get_verified_domain` `create_verified_domain` `send_domain_verification_email` `delete_verified_domain` | Domaines d'envoi verifies |

## Structure

```
src/
  client.ts              # Client HTTP Mailchimp (fetch + auth Basic)
  index.ts               # Point d'entree MCP (enregistre tous les tools)
  tools/
    audiences.ts         # Audiences / listes
    members.ts           # Abonnes
    campaigns.ts         # Campagnes email
    templates.ts         # Templates + dossiers
    reports.ts           # Rapports de campagne
    segments.ts          # Segments + tags
    merge-fields.ts      # Champs personnalises
    automations.ts       # Workflows
    interests.ts         # Groupes d'interets
    conversations.ts     # Messages inbox
    files.ts             # File manager
    domains.ts           # Domaines verifies
```

## Stack

- `@modelcontextprotocol/sdk` — SDK officiel MCP
- `zod` — Validation des parametres
- `tsup` — Build ESM
- `tsx` — Dev mode

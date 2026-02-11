import { createHash } from "node:crypto";

const API_KEY = process.env.MAILCHIMP_API_KEY;
if (!API_KEY) throw new Error("MAILCHIMP_API_KEY env var is required");

const prefix = API_KEY.split("-").pop()!;
const BASE = `https://${prefix}.api.mailchimp.com/3.0`;
const AUTH = `Basic ${Buffer.from(`apikey:${API_KEY}`).toString("base64")}`;

interface RequestOptions {
  method?: string;
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

export async function mc<T = any>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const err: any = await res.json().catch(() => ({
      detail: res.statusText,
    }));
    throw new Error(
      `Mailchimp ${res.status}: ${err.detail || err.title || res.statusText}`,
    );
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export function md5(email: string): string {
  return createHash("md5").update(email.toLowerCase()).digest("hex");
}

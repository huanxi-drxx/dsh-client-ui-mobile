// Host loader entry for the browser-only mobile plugin.
// Provides the provider-balance endpoint consumed by the client half.
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";
export const inject = ["webServer", "credentials"];

export function apply(ctx) {
  const webServer = ctx.get("webServer");
  const credentials = ctx.get("credentials");
  if (webServer === undefined) return;

  // Providers with a known, public balance API. Providers without one
  // (Google/Gemini, Anthropic, free trials, …) are intentionally absent:
  // the client simply shows nothing for them.
  const SPECS = [
    {
      id: "deepseek",
      keyRef: "DEEPSEEK_API_KEY",
      url: "https://api.deepseek.com/user/balance",
      parse: (j) => {
        const info = j && Array.isArray(j.balance_infos) ? j.balance_infos[0] : null;
        if (!info) return null;
        const bal = Number(info.total_balance);
        if (!isFinite(bal)) return null;
        return { balance: bal, currency: info.currency || "CNY" };
      },
    },
    {
      id: "openrouter",
      keyRef: "OPENROUTER_API_KEY",
      url: "https://openrouter.ai/api/v1/auth/key",
      parse: (j) => {
        const d = j && j.data;
        if (!d) return null;
        const bal = Number(d.credits);
        if (!isFinite(bal)) return null;
        return { balance: bal, currency: "USD" };
      },
    },
    {
      id: "openai",
      keyRef: "OPENAI_API_KEY",
      urls: [
        "https://api.openai.com/v1/dashboard/billing/subscription",
        "https://api.openai.com/v1/dashboard/billing/usage?start_date=2024-01-01&end_date=2099-01-01",
      ],
      parse: (subscription, usage) => {
        const limitRaw = subscription && subscription.hard_limits_usd ? subscription.hard_limits_usd.limit : null;
        const usedRaw = usage ? usage.total_usage : null;
        const limit = limitRaw === null ? null : Number(limitRaw);
        const used = usedRaw === null ? null : Number(usedRaw) / 100;
        if (limit === null || used === null || !isFinite(limit) || !isFinite(used)) return null;
        return { balance: Math.max(0, limit - used), currency: "USD" };
      },
    },
  ];

  let cache = null;
  let cacheAt = 0;

  const handler = async (req, res) => {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    try {
      if (cache !== null && Date.now() - cacheAt < 30000) {
        res.end(JSON.stringify(cache));
        return;
      }
      const out = {};
      for (const spec of SPECS) {
        try {
          const resolved = credentials ? await credentials.resolve(spec.keyRef) : undefined;
          if (!resolved || !resolved.value) continue;
          const headers = { Authorization: `Bearer ${resolved.value}` };
          const urls = spec.urls || [spec.url];
          const payloads = [];
          for (const u of urls) {
            const r = await fetch(u, { headers, signal: AbortSignal.timeout(8000) });
            if (!r.ok) { payloads.length = 0; break; }
            payloads.push(await r.json());
          }
          if (payloads.length !== urls.length) continue;
          const parsed = spec.parse(...payloads);
          if (parsed && parsed.balance !== null) out[spec.id] = parsed;
        } catch (_e) { /* skip this provider */ }
      }
      cache = out;
      cacheAt = Date.now();
      res.end(JSON.stringify(out));
    } catch (_e) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end("{}");
    }
  };

  const disposeBalances = webServer.register({ kind: "exact", path: "/api/dshm/balances", handler });

  // POST /api/dshm/upload — save a user-picked file into the session workspace.
  const uploadHandler = async (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end(JSON.stringify({ error: "method not allowed" }));
      return;
    }
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 20 * 1024 * 1024) {
          res.writeHead(413);
          res.end(JSON.stringify({ error: "too large" }));
          return;
        }
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      const cwd = typeof body.cwd === "string" ? body.cwd : "";
      const name = typeof body.name === "string" ? basename(body.name) : "";
      const data = typeof body.data === "string" ? body.data : "";
      if (!cwd || !name || !data) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "cwd/name/data required" }));
        return;
      }
      const content = Buffer.from(data, "base64");
      const path = `${cwd}/${name}`;
      await writeFile(path, content);
      res.writeHead(200);
      res.end(JSON.stringify({ path }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    }
  };
  const disposeUpload = webServer.register({ kind: "exact", path: "/api/dshm/upload", handler: uploadHandler });

  return () => {
    disposeBalances();
    disposeUpload();
  };
}

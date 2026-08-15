// Host loader entry for the browser-only mobile plugin.
// Provides the provider-balance endpoint consumed by the client half.
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { scopeOf } from "@deepseek-ai/dsh-scope";
import os from "node:os";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
export const inject = ["webServer", "credentials"];

// ---------- per-tool enable/disable ----------
const TOOLS_CONFIG_PATH = join(os.homedir(), ".dsh", "dshm-tools-config.json");
let toolsDisabled = loadToolsConfig();
function loadToolsConfig() {
  try {
    const j = JSON.parse(readFileSync(TOOLS_CONFIG_PATH, "utf8"));
    return Array.isArray(j && j.disabled) ? j.disabled.filter((s) => typeof s === "string") : [];
  } catch { return []; }
}
function saveToolsConfig() {
  try { writeFileSync(TOOLS_CONFIG_PATH, JSON.stringify({ disabled: toolsDisabled }, null, 2)); } catch { /* ignore */ }
}
const toolRestrictions = new Map(); // sessionId -> disposer
// Deny only names that actually exist as tools, and skip reserved transport names.
function applyToolsRestriction(agentCtx, disabled) {
  try {
    const toolsSvc = agentCtx && agentCtx.tools;
    if (!toolsSvc || disabled.length === 0) return null;
    const known = new Set(toolsSvc.schemas().map((t) => t.name));
    const deny = disabled.filter((n) => known.has(n) && n !== "run_code");
    if (deny.length === 0) return null;
    try {
      return toolsSvc.restrict({ deny });
    } catch (_e) {
      // Some visible names may be scope-local (own-layer) and therefore not
      // restrictable; deny each name individually and keep the ones that accept.
      const disposers = [];
      for (const name of deny) {
        try { disposers.push(toolsSvc.restrict({ deny: [name] })); } catch (_e2) { /* not restrictable */ }
      }
      if (disposers.length === 0) return null;
      return () => { for (const d of disposers) { try { d(); } catch { /* ignore */ } } };
    }
  } catch (_e) { return null; }
}
function applyToolsForSession(sessionId, ctx) {
  const agentsSvc = ctx.get("agents");
  const agent = agentsSvc ? agentsSvc.get(sessionId) : void 0;
  if (!agent) return;
  const old = toolRestrictions.get(sessionId);
  if (old) { try { old(); } catch { /* ignore */ } toolRestrictions.delete(sessionId); }
  const dispose = applyToolsRestriction(agent.ctx, toolsDisabled);
  if (dispose) toolRestrictions.set(sessionId, dispose);
}



// Double-mount guard: a composition must mount this package exactly once.
// If a second row resolves the same package (e.g. an accidental duplicate
// insert), apply() would run twice and the second registration of the same
// webServer routes would throw "duplicate route" and take down the whole
// plugin tree at boot. The flag is module-scoped so every mount of this one
// package shares it; the disposer resets it so HMR re-application still works.
let hostApplied = false;
export function apply(ctx) {
  const webServer = ctx.get("webServer");
  const credentials = ctx.get("credentials");
  if (webServer === undefined) return;
  if (hostApplied) {
    try { ctx.logger && ctx.logger.warn && ctx.logger.warn("[dsh-client-ui-mobile] apply() called again (duplicate mount?) — skipping duplicate route registration"); } catch { /* ignore */ }
    return;
  }
  hostApplied = true;

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

  // GET /api/dshm/tools?session=<id> — project the agent's visible tool schemas
  // (name, description, parameters) for the Tools settings page.
  const toolsHandler = async (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end(JSON.stringify({ error: "method not allowed" }));
      return;
    }
    try {
      const toolsSvc = ctx.get("tools");
      const agentsSvc = ctx.get("agents");
      const url = new URL(req.url || "/", "http://x");
      const sessionId = url.searchParams.get("session") || "";
      let tools = [];
      if (toolsSvc !== void 0) {
        if (sessionId && agentsSvc !== void 0) {
          const agent = agentsSvc.get(sessionId);
          const scope = agent ? scopeOf(agent.ctx) : void 0;
          if (scope !== void 0) tools = toolsSvc.schemas(scope);
        }
        if (tools.length === 0) tools = toolsSvc.schemas();
      }
      const body = JSON.stringify({ tools });
      if (req.method === "HEAD") {
        res.writeHead(200);
        res.end();
        return;
      }
      res.writeHead(200);
      res.end(body);
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    }
  };
  const disposeTools = webServer.register({ kind: "exact", path: "/api/dshm/tools", handler: toolsHandler });

  // Apply the saved tool-disabled list whenever an agent is published.
  ctx.on("agent/created", (payload) => {
    const agent = payload && payload.agent;
    if (!agent || toolsDisabled.length === 0) return;
    const dispose = applyToolsRestriction(agent.ctx, toolsDisabled);
    if (dispose) toolRestrictions.set(agent.id, dispose);
  });

  // /api/dshm/tools-config — one exact route (the webserver's exact table is
  // keyed by path only, so GET and POST MUST share a single registration;
  // registering the same path twice throws "duplicate exact route").
  const toolsConfigHandler = async (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.method === "GET" || req.method === "HEAD") {
      res.writeHead(200);
      res.end(JSON.stringify({ disabled: toolsDisabled }));
      return;
    }
    if (req.method === "POST") {
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const list = Array.isArray(body.disabled) ? body.disabled.filter((s) => typeof s === "string") : [];
        toolsDisabled = [...new Set(list)];
        saveToolsConfig();
        if (typeof body.sessionId === "string" && body.sessionId) applyToolsForSession(body.sessionId, ctx);
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, disabled: toolsDisabled }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
      }
      return;
    }
    res.writeHead(405);
    res.end(JSON.stringify({ error: "method not allowed" }));
  };
  const disposeToolsConfig = webServer.register({ kind: "exact", path: "/api/dshm/tools-config", handler: toolsConfigHandler });

  return () => {
    disposeBalances();
    disposeUpload();
    disposeTools();
    disposeToolsConfig();
    for (const dispose of toolRestrictions.values()) { try { dispose(); } catch { /* ignore */ } }
    toolRestrictions.clear();
    hostApplied = false;
  };
}

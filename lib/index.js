// Host loader entry for the browser-only mobile plugin.
// Provides the provider-balance endpoint consumed by the client half.
import { writeFile } from "node:fs/promises";
import { realpath } from "node:fs/promises";
import { basename } from "node:path";
import { scopeOf } from "@deepseek-ai/dsh-scope";
import os from "node:os";
import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
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

// ---------- multi-model web search (dshm-search provider) ----------
const SEARCH_CONFIG_PATH = join(os.homedir(), ".dsh", "dshm-search-config.json");
// No built-in model by default: search services are user-configured (Exa,
// DeepSeek web search, …) with their own API keys. deepseek-v4-flash does not
// provide a search API, so shipping it as a default would be wrong.
let searchConfig = loadSearchConfig();
function loadSearchConfig() {
  try {
    const j = JSON.parse(readFileSync(SEARCH_CONFIG_PATH, "utf8"));
    const models = Array.isArray(j && j.models)
      ? j.models.filter((m) => m && typeof m === "object" && ((typeof m.model === "string" && m.model.length > 0) || m.type !== "deepseek"))
      : [];
    const current = typeof j.current === "string" && models.some((m) => m.id === j.current) ? j.current : (models[0] ? models[0].id : "");
    return { models, current };
  } catch { return { models: [], current: "" }; }
}
function saveSearchConfig() {
  try { writeFileSync(SEARCH_CONFIG_PATH, JSON.stringify(searchConfig, null, 2)); } catch { /* ignore */ }
}
function currentSearchModel() {
  return searchConfig.models.find((m) => m.id === searchConfig.current) || searchConfig.models[0] || null;
}
// Map a DeepSeek Anthropic Messages response to the normalized web result.
function citationSnippets(blocks) {
  const map = new Map();
  for (const block of blocks) {
    if (block && block.type !== "text") continue;
    for (const cite of (block && block.citations) || []) {
      if (cite && typeof cite.url === "string" && cite.url.length > 0 && typeof cite.cited_text === "string" && cite.cited_text.length > 0 && !map.has(cite.url)) map.set(cite.url, cite.cited_text);
    }
  }
  return map;
}
function mapAnthropicSearchResponse(response) {
  const blocks = Array.isArray(response && response.content) ? response.content : [];
  const resultBlocks = blocks.filter((b) => b && b.type === "web_search_tool_result");
  if (resultBlocks.length === 0) throw new Error("search returned no web_search_tool_result blocks; the request may not have triggered native web search");
  const snippets = citationSnippets(blocks);
  const seen = new Set();
  const sources = [];
  for (const block of resultBlocks) for (const item of (block.content || [])) {
    if (!item || item.type !== "web_search_result" || typeof item.url !== "string" || item.url.length === 0 || seen.has(item.url)) continue;
    seen.add(item.url);
    const snippet = snippets.get(item.url);
    sources.push({
      url: item.url,
      ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
      ...(snippet !== void 0 ? { snippet } : {}),
      ...(typeof item.page_age === "string" && item.page_age.length > 0 ? { publishedAt: item.page_age } : {}),
    });
  }
  return { sources, truncated: false };
}
// Resolve one model's API key: literal `apiKey` first, then the credential/env
// named by `apiKeyEnv`.
async function resolveSearchApiKey(credentialsSvc, model) {
  if (typeof model.apiKey === "string" && model.apiKey.length > 0) return model.apiKey;
  const apiKeyEnv = model.apiKeyEnv || "DEEPSEEK_API_KEY";
  if (credentialsSvc !== void 0) {
    try {
      const resolved = await credentialsSvc.resolve(apiKeyEnv);
      if (resolved && typeof resolved.value === "string" && resolved.value.length > 0) return resolved.value;
    } catch { /* fall through */ }
  }
  return "";
}
async function fetchJson(endpoint, init, signal) {
  let response;
  try {
    response = await fetch(endpoint, { ...init, ...(signal !== void 0 ? { signal } : {}) });
  } catch (error) {
    if (signal && signal.aborted === true) throw Object.assign(new Error("search aborted"), { code: "WEB_ABORTED" });
    throw new Error(`search request failed: ${String(error)}`);
  }
  if (!response.ok) {
    let message = `search API error (HTTP ${response.status})`;
    try {
      const parsed = await response.json();
      message = typeof parsed.error === "string" ? parsed.error : (parsed.error && parsed.error.message) || parsed.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return response.json();
}
// Exa search: POST /search with x-api-key; `text: true` asks for snippets.
async function exaSearch(model, apiKey, request, signal) {
  const base = String(model.baseURL || "https://api.exa.ai").replace(/\/$/, "");
  const body = {
    query: request.query,
    numResults: Number.isFinite(Number(request.maxResults)) && Number(request.maxResults) > 0 ? Number(request.maxResults) : 5,
    contents: { text: true },
  };
  const parsed = await fetchJson(base + "/search", {
    method: "POST",
    redirect: "error",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
      "accept": "application/json",
      "user-agent": "deepseek-harness/0.0.1",
    },
    body: JSON.stringify(body),
  }, signal);
  const results = Array.isArray(parsed && parsed.results) ? parsed.results : [];
  const sources = [];
  const seen = new Set();
  for (const item of results) {
    if (!item || typeof item.url !== "string" || item.url.length === 0 || seen.has(item.url)) continue;
    seen.add(item.url);
    const snippet = typeof item.text === "string" && item.text.length > 0 ? item.text.slice(0, 1000) : void 0;
    sources.push({
      url: item.url,
      ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
      ...(snippet !== void 0 ? { snippet } : {}),
    });
  }
  return { sources, truncated: false };
}
// DeepSeek search: Anthropic-compatible Messages API with web_search_20250305.
async function deepseekSearch(model, apiKey, request, signal) {
  const baseURL = model.baseURL || "https://api.deepseek.com/anthropic/v1";
  const body = {
    model: model.model,
    max_tokens: Number.isFinite(Number(model.maxTokens)) && Number(model.maxTokens) > 0 ? Number(model.maxTokens) : 4096,
    messages: [{ role: "user", content: [{ type: "text", text: `Perform a web search for the query: ${request.query}` }] }],
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: Number.isFinite(Number(model.maxUses)) && Number(model.maxUses) > 0 ? Number(model.maxUses) : 5 }],
  };
  const parsed = await fetchJson(baseURL.replace(/\/$/, "") + "/messages", {
    method: "POST",
    redirect: "error",
    headers: {
      "x-api-key": apiKey,
      "authorization": `Bearer ${apiKey}`,
      "anthropic-version": model.apiVersion || "2023-06-01",
      "content-type": "application/json",
      "accept": "application/json",
      "user-agent": "deepseek-harness/0.0.1",
    },
    body: JSON.stringify(body),
  }, signal);
  return mapAnthropicSearchResponse(parsed);
}
// Brave Search: GET /res/v1/web/search with X-Subscription-Token.
async function braveSearch(model, apiKey, request, signal) {
  const base = String(model.baseURL || "https://api.search.brave.com").replace(/\/$/, "");
  const count = Number.isFinite(Number(request.maxResults)) && Number(request.maxResults) > 0 ? Number(request.maxResults) : 5;
  const url = base + "/res/v1/web/search?q=" + encodeURIComponent(request.query) + "&count=" + count;
  const parsed = await fetchJson(url, {
    method: "GET",
    headers: {
      "X-Subscription-Token": apiKey,
      "accept": "application/json",
      "user-agent": "deepseek-harness/0.0.1",
    },
  }, signal);
  const results = parsed && parsed.web && Array.isArray(parsed.web.results) ? parsed.web.results : [];
  const sources = [];
  const seen = new Set();
  for (const item of results) {
    if (!item || typeof item.url !== "string" || item.url.length === 0 || seen.has(item.url)) continue;
    seen.add(item.url);
    sources.push({
      url: item.url,
      ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
      ...(typeof item.description === "string" && item.description.length > 0 ? { snippet: item.description } : {}),
    });
  }
  return { sources, truncated: false };
}
// Bing Web Search: GET /v7.0/search with Ocp-Apim-Subscription-Key.
async function bingSearch(model, apiKey, request, signal) {
  const base = String(model.baseURL || "https://api.bing.microsoft.com").replace(/\/$/, "");
  const count = Number.isFinite(Number(request.maxResults)) && Number(request.maxResults) > 0 ? Number(request.maxResults) : 5;
  const url = base + "/v7.0/search?q=" + encodeURIComponent(request.query) + "&count=" + count;
  const parsed = await fetchJson(url, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "accept": "application/json",
      "user-agent": "deepseek-harness/0.0.1",
    },
  }, signal);
  const results = parsed && parsed.webPages && Array.isArray(parsed.webPages.value) ? parsed.webPages.value : [];
  const sources = [];
  const seen = new Set();
  for (const item of results) {
    if (!item || typeof item.url !== "string" || item.url.length === 0 || seen.has(item.url)) continue;
    seen.add(item.url);
    sources.push({
      url: item.url,
      ...(typeof item.name === "string" && item.name.length > 0 ? { title: item.name } : {}),
      ...(typeof item.snippet === "string" && item.snippet.length > 0 ? { snippet: item.snippet } : {}),
    });
  }
  return { sources, truncated: false };
}
// Tavily Search: POST /search with Bearer auth.
async function tavilySearch(model, apiKey, request, signal) {
  const base = String(model.baseURL || "https://api.tavily.com").replace(/\/$/, "");
  const count = Number.isFinite(Number(request.maxResults)) && Number(request.maxResults) > 0 ? Number(request.maxResults) : 5;
  const parsed = await fetchJson(base + "/search", {
    method: "POST",
    redirect: "error",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json",
      "accept": "application/json",
      "user-agent": "deepseek-harness/0.0.1",
    },
    body: JSON.stringify({ query: request.query, max_results: count }),
  }, signal);
  const results = parsed && Array.isArray(parsed.results) ? parsed.results : [];
  const sources = [];
  const seen = new Set();
  for (const item of results) {
    if (!item || typeof item.url !== "string" || item.url.length === 0 || seen.has(item.url)) continue;
    seen.add(item.url);
    sources.push({
      url: item.url,
      ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
      ...(typeof item.content === "string" && item.content.length > 0 ? { snippet: item.content } : {}),
    });
  }
  return { sources, truncated: false };
}
// Firecrawl: POST /v1/search with Bearer auth.
async function firecrawlSearch(model, apiKey, request, signal) {
  const base = String(model.baseURL || "https://api.firecrawl.dev").replace(/\/$/, "");
  const count = Number.isFinite(Number(request.maxResults)) && Number(request.maxResults) > 0 ? Number(request.maxResults) : 5;
  const parsed = await fetchJson(base + "/v1/search", {
    method: "POST",
    redirect: "error",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json",
      "accept": "application/json",
      "user-agent": "deepseek-harness/0.0.1",
    },
    body: JSON.stringify({ query: request.query, limit: count }),
  }, signal);
  const results = parsed && Array.isArray(parsed.data) ? parsed.data : [];
  const sources = [];
  const seen = new Set();
  for (const item of results) {
    if (!item || typeof item.url !== "string" || item.url.length === 0 || seen.has(item.url)) continue;
    seen.add(item.url);
    const snippet = typeof item.description === "string" && item.description.length > 0 ? item.description : (typeof item.content === "string" ? item.content : "");
    sources.push({
      url: item.url,
      ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
      ...(snippet.length > 0 ? { snippet } : {}),
    });
  }
  return { sources, truncated: false };
}
// One provider instance serving the currently selected search model.
function createSearchProvider(credentialsSvc) {
  return {
    id: "dshm-search",
    available() {
      return currentSearchModel() !== null;
    },
    async search(request, signal) {
      const model = currentSearchModel();
      if (!model) throw new Error("no search model configured");
      const apiKey = await resolveSearchApiKey(credentialsSvc, model);
      if (!apiKey) throw new Error(`search has no API key configured for "${model.label || model.id}"`);
      const type = model.type || "deepseek";
      if (type === "exa") return exaSearch(model, apiKey, request, signal);
      if (type === "brave") return braveSearch(model, apiKey, request, signal);
      if (type === "bing") return bingSearch(model, apiKey, request, signal);
      if (type === "tavily") return tavilySearch(model, apiKey, request, signal);
      if (type === "firecrawl") return firecrawlSearch(model, apiKey, request, signal);
      return deepseekSearch(model, apiKey, request, signal);
    },
  };
}
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
// ---------- message edit / delete / regenerate (branch-based) ----------
// Based on the event-sourced approach of the dsh-message-edit plugin: history
// is append-only, so every edit/delete/regenerate forks a new session version
// from a closed turn boundary instead of rewriting the log.

function closedTurns(events) {
  const result = [];
  let current = undefined;
  for (const event of events) {
    if (event.type === "turn/start") {
      current = { turn: event.data.turn, startSeq: event.seq, assistants: [] };
      continue;
    }
    if (current === undefined) continue;
    if (event.type === "user/message" && current.user === undefined && event.data && event.data.source && event.data.source.kind === "user") {
      current.user = event;
      continue;
    }
    if (event.type === "assistant/message" && event.data.turn === current.turn) {
      current.assistants.push(event);
      continue;
    }
    if (event.type === "turn/end" && event.data.turn === current.turn) {
      result.push({ ...current, endSeq: event.seq });
      current = undefined;
    }
  }
  return result;
}

function isTextualBlock(block) {
  return block && (block.type === "text" || block.type === "reasoning");
}

function userText(message) {
  return (message.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

function cloneUser(message, content) {
  return Object.freeze({
    id: randomUUID(),
    role: "user",
    content: Object.freeze(content !== undefined ? content : structuredClone(message.content)),
    source: Object.freeze({ kind: "user" }),
  });
}

function replaceTextBlock(content, blockIndex, text) {
  const block = content[blockIndex];
  if (!isTextualBlock(block)) throw new Error("selected block is not editable text");
  return content.map((candidate, index) => index === blockIndex
    ? { ...candidate, text }
    : structuredClone(candidate));
}

// Replace the ENTIRE message text: all text/reasoning blocks collapse into one
// text block carrying the edited text; non-textual blocks (e.g. images) stay.
function replaceMessageText(content, text) {
  let replaced = false;
  const next = [];
  for (const block of content) {
    if (isTextualBlock(block)) {
      if (!replaced) { next.push({ type: "text", text }); replaced = true; }
    } else {
      next.push(structuredClone(block));
    }
  }
  if (!replaced) throw new Error("message has no editable text");
  return next;
}

// Edit an assistant message in place: keep every reasoning block as-is (so the
// thinking/reply structure survives) and collapse the response text blocks
// into one edited text block.
function replaceResponseText(content, text) {
  let replaced = false;
  const next = [];
  for (const block of content) {
    if (block.type === "text") {
      if (!replaced) { next.push({ type: "text", text }); replaced = true; }
    } else {
      next.push(structuredClone(block));
    }
  }
  if (!replaced) throw new Error("assistant message has no response text");
  return next;
}

// The seq of the last closed turn boundary, or -1 when nothing is closed.
function lastClosedEnd(events) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    if (events[index].type === "turn/end") return events[index].seq;
  }
  return -1;
}

function downstreamUsers(turns, start) {
  return turns.slice(start).flatMap((turn) => turn.user === undefined ? [] : [cloneUser(turn.user.data)]);
}

function assistantReplacement(event, text) {
  const replaced = replaceMessageText(event.data.message.content, text);
  return Object.freeze({
    id: randomUUID(),
    role: "assistant",
    content: Object.freeze(replaced),
    source: Object.freeze({
      kind: "model",
      provider: event.data.message.source.provider,
      model: event.data.message.source.model,
    }),
  });
}

function editableMessages(turns) {
  const result = [];
  for (const turn of turns) {
    if (turn.user !== undefined) {
      const texts = turn.user.data.content.filter((b) => b.type === "text").map((b) => b.text);
      if (texts.length > 0) {
        result.push({
          key: `${turn.user.seq}:all`,
          turn: turn.turn,
          eventSeq: turn.user.seq,
          blockIndex: -1,
          kind: "user",
          text: texts.join("\n\n"),
          time: turn.user.time,
        });
      }
    }
    for (const event of turn.assistants) {
      // Only the RESPONSE text is editable in place: reasoning blocks are
      // preserved as-is on save, so the thinking/reply structure survives.
      const texts = event.data.message.content.filter((b) => b.type === "text").map((b) => b.text);
      if (texts.length === 0) continue;
      result.push({
        key: `${event.seq}:all`,
        turn: turn.turn,
        eventSeq: event.seq,
        messageId: event.data.message.id,
        blockIndex: -1,
        kind: "assistant.response",
        text: texts.join("\n\n"),
        time: event.time,
      });
    }
  }
  return result;
}

// Plans: each returns { boundary, queuedUsers, manualTurn? }.
function editPlan(operation, turns) {
  const turnIndex = turns.findIndex((t) => operation.eventSeq > t.startSeq && operation.eventSeq < t.endSeq);
  const turn = turns[turnIndex];
  if (turn === undefined) throw new Error("message does not belong to a closed turn");
  const event = turn.user && turn.user.seq === operation.eventSeq ? turn.user : turn.assistants.find((c) => c.seq === operation.eventSeq);
  if (event === undefined) throw new Error("message not found or not editable");
  if (event.type === "user/message") {
    const edited = cloneUser(event.data, replaceMessageText(event.data.content, operation.text));
    return { boundary: turn.startSeq - 1, queuedUsers: [edited] };
  }
  if (turn.user === undefined) throw new Error("assistant message has no rebuildable user input");
  // Editing an assistant message = copy the WHOLE session and swap in the new
  // response text: tool calls, their results, reasoning blocks and every later
  // turn all stay intact. Only this one event's message content changes.
  return { mode: "copy-edit", targetSeq: event.seq, text: operation.text };
}

function deletePlan(operation, turns) {
  const turnIndex = turns.findIndex((t) => operation.eventSeq > t.startSeq && operation.eventSeq < t.endSeq);
  const turn = turns[turnIndex];
  if (turn === undefined) throw new Error("message does not belong to a closed turn");
  const event = turn.user && turn.user.seq === operation.eventSeq ? turn.user : turn.assistants.find((c) => c.seq === operation.eventSeq);
  if (event === undefined) throw new Error("message not found");
  if (event.type === "user/message") {
    // Delete a user message = drop it and everything after (boundary before its turn).
    return { boundary: turn.startSeq - 1, queuedUsers: [] };
  }
  // Delete an assistant message = rebuild the turn from its user input (regenerate).
  if (turn.user === undefined) throw new Error("assistant message has no rebuildable user input");
  return { boundary: turn.startSeq - 1, queuedUsers: [cloneUser(turn.user.data)] };
}

function rerollPlan(turns) {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (turn === undefined || turn.user === undefined) continue;
    const target = turn.assistants.findLast((e) => e.data.message.content.some(isTextualBlock));
    if (target === undefined) continue;
    return { boundary: turn.startSeq - 1, queuedUsers: [cloneUser(turn.user.data)] };
  }
  throw new Error("no completed assistant reply to regenerate");
}

function planOperation(operation, events) {
  const turns = closedTurns(events);
  if (operation.action === "edit") return editPlan(operation, turns);
  if (operation.action === "delete") return deletePlan(operation, turns);
  if (operation.action === "reroll") return rerollPlan(turns);
  throw new Error("unknown action: " + operation.action);
}

function agentOptions(events) {
  const config = events.findLast((e) => e.type === "request/header")?.data?.header?.config;
  const provider = config?.provider;
  const model = config?.model;
  if (!provider || !model) throw new Error("cannot resolve model route from session history");
  return { provider, model, ...(config.maxTokens !== undefined ? { maxTokens: config.maxTokens } : {}) };
}

function sessionPreset(session) {
  for (let i = session.events.length - 1; i >= 0; i -= 1) {
    const e = session.events[i];
    if (e && e.type === "agent-preset/selected") return e.data.agentPreset;
  }
  return session.header.agentPreset;
}

function inheritedSeed(source, boundary) {
  if (boundary === -1) return [];
  const boundaryEvent = source.events[boundary];
  if (boundary < 0 || boundaryEvent === undefined || boundaryEvent.seq !== boundary) {
    throw new Error("branch boundary is not a contiguous session event");
  }
  return source.events.slice(0, boundary + 1);
}

function appendLogEvent(events, type, data) {
  events.push({ type, seq: events.length, time: Date.now(), data });
}
function appendSurfaceEvent(events, type, data, intent) {
  events.push({
    type, seq: events.length, time: Date.now(), data,
    surfaceOp: intent.surfaceOp,
    ...(intent.sourceEventSeqs !== undefined ? { sourceEventSeqs: intent.sourceEventSeqs } : {}),
  });
}
function appendManualTurn(events, manual) {
  const { turn, user, assistant } = manual;
  appendLogEvent(events, "turn/start", { turn });
  appendSurfaceEvent(events, "user/message", user, { surfaceOp: "append" });
  appendLogEvent(events, "step/start", { turn, step: 1 });
  appendSurfaceEvent(events, "assistant/message", { turn, step: 1, message: assistant }, { surfaceOp: "append", sourceEventSeqs: [] });
  appendLogEvent(events, "step/end", { turn, step: 1 });
  appendLogEvent(events, "turn/end", { turn, reason: { kind: "completed" } });
}

function versionSeed(source, plan) {
  if (plan.mode === "copy-edit") {
    // Whole-session copy with one assistant message edited in place: clone
    // every closed event, swap the target message's content, keep seqs.
    const end = lastClosedEnd(source.events);
    if (end < 0) throw new Error("session has no closed turn to copy");
    const events = source.events.slice(0, end + 1).map((event) => {
      if (event.seq !== plan.targetSeq) return event;
      return Object.freeze({
        ...event,
        data: Object.freeze({
          ...event.data,
          message: Object.freeze({
            ...event.data.message,
            content: Object.freeze(replaceResponseText(event.data.message.content, plan.text)),
          }),
        }),
      });
    });
    return { events, inheritedLength: events.length };
  }
  const events = inheritedSeed(source, plan.boundary);
  const inheritedLength = events.length;
  if (plan.manualTurn !== undefined) appendManualTurn(events, plan.manualTurn);
  return { events, inheritedLength };
}

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

  // Multi-model web search: one provider serving the selected search model.
  // The composition patches the `web` row to `searchProvider: dshm-search`.
  const webSvc = ctx.get("web");
  let disposeSearchProvider = null;
  if (webSvc !== void 0 && typeof webSvc.registerSearchProvider === "function") {
    try { disposeSearchProvider = webSvc.registerSearchProvider(createSearchProvider(credentials)); } catch (_e) { disposeSearchProvider = null; }
  }

  // /api/dshm/search-models — one exact route (the webserver's exact table
  // is keyed by path only, so GET and POST must share a single registration).
  const searchModelsHandler = async (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.method === "GET" || req.method === "HEAD") {
      res.writeHead(200);
      res.end(JSON.stringify({ models: searchConfig.models, current: searchConfig.current }));
      return;
    }
    if (req.method === "POST") {
      try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      const sanitize = (m) => (m && typeof m === "object" ? {
        id: typeof m.id === "string" && m.id.trim() ? m.id.trim() : "search-" + Math.random().toString(36).slice(2, 8),
        label: typeof m.label === "string" && m.label.trim() ? m.label.trim() : (m.type === "exa" ? "Exa" : m.type === "brave" ? "Brave" : m.type === "bing" ? "Bing" : m.type === "tavily" ? "Tavily" : m.type === "firecrawl" ? "Firecrawl" : m.model || "Search model"),
        type: m.type === "exa" ? "exa" : m.type === "brave" ? "brave" : m.type === "bing" ? "bing" : m.type === "tavily" ? "tavily" : m.type === "firecrawl" ? "firecrawl" : "deepseek",
        apiKey: typeof m.apiKey === "string" && m.apiKey.trim() ? m.apiKey.trim() : void 0,
        apiKeyEnv: typeof m.apiKeyEnv === "string" && m.apiKeyEnv.trim() ? m.apiKeyEnv.trim() : "DEEPSEEK_API_KEY",
        model: typeof m.model === "string" && m.model.trim() ? m.model.trim() : "",
        baseURL: typeof m.baseURL === "string" && m.baseURL.trim() ? m.baseURL.trim() : void 0,
        apiVersion: typeof m.apiVersion === "string" && m.apiVersion.trim() ? m.apiVersion.trim() : "2023-06-01",
        maxTokens: Number.isFinite(Number(m.maxTokens)) && Number(m.maxTokens) > 0 ? Number(m.maxTokens) : 4096,
        maxUses: Number.isFinite(Number(m.maxUses)) && Number(m.maxUses) > 0 ? Number(m.maxUses) : 5,
      } : null);
      if (Array.isArray(body.models)) {
        // Exa models carry no `model` name (Exa has no model concept); accept
        // them, but DeepSeek models must still name a model.
        // Only DeepSeek requires a model name; Exa/Brave/Bing/Tavily/Firecrawl
        // are model-less services identified by their name + API key.
        const models = body.models.map(sanitize).filter((m) => m !== null && (m.model.length > 0 || m.type !== "deepseek"));
        if (models.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "at least one search model with a model name is required" }));
          return;
        }
        const seen = new Set();
        for (const m of models) {
          if (seen.has(m.id)) { m.id = m.id + "-" + Math.random().toString(36).slice(2, 6); }
          seen.add(m.id);
        }
        searchConfig = { models, current: searchConfig.current };
      }
      if (typeof body.current === "string" && searchConfig.models.some((m) => m.id === body.current)) {
        searchConfig.current = body.current;
      } else if (Array.isArray(body.models) && !searchConfig.models.some((m) => m.id === searchConfig.current)) {
        searchConfig.current = searchConfig.models[0].id;
      }
      saveSearchConfig();
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, models: searchConfig.models, current: searchConfig.current }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
      }
      return;
    }
    res.writeHead(405);
    res.end(JSON.stringify({ error: "method not allowed" }));
  };
  const disposeSearchModels = webServer.register({ kind: "exact", path: "/api/dshm/search-models", handler: searchModelsHandler });

  // ---------- message edit / delete / regenerate ----------
  async function withSourceAgent(sessionId, operation) {
    const agents = ctx.get("agents");
    const sessionQuery = ctx.get("sessionQuery");
    let handle = undefined;
    let agent = agents ? agents.get(sessionId) : undefined;
    if (agent === undefined) {
      if (!agents || !sessionQuery) throw new Error("agents/sessionQuery unavailable");
      const snapshot = await sessionQuery.readSession(sessionId);
      handle = await agents.resume({ resumeSessionId: sessionId, agentOptions: agentOptions(snapshot.events) });
      agent = handle.agent;
    }
    try {
      return await agent.runMaintenance(async () => operation(agent));
    } finally {
      if (handle !== undefined) await handle.dispose();
    }
  }

  async function createVersionAgent(source, childId, plan, options) {
    const agents = ctx.get("agents");
    const sessions = ctx.get("sessions");
    const presets = ctx.get("agentPresets");
    const seed = versionSeed(source, plan);
    const presetId = sessionPreset(source);
    let agentPreset = undefined;
    let setup = undefined;
    if (presets !== undefined && presetId !== undefined) {
      const resolved = (await presets.resolve(presetId)).id;
      agentPreset = resolved;
      setup = async (agentCtx) => { await presets.mount(agentCtx, resolved); };
    }
    const child = await agents.create({
      sessionId: childId,
      seed: seed.events,
      meta: {
        ...(source.header.cwd !== undefined ? { cwd: source.header.cwd } : {}),
        parentSession: source.id,
        seedLength: seed.inheritedLength,
        ...(agentPreset !== undefined ? { agentPreset } : {}),
      },
      agentOptions: options,
      ...(setup !== undefined ? { setup } : {}),
    });
    try {
      if (sessions !== undefined && typeof sessions.flush === "function") await sessions.flush(child.agent.session);
      return child;
    } catch (error) {
      await child.dispose();
      throw error;
    }
  }

  async function runMessageEditOperation(operation) {
    const sessionId = operation && operation.sessionId;
    if (typeof sessionId !== "string" || sessionId.length === 0) throw new Error("sessionId required");
    return withSourceAgent(sessionId, async (source) => {
      const childId = `session-${randomUUID()}`;
      const events = source.session.events;
      const plan = planOperation(operation, events);
      const options = agentOptions(events);
      const child = await createVersionAgent(source.session, childId, plan, options);
      try {
        if (plan.mode !== "copy-edit") {
          for (const message of plan.queuedUsers) child.agent.followup(message);
        }
        await attachChildToWorkspace(source.session.header.cwd, childId);
        // The edit/delete/regenerate is now a new session: archive the source
        // so the list feels like the message was edited in place instead of
        // stacking fork duplicates.
        await archiveSourceSession(source.session.id);
        return { sessionId: childId, queuedTurns: plan.mode === "copy-edit" ? 0 : plan.queuedUsers.length };
      } catch (error) {
        await child.dispose();
        throw error;
      }
    });
  }

  async function archiveSourceSession(sourceId) {
    const workspaceRegistry = ctx.get("workspaceRegistry");
    if (workspaceRegistry === undefined || typeof workspaceRegistry.archiveSession !== "function") return;
    try { await workspaceRegistry.archiveSession(sourceId); } catch { /* archiving is best-effort */ }
  }

  // New sessions land in "ungrouped" because the workspace registry only
  // indexes headers at startup. Re-parent the child into the source session's
  // workspace (matching by canonical cwd) so it shows under the same group.
  async function attachChildToWorkspace(sourceCwd, childId) {
    if (sourceCwd === undefined) return;
    const workspaceRegistry = ctx.get("workspaceRegistry");
    if (workspaceRegistry === undefined) return;
    let canonical;
    try { canonical = await realpath(sourceCwd); } catch { return; }
    const list = typeof workspaceRegistry.list === "function" ? workspaceRegistry.list() : undefined;
    if (!Array.isArray(list)) return;
    const workspace = list.find((w) => w !== null && w !== undefined && w.path === canonical);
    if (workspace === undefined || typeof workspace.attachSession !== "function") return;
    try { await workspace.attachSession(childId); } catch { /* grouping is best-effort */ }
  }

  const messageEditHandler = async (req, res) => {
    res.setHeader("content-type", "application/json");
    try {
      const url = new URL(req.url || "/", "http://x");
      const sessionId = url.searchParams.get("sessionId") || "";
      if (req.method === "GET" || req.method === "HEAD") {
        if (!sessionId) { res.writeHead(400); res.end(JSON.stringify({ error: "sessionId required" })); return; }
        let events;
        const agents = ctx.get("agents");
        const liveAgent = agents ? agents.get(sessionId) : undefined;
        if (liveAgent !== undefined) {
          events = liveAgent.session.events;
        } else {
          const sessionQuery = ctx.get("sessionQuery");
          if (!sessionQuery) { res.writeHead(404); res.end(JSON.stringify({ error: "session not found" })); return; }
          events = (await sessionQuery.readSession(sessionId)).events;
        }
        res.writeHead(200);
        res.end(JSON.stringify({ messages: editableMessages(closedTurns(events)) }));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const result = await runMessageEditOperation(body);
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, ...result }));
        return;
      }
      res.writeHead(405);
      res.end(JSON.stringify({ error: "method not allowed" }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    }
  };
  const disposeMessageEdit = webServer.register({ kind: "exact", path: "/api/dshm/message-edit", handler: messageEditHandler });

  return () => {
    if (disposeSearchProvider !== null) { try { disposeSearchProvider(); } catch { /* ignore */ } }
    disposeBalances();
    disposeUpload();
    disposeTools();
    disposeToolsConfig();
    disposeSearchModels();
    disposeMessageEdit();
    for (const dispose of toolRestrictions.values()) { try { dispose(); } catch { /* ignore */ } }
    toolRestrictions.clear();
    hostApplied = false;
  };
}

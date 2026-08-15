window.__ModuleLoader__.load({
  id: "@local/dsh-client-ui-mobile",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    let react = require("react");

    // ---------- CSS v7: drawer layout + settings panel mobile fixes ----------
    const CSS = `
    /* Base: mobile-only controls hidden everywhere by default (also keeps the
       header hamburger from rendering unstyled before the detector runs) */
    .dshm-toggle, .dshm-backdrop, .dshm-header-toggle { display: none; }

    /* Drawer takeover - enabled by the JS detector. Open/closed state follows
       the frame's own data-sidebar-collapsed attribute set by the shell. */
    [data-dshm-mobile] { grid-template-columns: 0 minmax(0, 1fr) 0 !important; }

    /* CRITICAL: the sidebar column becomes position:absolute (the drawer) and
       leaves the grid flow; WITHOUT explicit placement the remaining grid items
       auto-place into the wrong columns (center into col 1 = 0px, details into
       col 2 = full width). Pin center -> col 2 and details -> col 3. */
    [data-dshm-mobile] > div:nth-child(2),
    [data-dshm-mobile] .pI_x6G_centerCol { grid-column: 2; grid-row: 1; }
    [data-dshm-mobile] > div:nth-child(3),
    [data-dshm-mobile] .pI_x6G_detailsCol { grid-column: 3; grid-row: 1; }

    /* Sidebar column -> off-canvas left drawer */
    [data-dshm-mobile] > div:first-child {
      position: absolute !important;
      top: 0; bottom: 0; left: 0;
      width: min(88vw, 380px) !important;
      z-index: 30;
      border-right: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 10%));
      box-shadow: 10px 0 28px rgb(0 0 0 / 22%);
      transform: translateX(-105%);
      transition: transform 240ms cubic-bezier(0.32, 0.72, 0, 1);
    }
    [data-dshm-mobile]:not([data-sidebar-collapsed]) > div:first-child { transform: translateX(0); }

    [data-dshm-mobile] .pI_x6G_handle,
    [data-dshm-mobile] [data-side] { display: none !important; }

    /* Backdrop: display:none when closed (zero hit-testing, so taps like the
       stats-line tooltip are never intercepted); fades in when the drawer opens */
    [data-dshm-mobile] .dshm-backdrop { display: none; }
    [data-dshm-mobile]:not([data-sidebar-collapsed]) .dshm-backdrop {
      display: block;
      position: absolute; inset: 0;
      z-index: 25;
      background: rgb(0 0 0 / 45%);
      animation: dshm-fade-in 240ms ease;
    }
    @keyframes dshm-fade-in { from { opacity: 0; } to { opacity: 1; } }

    /* Floating hamburger (hero / no-session screens) */
    [data-dshm-mobile] .dshm-toggle {
      display: inline-flex;
      position: absolute;
      top: calc(10px + env(safe-area-inset-top));
      left: 10px;
      z-index: 26;
      width: 38px; height: 38px;
      align-items: center; justify-content: center;
      border-radius: 10px;
      border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
      background: var(--dsw-alias-bg-layer-1, #ffffff);
      color: var(--dsw-alias-label-primary, #0f1115);
      box-shadow: 0 1px 6px rgb(0 0 0 / 15%);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      padding: 0;
    }
    [data-dshm-mobile] .dshm-toggle:active { background: var(--dsw-alias-bg-layer-2, #f3f4f6); }

    /* Header hamburger (active session) */
    [data-dshm-mobile] .dshm-header-toggle {
      display: inline-flex;
      align-items: center; justify-content: center;
      width: 32px; height: 32px;
      border: none; background: none;
      color: var(--dsw-alias-label-primary, #0f1115);
      border-radius: 8px;
      cursor: pointer;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    [data-dshm-mobile] .dshm-header-toggle:active { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
    /* Header: hamburger sits at the far left edge, session title shifts right */
    [data-dshm-mobile] .wSkVaW_titleRow { position: relative; }
    [data-dshm-mobile] .wSkVaW_titleCluster { padding-left: 40px; }
    [data-dshm-mobile] .dshm-header-toggle {
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
    }

    /* iOS focus zoom guard (any narrow viewport) */
    @media (max-width: 1023px) { textarea { font-size: 16px !important; } }

    /* Settings overlay on mobile: full-screen panel, nav rail becomes a
       horizontal strip on top so the content column keeps the full width
       (fixes "one character per row" and hidden plugin names). */
    [data-dshm-mobile] .VOzbGW_overlay { align-items: stretch !important; }
    [data-dshm-mobile] .VOzbGW_panel {
      width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
      max-height: 100% !important;
      border-radius: 0 !important;
      flex-direction: column !important;
    }
    [data-dshm-mobile] .VOzbGW_nav {
      width: 100% !important;
      flex: none !important;
      flex-direction: row !important;
      gap: 2px !important;
      padding: 8px 10px 0 !important;
      overflow-x: auto !important;
    }
    [data-dshm-mobile] .VOzbGW_navList { flex-direction: row !important; gap: 2px !important; }
    [data-dshm-mobile] .VOzbGW_navCell { flex: none !important; }
    [data-dshm-mobile] .VOzbGW_rail { display: none !important; }
    [data-dshm-mobile] .VOzbGW_content { flex: 1 !important; min-width: 0 !important; min-height: 0 !important; }
    /* Plugin inventory cards stack vertically on mobile */
    [data-dshm-mobile] .qSYn7G_cards { grid-template-columns: 1fr !important; }

    /* Shipped stats line: hidden on mobile (replaced by the collapsible
       dshm-stats icon/panel registered into conversation.composer.dock) */
    [data-dshm-mobile] .FJxK0a_root { display: none !important; }

    /* Collapsible stats (truncated preview + caret -> click to expand full) */
    .dshm-stats { display: none; }
    [data-dshm-mobile] .dshm-stats {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 2px 0 4px;
    }
    [data-dshm-mobile] .dshm-stats-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      max-width: 100%;
      min-width: 0;
      border: none;
      background: none;
      cursor: pointer;
      padding: 3px 10px;
      border-radius: 999px;
      color: var(--dsw-alias-label-tertiary, #81858c);
      font: inherit;
      -webkit-tap-highlight-color: transparent;
    }
    [data-dshm-mobile] .dshm-stats-toggle:active { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
    [data-dshm-mobile] .dshm-stats-preview {
      font-size: 12px;
      line-height: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    [data-dshm-mobile] .dshm-stats-caret { display: inline-flex; flex: none; align-items: center; }
    [data-dshm-mobile] .dshm-stats-full {
      font-size: 12px; line-height: 20px;
      color: var(--dsw-alias-label-tertiary, #81858c);
      text-align: center;
      white-space: normal;
      min-width: 0;
    }

    /* Turn-tail meta row ("09:10 · 用时 1m32s · TTFT …"): the time span itself
       is white-space:nowrap and holds ALL the stats, so let it wrap on mobile
       and let the row wrap its action buttons below the text. Separators
       become compact short vertical bars instead of wide "·" dots. */
    [data-dshm-mobile] .p-xYUq_timeStart,
    [data-dshm-mobile] .p-xYUq_timeEnd {
      white-space: normal !important;
      min-width: 0;
    }
    [data-dshm-mobile] .p-xYUq_timeStart { padding-right: 4px !important; }
    [data-dshm-mobile] .p-xYUq_timeEnd { padding-left: 4px !important; }
    [data-dshm-mobile] .p-xYUq_actions {
      flex-wrap: wrap;
      height: auto;
      min-height: 28px;
      gap: 2px 6px;
    }
    [data-dshm-mobile] .p-xYUq_runTimeDot {
      margin: 0 3px !important;
      font-size: 0 !important;
    }
    [data-dshm-mobile] .p-xYUq_runTimeDot::before {
      content: "|";
      font-size: 12px;
      line-height: 20px;
      color: var(--dsw-alias-label-tertiary, #81858c);
    }

    /* General-settings row: mobile Enter behavior (hidden on desktop so the
       settings surface stays identical to the original) */
    .dshm-enter-row { display: none; }
    [data-dshm-mobile] .dshm-enter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      min-width: 0;
    }
    .dshm-enter-text { min-width: 0; }
    .dshm-enter-title { font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-enter-desc { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c); }
    .dshm-enter-control { display: inline-flex; gap: 6px; flex: none; }
    .dshm-enter-option {
      border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
      background: none;
      color: var(--dsw-alias-label-secondary, #61666b);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 12px;
      line-height: 18px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-enter-option.dshm-enter-active {
      background: var(--dsw-alias-brand-primary, #3964fe);
      border-color: var(--dsw-alias-brand-primary, #3964fe);
      color: #fff;
    }
    `;

    const tagId = "@local/dsh-client-ui-mobile/mobile.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@local/dsh-client-ui-mobile";
      tag.dataset.pluginCss = tagId;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    const inject = ["slots"];

    function apply(ctx) {
      // ---------- mobile detector (UA + viewport + physical-screen) ----------
      const layout = ctx.get("layout");
      const toggle = () => { if (layout !== undefined) layout.toggleSidebar(); };

      let frame = null;
      let ro = null;
      let retries = 0;
      const findFrame = () => (typeof document === "undefined") ? null
        : document.querySelector("[data-details-collapsed], [data-sidebar-collapsed], .pI_x6G_frame");
      const applyMode = () => {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        if (!frame || !frame.isConnected) {
          frame = findFrame();
          if (!frame) {
            // The shell may still be mounting at plugin activation: retry via
            // rAF (capped) until the frame exists.
            if (retries < 150 && typeof requestAnimationFrame !== "undefined") {
              retries += 1;
              requestAnimationFrame(applyMode);
            }
            return;
          }
          retries = 0;
          if (typeof ResizeObserver !== "undefined" && ro === null) {
            ro = new ResizeObserver(() => applyMode());
            ro.observe(frame);
          }
        }
        const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
        const touch = (typeof navigator !== "undefined" && (navigator.maxTouchPoints || 0)) > 0;
        const screenW = (typeof window.screen !== "undefined" && window.screen) ? window.screen.width : 0;
        const innerW = window.innerWidth || 0;
        const mobile =
          innerW <= 1023 ||
          /Android|iPhone|iPod|Mobile/i.test(ua) ||
          (screenW > 0 && screenW <= 480 && touch) ||
          (touch && innerW <= 1280);
        if (mobile) frame.setAttribute("data-dshm-mobile", "");
        else frame.removeAttribute("data-dshm-mobile");
        if (mobile && layout !== undefined) layout.closeDetails();
      };

      // ---------- hamburger icon ----------
      const ICON = react.createElement("svg", {
        width: 18, height: 18, viewBox: "0 0 18 18",
        fill: "none", stroke: "currentColor", strokeWidth: 1.7,
        strokeLinecap: "round", "aria-hidden": true,
      }, react.createElement("path", { d: "M2.5 4.5h13M2.5 9h13M2.5 13.5h13" }));

      // ---------- components ----------
      function Backdrop() {
        return react.createElement("div", {
          className: "dshm-backdrop",
          "data-dshm-backdrop": true,
          onClick: toggle,
          "aria-hidden": true,
        });
      }

      // Floating toggle: hidden while an active (non-blank) session is open,
      // because the session header then provides its own hamburger.
      function FloatingToggle(props) {
        const hasActiveSession =
          typeof props.useSessions === "function" &&
          props.useSessions((st) => {
            const cur = st.current;
            return cur !== void 0 && st.byId[cur] !== void 0 && st.byId[cur].blank === false;
          });
        if (hasActiveSession) return null;
        return react.createElement("button", {
          type: "button",
          className: "dshm-toggle",
          onClick: toggle,
          "aria-label": "打开侧边栏",
          title: "打开侧边栏",
        }, ICON);
      }

      function HeaderToggle() {
        return react.createElement("button", {
          type: "button",
          className: "dshm-header-toggle",
          onClick: toggle,
          "aria-label": "打开侧边栏",
          title: "打开侧边栏",
        }, ICON);
      }

      // ---------- collapsible conversation stats (composer dock) ----------
      function fmtDuration(ms) {
        const s = ms / 1000;
        if (s < 60) return `${Math.round(s * 10) / 10}s`;
        const whole = Math.round(s);
        return `${Math.floor(whole / 60)}m${whole % 60}s`;
      }
      function fmtTokens(n) {
        const scaled = (v) => v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
        if (n < 1000) return String(n);
        if (n < 1000000) return `${scaled(n / 1000)}K`;
        return `${scaled(n / 1000000)}M`;
      }
      function fmtTps(tps) {
        const clamped = Math.max(0, tps);
        return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10);
      }
      function billedInput(usage) {
        return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
      }
      // Minimal fold of chat nodes into turn/step/duration stats (used only when
      // the sessionStats projection is unavailable).
      function deriveStats(nodes) {
        const turns = new Set();
        let steps = 0, llmMs = 0, toolMs = 0, ttftMs = 0, ttftSteps = 0, decodeMs = 0, decodeTokens = 0;
        for (const node of nodes || []) {
          if (node.kind === "tool-result") {
            if (node.callTime !== null) toolMs += Math.max(0, node.time - node.callTime);
            continue;
          }
          if (node.kind !== "assistant") continue;
          turns.add(node.turn);
          steps += 1;
          const timing = node.timing;
          if (timing !== void 0 && timing.stepStartTime !== null) llmMs += Math.max(0, timing.completedTime - timing.stepStartTime);
          const ttft = timing !== void 0 && timing.stepStartTime !== null && timing.firstTokenTime !== null
            ? Math.max(0, timing.firstTokenTime - timing.stepStartTime) : null;
          const decode = timing !== void 0 && timing.firstTokenTime !== null
            ? Math.max(0, timing.completedTime - timing.firstTokenTime) : null;
          if (ttft !== null) { ttftMs += ttft; ttftSteps += 1; }
          if (decode !== null && node.usage) { decodeMs += decode; decodeTokens += (node.usage.outputTokens || 0); }
        }
        return { turns: turns.size, steps, llmMs, toolMs, ttftMs, ttftSteps, decodeMs, decodeTokens };
      }
      function composeStatsLine(stats, usage) {
        const groups = [];
        if (stats !== void 0 && stats !== null && stats.steps > 0) {
          groups.push(`${stats.turns}轮 ${stats.steps}步`);
          const durations = [];
          if (stats.llmMs > 0) durations.push(`LLM ${fmtDuration(stats.llmMs)}`);
          if (stats.toolMs > 0) durations.push(`工具调用 ${fmtDuration(stats.toolMs)}`);
          if (durations.length > 0) groups.push(durations.join(" · "));
          const speeds = [];
          if (stats.ttftSteps > 0) speeds.push(`TTFT ${fmtDuration(stats.ttftMs / stats.ttftSteps)}`);
          if (stats.decodeMs > 0) speeds.push(`${fmtTps(stats.decodeTokens / (stats.decodeMs / 1000))} tok/s`);
          if (speeds.length > 0) groups.push(speeds.join(" · "));
        }
        if (usage !== void 0 && usage !== null && (billedInput(usage) > 0 || usage.outputTokens > 0)) {
          const denom = billedInput(usage);
          const hit = denom === 0 ? null : Math.round(usage.cacheReadTokens / denom * 100);
          if (hit !== null) groups.push(`缓存 ${hit}%`);
          groups.push(`输入 ${fmtTokens(billedInput(usage))} · 输出 ${fmtTokens(usage.outputTokens)}`);
        }
        return groups.join(" | ");
      }

      const CHART_ICON = react.createElement("svg", {
        width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true,
      },
        react.createElement("rect", { x: 2, y: 9, width: 3, height: 5, rx: 0.5 }),
        react.createElement("rect", { x: 6.5, y: 5, width: 3, height: 9, rx: 0.5 }),
        react.createElement("rect", { x: 11, y: 2, width: 3, height: 12, rx: 0.5 }));
      const CHEVRON_UP_ICON = react.createElement("svg", {
        width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor",
        strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
      }, react.createElement("path", { d: "M3 10l5-5 5 5" }));
      const CHEVRON_DOWN_ICON = react.createElement("svg", {
        width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor",
        strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
      }, react.createElement("path", { d: "M3 6l5 5 5-5" }));

      function StatsToggle(props) {
        const [open, setOpen] = react.useState(false);
        const usage = typeof props.useProjection === "function" ? props.useProjection("tokenUsage") : void 0;
        const projected = typeof props.useProjection === "function" ? props.useProjection("sessionStats") : void 0;
        const nodes = typeof props.useSession === "function"
          ? props.useSession((s) => (s && s.chat && s.chat.legacy ? s.chat.legacy.nodes : []))
          : [];
        const stats = projected !== void 0 && projected !== null ? projected : deriveStats(nodes);
        const line = composeStatsLine(stats, usage);
        if (line === "") return null;
        return react.createElement("div", { className: "dshm-stats" },
          react.createElement("button", {
            type: "button",
            className: "dshm-stats-toggle",
            onClick: () => setOpen(!open),
            "aria-expanded": open ? "true" : "false",
            "aria-label": open ? "收起统计" : "展开统计",
            title: open ? "收起统计" : "展开统计",
          },
            react.createElement("span", { className: open ? "dshm-stats-full" : "dshm-stats-preview" }, line),
            react.createElement("span", { className: "dshm-stats-caret" }, open ? CHEVRON_UP_ICON : CHEVRON_DOWN_ICON)));
      }

      // ---------- mobile Enter behavior (General settings + interceptor) ----------
      const ENTER_MODE_KEY = "dshm.enterMode";
      function readEnterMode() {
        try {
          return window.localStorage.getItem(ENTER_MODE_KEY) === "newline" ? "newline" : "send";
        } catch (_e) { return "send"; }
      }
      function writeEnterMode(mode) {
        try { window.localStorage.setItem(ENTER_MODE_KEY, mode); } catch (_e) { /* ignore */ }
      }

      function MobileEnterRow() {
        const [mode, setMode] = react.useState(readEnterMode);
        const choose = (next) => { writeEnterMode(next); setMode(next); };
        return react.createElement("div", { className: "dshm-enter-row" },
          react.createElement("div", { className: "dshm-enter-text" },
            react.createElement("div", { className: "dshm-enter-title" }, "手机端回车键"),
            react.createElement("div", { className: "dshm-enter-desc" }, "手机端按回车时：发送消息，还是插入换行")),
          react.createElement("div", { className: "dshm-enter-control", role: "radiogroup", "aria-label": "手机端回车键行为" },
            react.createElement("button", {
              type: "button",
              className: "dshm-enter-option" + (mode === "send" ? " dshm-enter-active" : ""),
              "aria-pressed": mode === "send",
              onClick: () => choose("send"),
            }, "发送消息"),
            react.createElement("button", {
              type: "button",
              className: "dshm-enter-option" + (mode === "newline" ? " dshm-enter-active" : ""),
              "aria-pressed": mode === "newline",
              onClick: () => choose("newline"),
            }, "插入换行")));
      }

      // ---------- lifecycle ----------
      ctx.effect(() => {
        applyMode();
        const onResize = () => applyMode();
        window.addEventListener("resize", onResize);
        const onLoad = () => applyMode();
        window.addEventListener("load", onLoad);
        const offSlots = ctx.on("slots/changed", () => applyMode());
        return () => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("load", onLoad);
          offSlots();
          if (ro !== null) ro.disconnect();
          if (frame && frame.isConnected) frame.removeAttribute("data-dshm-mobile");
        };
      }, "ui-mobile: detector");

      const slots = ctx.get("slots");
      if (slots === undefined) return;
      ctx.effect(() => {
        // Capture-phase Enter interceptor: when the "手机端回车键" setting is
        // "newline", a plain Enter on the composer textarea inserts a newline
        // instead of submitting. We only stopPropagation (blocking the
        // composer's submit handler) and let the browser perform the native
        // newline insertion, so the caret stays visible and React's onChange
        // still updates the draft through its normal path.
        const onKeyDown = (e) => {
          if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
          if (e.isComposing || e.keyCode === 229) return;
          const el = e.target;
          if (!el || el.tagName !== "TEXTAREA") return;
          if (typeof el.closest !== "function" || !el.closest("[data-input-scroll]")) return;
          if (el.readOnly || el.disabled) return;
          if (readEnterMode() !== "newline") return;
          e.stopPropagation();
        };
        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
      }, "ui-mobile: enter interceptor");

      ctx.effect(() => {
        const off1 = slots.inject("shell.overlay", () => { applyMode(); return slots.register({ name: "shell.overlay", id: "dshm-backdrop", order: -100 }, Backdrop); });
        const off2 = slots.inject("shell.overlay", () => slots.register({ name: "shell.overlay", id: "dshm-hero-toggle", order: -99 }, FloatingToggle));
        const off3 = slots.inject("conversation.session.header.actions", () => slots.register({ name: "conversation.session.header.actions", id: "dshm-header-toggle", order: -20 }, HeaderToggle));
        const off4 = slots.inject("conversation.composer.dock", () => slots.register({ name: "conversation.composer.dock", id: "dshm-stats-toggle", order: 1 }, StatsToggle));
        const off5 = slots.inject("settings.general.item", () => slots.register({ name: "settings.general.item", id: "dshm-enter-mode", order: 30 }, MobileEnterRow));
        return () => { off1(); off2(); off3(); off4(); off5(); };
      }, "ui-mobile: slots");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});

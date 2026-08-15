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
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 12px;
      width: 100%;
      min-width: 0;
    }
    .dshm-enter-text { min-width: 0; flex: 1 1 160px; }
    .dshm-enter-title { font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-enter-desc { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c); }
    .dshm-enter-control { display: inline-flex; flex-wrap: wrap; gap: 6px; flex: 0 1 auto; }
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
      background: var(--dsw-static-neutral-bluish-1000, #0f1115);
      border-color: var(--dsw-static-neutral-bluish-1000, #0f1115);
      color: #fff;
    }

    /* General-settings row: chat background picker + crop dialog */
    .dshm-bg-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 12px;
      width: 100%;
      min-width: 0;
    }
    .dshm-bg-text { min-width: 0; flex: 1 1 160px; }
    .dshm-bg-title { font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-bg-desc { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c); }
    .dshm-bg-control { display: inline-flex; flex-wrap: wrap; gap: 8px; flex: 0 1 auto; }
    .dshm-bg-pick, .dshm-bg-remove {
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 12px;
      line-height: 18px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-bg-pick { border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 12%)); background: none; color: var(--dsw-alias-label-secondary, #61666b); }
    .dshm-bg-remove { border: 1px solid var(--dsw-alias-state-error-primary, #d92d20); background: none; color: var(--dsw-alias-state-error-primary, #d92d20); }
    .dshm-crop-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgb(0 0 0 / 60%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }
    .dshm-crop-dialog {
      width: min(92vw, 480px);
      background: var(--dsw-alias-bg-layer-2, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgb(0 0 0 / 25%);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .dshm-crop-preview {
      position: relative;
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
      touch-action: none;
      cursor: grab;
      background-color: #000;
    }
    .dshm-crop-hint {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 11px;
      background: rgb(0 0 0 / 45%);
      padding: 2px 8px;
      border-radius: 999px;
      pointer-events: none;
    }
    .dshm-crop-zoom { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--dsw-alias-label-secondary, #61666b); }
    .dshm-crop-zoom input { flex: 1; }
    .dshm-crop-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .dshm-crop-cancel, .dshm-crop-apply {
      border: none;
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 13px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-crop-cancel { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-crop-apply { background: var(--dsw-static-neutral-bluish-1000, #0f1115); color: #fff; }

    /* Frosted glass over the chat background (only while a background is set).
       The image is baked (blur applied at save time) and painted as an inline
       background on the chat column; the session header and composer card
       become glass whose opacity is driven by --dshm-glass
       (0 = fully transparent, 0.8 = quite opaque). */
    [data-dshm-bg] .wSkVaW_header,
    [data-dshm-bg] .uV2eYG_card {
      background-color: rgb(255 255 255 / var(--dshm-glass, 0)) !important;
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
    }
    body[data-ds-dark-theme] [data-dshm-bg] .wSkVaW_header,
    body[data-ds-dark-theme] [data-dshm-bg] .uV2eYG_card {
      background-color: rgb(10 12 16 / var(--dshm-glass, 0)) !important;
    }
    /* Belt-and-suspenders: keep the whole composer/stats band free of any
       opaque surface while a chat background is set. */
    [data-dshm-bg] .uV2eYG_root,
    [data-dshm-bg] .wSkVaW_composerSeat,
    [data-dshm-bg] .FJxK0a_root {
      background: transparent !important;
    }
    /* Crop dialog: frosted-glass preview strips (top/bottom of the image) */
    .dshm-crop-glass {
      position: absolute;
      left: 0;
      right: 0;
      height: 48px;
      z-index: 2;
      pointer-events: none;
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
    }
    .dshm-crop-glass-top { top: 0; }
    .dshm-crop-glass-bottom { bottom: 0; }
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

      // ---------- localization (zh / en) ----------
      const locale = ctx.get("locale");
      const NS = "dshm";
      if (locale !== undefined) {
        try {
          locale.register(NS, {
            zh: {
              "openSidebar": "打开侧边栏",
              "collapseStats": "收起统计",
              "expandStats": "展开统计",
              "turnsSteps": "{turns}轮 {steps}步",
              "llm": "LLM {duration}",
              "toolCall": "工具调用 {duration}",
              "ttft": "TTFT {duration}",
              "tps": "{tps} tok/s",
              "cache": "缓存 {percent}%",
              "tokens": "输入 {input} · 输出 {output}",
              "enterTitle": "手机端回车键",
              "enterDesc": "手机端按回车时：发送消息，还是插入换行",
              "send": "发送消息",
              "newline": "插入换行",
              "bgTitle": "聊天背景",
              "bgDesc": "选择图片、裁剪、调节模糊与毛玻璃",
              "pickImage": "选择图片",
              "adjust": "调整",
              "removeBg": "移除背景",
              "dragHint": "拖动图片调整位置",
              "zoom": "缩放",
              "bgBlur": "背景模糊",
              "glass": "毛玻璃",
              "cancel": "取消",
              "apply": "应用",
            },
            en: {
              "openSidebar": "Open sidebar",
              "collapseStats": "Collapse stats",
              "expandStats": "Expand stats",
              "turnsSteps": "{turns} turns · {steps} steps",
              "llm": "LLM {duration}",
              "toolCall": "tools {duration}",
              "ttft": "TTFT {duration}",
              "tps": "{tps} tok/s",
              "cache": "cache {percent}%",
              "tokens": "in {input} · out {output}",
              "enterTitle": "Mobile Enter key",
              "enterDesc": "What pressing Enter does on mobile: send the message or insert a newline",
              "send": "Send message",
              "newline": "Insert newline",
              "bgTitle": "Chat background",
              "bgDesc": "Pick an image, crop it, tune blur and frosted glass",
              "pickImage": "Choose image",
              "adjust": "Adjust",
              "removeBg": "Remove background",
              "dragHint": "Drag the image to position it",
              "zoom": "Zoom",
              "bgBlur": "Image blur",
              "glass": "Frosted glass",
              "cancel": "Cancel",
              "apply": "Apply",
            },
          });
        } catch (_e) { /* namespace already registered (re-apply) */ }
      }
      const t = locale !== undefined ? locale.bind(NS) : (key) => key;
      const emptyLocaleSubscribe = () => () => {};
      function useLocaleTick() {
        return react.useSyncExternalStore(
          locale !== undefined ? (fn) => locale.subscribe(fn) : emptyLocaleSubscribe,
          locale !== undefined ? () => locale.getSnapshot().active : () => "en",
        );
      }

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
        useLocaleTick();
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
          "aria-label": t("openSidebar"),
          title: t("openSidebar"),
        }, ICON);
      }

      function HeaderToggle() {
        useLocaleTick();
        return react.createElement("button", {
          type: "button",
          className: "dshm-header-toggle",
          onClick: toggle,
          "aria-label": t("openSidebar"),
          title: t("openSidebar"),
        }, ICON);
      }

      // Invisible keeper: re-applies the saved chat background whenever the
      // active session changes (the conversation root remounts on switch, so
      // inline styles are lost; slots/changed does NOT fire on session switch).
      function BgSync(props) {
        const current = typeof props.useSessions === "function"
          ? props.useSessions((st) => st.current)
          : null;
        react.useEffect(() => {
          if (typeof requestAnimationFrame !== "undefined") {
            requestAnimationFrame(() => requestAnimationFrame(() => syncBg()));
          } else {
            syncBg();
          }
        }, [current]);
        return null;
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
          groups.push(t("turnsSteps", { turns: stats.turns, steps: stats.steps }));
          const durations = [];
          if (stats.llmMs > 0) durations.push(t("llm", { duration: fmtDuration(stats.llmMs) }));
          if (stats.toolMs > 0) durations.push(t("toolCall", { duration: fmtDuration(stats.toolMs) }));
          if (durations.length > 0) groups.push(durations.join(" · "));
          const speeds = [];
          if (stats.ttftSteps > 0) speeds.push(t("ttft", { duration: fmtDuration(stats.ttftMs / stats.ttftSteps) }));
          if (stats.decodeMs > 0) speeds.push(t("tps", { tps: fmtTps(stats.decodeTokens / (stats.decodeMs / 1000)) }));
          if (speeds.length > 0) groups.push(speeds.join(" · "));
        }
        if (usage !== void 0 && usage !== null && (billedInput(usage) > 0 || usage.outputTokens > 0)) {
          const denom = billedInput(usage);
          const hit = denom === 0 ? null : Math.round(usage.cacheReadTokens / denom * 100);
          if (hit !== null) groups.push(t("cache", { percent: hit }));
          groups.push(t("tokens", { input: fmtTokens(billedInput(usage)), output: fmtTokens(usage.outputTokens) }));
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
        useLocaleTick();
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
            "aria-label": open ? t("collapseStats") : t("expandStats"),
            title: open ? t("collapseStats") : t("expandStats"),
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
        useLocaleTick();
        const [mode, setMode] = react.useState(readEnterMode);
        const choose = (next) => { writeEnterMode(next); setMode(next); };
        return react.createElement("div", { className: "dshm-enter-row" },
          react.createElement("div", { className: "dshm-enter-text" },
            react.createElement("div", { className: "dshm-enter-title" }, t("enterTitle")),
            react.createElement("div", { className: "dshm-enter-desc" }, t("enterDesc"))),
          react.createElement("div", { className: "dshm-enter-control", role: "radiogroup", "aria-label": t("enterTitle") },
            react.createElement("button", {
              type: "button",
              className: "dshm-enter-option" + (mode === "send" ? " dshm-enter-active" : ""),
              "aria-pressed": mode === "send",
              onClick: () => choose("send"),
            }, t("send")),
            react.createElement("button", {
              type: "button",
              className: "dshm-enter-option" + (mode === "newline" ? " dshm-enter-active" : ""),
              "aria-pressed": mode === "newline",
              onClick: () => choose("newline"),
            }, t("newline"))));
      }

      // ---------- chat background (Appearance: pick + crop an image) ----------
      const BG_KEY = "dshm.chatBg";
      function readBg() {
        try {
          const raw = window.localStorage.getItem(BG_KEY);
          if (!raw) return null;
          const v = JSON.parse(raw);
          if (!v || typeof v.dataUrl !== "string") return null;
          return v;
        } catch (_e) { return null; }
      }
      function writeBg(cfg) {
        try {
          if (cfg) window.localStorage.setItem(BG_KEY, JSON.stringify(cfg));
          else window.localStorage.removeItem(BG_KEY);
        } catch (_e) { /* storage unavailable */ }
      }
      function chatRoot() {
        if (typeof document === "undefined") return null;
        // Always resolve the CURRENT visible conversation root: sessions are
        // re-rendered/remounted on switch, so a cached element would leave the
        // background stuck on a stale root.
        const roots = Array.from(document.querySelectorAll("[data-phase], .wSkVaW_root"));
        for (const el of roots) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) return el;
        }
        return roots[0] || null;
      }
      function syncBg() {
        const saved = readBg();
        const root = chatRoot();
        if (!saved || !root) return;
        applyBg(saved);
      }
      function blurDataUrl(dataUrl, blurPx) {
        return new Promise((resolve) => {
          if (!blurPx || blurPx <= 0) { resolve(dataUrl); return; }
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const c = canvas.getContext("2d");
              c.filter = `blur(${blurPx}px)`;
              c.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.72));
            } catch (_e) { resolve(dataUrl); }
          };
          img.onerror = () => resolve(dataUrl);
          img.src = dataUrl;
        });
      }
      async function applyBg(cfg) {
        const root = chatRoot();
        if (!root) return;
        const dataUrl = await blurDataUrl(cfg.dataUrl, cfg.blur || 0);
        root.setAttribute("data-dshm-bg", "");
        root.style.setProperty("--dshm-glass", String(cfg.glass || 0));
        root.style.backgroundImage = `url("${dataUrl}")`;
        root.style.backgroundSize = `${cfg.zoom}%`;
        root.style.backgroundPosition = `${cfg.x}% ${cfg.y}%`;
        root.style.backgroundRepeat = "no-repeat";
        // remove any leftover layer from an older version
        const layer = root.querySelector("[data-dshm-bglayer]");
        if (layer) layer.remove();
      }
      function removeBg() {
        // Clear every conversation root we may have touched so removal takes
        // effect immediately without a reload.
        if (typeof document === "undefined") return;
        document.querySelectorAll("[data-phase], .wSkVaW_root").forEach((el) => {
          el.removeAttribute("data-dshm-bg");
          el.style.removeProperty("--dshm-glass");
          el.style.backgroundImage = "";
          el.style.backgroundSize = "";
          el.style.backgroundPosition = "";
          el.style.backgroundRepeat = "";
          const layer = el.querySelector("[data-dshm-bglayer]");
          if (layer) layer.remove();
        });
      }
      function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
      function downscaleDataUrl(dataUrl, maxDim, quality) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            try {
              const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
              const w = Math.max(1, Math.round(img.width * scale));
              const h = Math.max(1, Math.round(img.height * scale));
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const c = canvas.getContext("2d");
              c.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", quality));
            } catch (_e) { resolve(null); }
          };
          img.onerror = () => resolve(null);
          img.src = dataUrl;
        });
      }

      function CropDialog({ crop, onCancel, onApply }) {
        useLocaleTick();
        const [zoom, setZoom] = react.useState(crop.zoom);
        const [pos, setPos] = react.useState({ x: crop.x, y: crop.y });
        const [blur, setBlur] = react.useState(crop.blur || 0);
        const [glass, setGlass] = react.useState(crop.glass || 0);
        const previewRef = react.useRef(null);
        const drag = react.useRef(null);
        // Match the preview aspect to the real chat column so the crop frame is honest.
        let ar = 9 / 16;
        try {
          const col = chatRoot();
          if (col) {
            const r = col.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) ar = r.width / r.height;
          }
        } catch (_e) { /* ignore */ }
        const onPointerDown = (e) => {
          const el = previewRef.current;
          if (!el) return;
          drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
          try { el.setPointerCapture(e.pointerId); } catch (_e) { /* ignore */ }
          e.preventDefault();
        };
        const onPointerMove = (e) => {
          const el = previewRef.current;
          const d = drag.current;
          if (!el || !d) return;
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          const dx = ((e.clientX - d.px) / rect.width) * 100;
          const dy = ((e.clientY - d.py) / rect.height) * 100;
          setPos({ x: clamp(d.x + dx, 0, 100), y: clamp(d.y + dy, 0, 100) });
        };
        const onPointerUp = (e) => {
          drag.current = null;
          const el = previewRef.current;
          if (el && el.hasPointerCapture(e.pointerId)) {
            try { el.releasePointerCapture(e.pointerId); } catch (_e) { /* ignore */ }
          }
        };
        const glassColor = `rgb(255 255 255 / ${glass})`;
        return react.createElement("div", { className: "dshm-crop-overlay" },
          react.createElement("div", { className: "dshm-crop-dialog" },
            react.createElement("div", {
              ref: previewRef,
              className: "dshm-crop-preview",
              style: {
                aspectRatio: String(ar),
                backgroundImage: `url("${crop.dataUrl}")`,
                backgroundSize: `${zoom}%`,
                backgroundPosition: `${pos.x}% ${pos.y}%`,
                backgroundRepeat: "no-repeat",
                filter: `blur(${blur}px) saturate(1.3)`,
              },
              onPointerDown,
              onPointerMove,
              onPointerUp,
              onPointerCancel: onPointerUp,
            },
              react.createElement("div", { className: "dshm-crop-hint" }, t("dragHint")),
              react.createElement("div", { className: "dshm-crop-glass dshm-crop-glass-top", style: { backgroundColor: glassColor } }),
              react.createElement("div", { className: "dshm-crop-glass dshm-crop-glass-bottom", style: { backgroundColor: glassColor } })),
            react.createElement("div", { className: "dshm-crop-zoom" },
              react.createElement("label", null, t("zoom")),
              react.createElement("input", {
                type: "range", min: 100, max: 300, step: 5,
                value: zoom,
                onChange: (e) => setZoom(Number(e.target.value)),
              })),
            react.createElement("div", { className: "dshm-crop-zoom" },
              react.createElement("label", null, t("bgBlur")),
              react.createElement("input", {
                type: "range", min: 0, max: 20, step: 1,
                value: blur,
                onChange: (e) => setBlur(Number(e.target.value)),
              })),
            react.createElement("div", { className: "dshm-crop-zoom" },
              react.createElement("label", null, t("glass")),
              react.createElement("input", {
                type: "range", min: 0, max: 80, step: 5,
                value: Math.round(glass * 100),
                onChange: (e) => setGlass(Number(e.target.value) / 100),
              })),
            react.createElement("div", { className: "dshm-crop-actions" },
              react.createElement("button", { type: "button", className: "dshm-crop-cancel", onClick: onCancel }, t("cancel")),
              react.createElement("button", { type: "button", className: "dshm-crop-apply", onClick: () => onApply({ ...crop, zoom, x: pos.x, y: pos.y, blur, glass }) }, t("apply")))));
      }

      function BackgroundRow() {
        useLocaleTick();
        const fileRef = react.useRef(null);
        const [bg, setBg] = react.useState(readBg);
        const [crop, setCrop] = react.useState(null);
        const pick = (e) => {
          const file = e.target.files && e.target.files[0];
          e.target.value = "";
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = String(reader.result);
            const small = await downscaleDataUrl(dataUrl, 1280, 0.72);
            if (small) setCrop({ dataUrl: small, zoom: 100, x: 50, y: 50, blur: 0, glass: 0 });
          };
          reader.readAsDataURL(file);
        };
        const apply = (cfg) => { writeBg(cfg); setBg(cfg); setCrop(null); applyBg(cfg); };
        const remove = () => { writeBg(null); setBg(null); removeBg(); };
        const adjust = () => { const cur = readBg(); if (cur) setCrop({ ...cur }); };
        return react.createElement(react.Fragment, null,
          react.createElement("div", { className: "dshm-bg-row" },
            react.createElement("div", { className: "dshm-bg-text" },
              react.createElement("div", { className: "dshm-bg-title" }, t("bgTitle")),
              react.createElement("div", { className: "dshm-bg-desc" }, t("bgDesc"))),
            react.createElement("div", { className: "dshm-bg-control" },
              react.createElement("button", { type: "button", className: "dshm-bg-pick", onClick: () => fileRef.current && fileRef.current.click() }, t("pickImage")),
              bg && react.createElement("button", { type: "button", className: "dshm-bg-pick", onClick: adjust }, t("adjust")),
              bg && react.createElement("button", { type: "button", className: "dshm-bg-remove", onClick: remove }, t("removeBg"))),
            react.createElement("input", { ref: fileRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: pick })),
          crop && react.createElement(CropDialog, { crop, onCancel: () => setCrop(null), onApply: apply }));
      }

      // ---------- lifecycle ----------
      ctx.effect(() => {
        applyMode();
        const onResize = () => applyMode();
        window.addEventListener("resize", onResize);
        const onLoad = () => { applyMode(); syncBg(); };
        window.addEventListener("load", onLoad);
        const offSlots = ctx.on("slots/changed", () => {
          applyMode();
          // Session switches remount the conversation root; re-apply the saved
          // background on the next frame once the new root is in the DOM.
          if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(syncBg);
        });
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
        // Re-apply the saved chat background once the layout frame is mounted,
        // and keep watching for the conversation root being remounted.
        let tries = 0;
        const tryRender = () => {
          if (chatRoot()) {
            syncBg();
            return;
          }
          if (tries < 150 && typeof requestAnimationFrame !== "undefined") {
            tries += 1;
            requestAnimationFrame(tryRender);
          }
        };
        tryRender();
        let mo = null;
        if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
          mo = new MutationObserver((records) => {
            let relevant = false;
            for (const rec of records) {
              for (const node of rec.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches && (node.matches("[data-phase], .wSkVaW_root") ||
                    (node.querySelector && node.querySelector("[data-phase], .wSkVaW_root")))) {
                  relevant = true;
                  break;
                }
              }
              if (relevant) break;
            }
            if (relevant && typeof requestAnimationFrame !== "undefined") requestAnimationFrame(syncBg);
          });
          mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }
        return () => {
          if (mo !== null) mo.disconnect();
        };
      }, "ui-mobile: chat background");

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
        const off2b = slots.inject("shell.overlay", () => slots.register({ name: "shell.overlay", id: "dshm-bg-sync", order: -98 }, BgSync));
        const off3 = slots.inject("conversation.session.header.actions", () => slots.register({ name: "conversation.session.header.actions", id: "dshm-header-toggle", order: -20 }, HeaderToggle));
        const off4 = slots.inject("conversation.composer.dock", () => slots.register({ name: "conversation.composer.dock", id: "dshm-stats-toggle", order: 1 }, StatsToggle));
        const off5 = slots.inject("settings.general.item", () => slots.register({ name: "settings.general.item", id: "dshm-enter-mode", order: 30 }, MobileEnterRow));
        const off6 = slots.inject("settings.general.item", () => slots.register({ name: "settings.general.item", id: "dshm-chat-bg", order: 25 }, BackgroundRow));
        return () => { off1(); off2(); off2b(); off3(); off4(); off5(); off6(); };
      }, "ui-mobile: slots");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});

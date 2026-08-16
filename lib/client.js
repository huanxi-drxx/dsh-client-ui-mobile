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
    /* General-settings row: AI chat bubble toggle (visible on all devices) */
    .dshm-ai-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 12px;
      width: 100%;
      min-width: 0;
    }
    .dshm-ai-text { min-width: 0; flex: 1 1 160px; }
    .dshm-ai-title { font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-ai-desc { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c); }
    .dshm-ai-control { display: inline-flex; flex-wrap: wrap; gap: 6px; flex: 0 1 auto; }
    /* Assistant messages rendered as chat bubbles when enabled. Light gold in
       light mode, dark gold in dark mode, to distinguish from user bubbles. */
    [data-dshm-ai-bubble] [data-chat-flow-kind="assistant-step"] {
      background: #f9ecc9;
      border-radius: 18px;
      padding: 10px 14px;
      width: fit-content;
      max-width: 100%;
      color: var(--dsw-alias-label-primary);
    }
    body[data-ds-dark-theme][data-dshm-ai-bubble] [data-chat-flow-kind="assistant-step"] {
      background: #5a4a20;
    }
    /* Avatars: positioned OUTSIDE the message bubble. The flow item gets a
       margin so the bubble makes room; the avatar floats in the margin gap
       (absolute, negative offset) and is never wrapped by the bubble. */
    [data-chat-flow-kind] { position: relative; }
    [data-chat-flow-kind="user"][data-dshm-av="user"] { margin-right: 40px; }
    [data-chat-flow-kind="user"] .dshm-msg-avatar { right: -40px; }
    [data-chat-flow-kind="assistant-step"][data-dshm-av="ai"] {
      margin-left: 40px;
      max-width: calc(100% - 48px);
    }
    [data-chat-flow-kind="assistant-step"] .dshm-msg-avatar { left: -40px; }
    .dshm-msg-avatar {
      position: absolute;
      top: 4px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
      z-index: 2;
    }
    /* General-settings rows: user / AI avatar toggles (all devices) */
    .dshm-av-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 12px;
      width: 100%;
      min-width: 0;
    }
    .dshm-av-text { min-width: 0; flex: 1 1 160px; }
    .dshm-av-title { font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-av-desc { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c); }
    .dshm-av-control { display: inline-flex; flex-wrap: wrap; gap: 6px; flex: 0 1 auto; align-items: center; }
    .dshm-tools { padding: 4px 0; }
    .dshm-tools-status { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c); padding: 8px 0; }
    .dshm-tool {
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      border-radius: 12px;
      margin-bottom: 8px;
      overflow: hidden;
      background: var(--dsw-alias-bg-layer-1, #ffffff);
    }
    .dshm-tools-search {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      border-radius: 10px;
      background: var(--dsw-alias-bg-layer-1, #ffffff);
      color: var(--dsw-alias-label-primary, #0f1115);
      font-size: 13px;
      line-height: 20px;
      padding: 7px 12px;
      margin-bottom: 10px;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-tools-search:focus { border-color: var(--dsw-alias-brand-primary, #2563eb); }
    .dshm-tool-row { display: flex; align-items: flex-start; gap: 6px; }
    .dshm-tool-head {
      display: block;
      flex: 1;
      min-width: 0;
      text-align: left;
      border: none;
      background: none;
      padding: 10px 4px 10px 12px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-tool-off .dshm-tool-name { opacity: 0.45; }
    .dshm-switch {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      flex: none;
      width: 40px;
      height: 22px;
      margin: 10px 12px 0 0;
      padding: 0;
      border: none;
      border-radius: 11px;
      background: #d8dbe1;
      cursor: pointer;
      transition: background 0.15s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-switch[data-on="true"] { background: #2563eb; }
    body[data-ds-dark-theme] .dshm-switch { background: #3a4150; }
    body[data-ds-dark-theme] .dshm-switch[data-on="true"] { background: #3b82f6; }
    .dshm-switch:disabled { opacity: 0.6; cursor: default; }
    .dshm-switch::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
      transition: transform 0.15s ease;
    }
    .dshm-switch[data-on="true"]::after { transform: translateX(18px); }
    /* ── composer plus → action sheet (mobile only) ── */
    /* Hide the stock "+" (opens the command menu directly) so our own button can offer a choice. */
    [data-dshm-mobile] .uV2eYG_add,
    [data-dshm-mobile] [data-composer-card] .tools button[aria-haspopup="listbox"] { display: none !important; }
    .dshm-plus-btn {
      background: var(--dsw-specific-selector, rgb(0 0 0 / 5%));
      width: 28px;
      height: 28px;
      color: var(--dsw-alias-label-primary, #0f1115);
      cursor: pointer;
      border: none;
      border-radius: 999px;
      flex: none;
      place-items: center;
      display: none;
      order: -1;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    [data-dshm-mobile] .dshm-plus-btn { display: grid; }
    .dshm-plus-btn:active { background: var(--dsw-alias-interactive-bg-hover-solid, rgb(0 0 0 / 8%)); }
    .dshm-picker-backdrop {
      position: fixed;
      inset: 0;
      z-index: 120;
      background: rgb(0 0 0 / 0.35);
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-picker-sheet {
      position: fixed;
      left: 10px;
      right: 10px;
      bottom: 10px;
      z-index: 121;
      background: var(--dsw-specific-menu, #ffffff);
      border: 1px solid var(--dsw-alias-border-inverted, rgb(0 0 0 / 8%));
      border-radius: 14px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--dsw-shadow-lv3, 0 8px 24px rgb(0 0 0 / 0.2));
    }
    .dshm-picker-item {
      width: 100%;
      border: none;
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 10px;
      font-size: 15px;
      line-height: 22px;
      color: var(--dsw-alias-label-primary, #0f1115);
      text-align: left;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-picker-item:active { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
    .dshm-picker-item svg { flex: none; color: var(--dsw-alias-label-secondary, #61666b); }
    /* ── multi-model search: row inside the model menu + switch sheet ── */
    /* Fallback styling; when the stock hashed classes exist we reuse them so
       the row looks exactly like the model options above it. */
    .dshm-search-model-row {
      width: 100%;
      min-height: 38px;
      color: var(--dsw-alias-label-primary, #0f1115);
      text-align: left;
      cursor: pointer;
      background: none;
      border: none;
      border-radius: 10px;
      outline: none;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      display: flex;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-search-model-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
    .dshm-search-model-row .dshm-search-model-name {
      flex: 1;
      color: var(--dsw-alias-label-primary, #0f1115);
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      overflow: hidden;
    }
    .dshm-search-model-row .dshm-search-model-sub {
      flex: none;
      color: var(--dsw-alias-label-tertiary, #81858c);
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      line-height: 18px;
      overflow: hidden;
      max-width: 55%;
    }
    .dshm-search-model-row .dshm-search-model-chevron {
      flex: none;
      display: inline-flex;
      color: var(--dsw-alias-label-tertiary, #81858c);
    }
    .dshm-search-model-title { font-size: 13px; font-weight: 600; line-height: 20px; padding: 4px 8px 6px; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-search-model-empty { font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); padding: 8px; }
    .dshm-search-model-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dshm-search-model-sub { flex: none; font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dshm-search-model-dot { flex: none; width: 18px; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-search-model-current { font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); padding: 6px 8px 2px; }
    /* search-model management page (settings) */
    .dshm-search-form { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 0 10px; }
    .dshm-search-form input {
      box-sizing: border-box;
      flex: 1 1 140px;
      min-width: 0;
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      border-radius: 8px;
      background: var(--dsw-alias-bg-layer-1, #ffffff);
      color: var(--dsw-alias-label-primary, #0f1115);
      font-size: 13px;
      line-height: 20px;
      padding: 6px 10px;
      outline: none;
    }
    .dshm-search-form input:focus { border-color: var(--dsw-alias-brand-primary, #2563eb); }
    .dshm-search-form select {
      box-sizing: border-box;
      flex: 1 1 140px;
      min-width: 0;
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      border-radius: 8px;
      background: var(--dsw-alias-bg-layer-1, #ffffff);
      color: var(--dsw-alias-label-primary, #0f1115);
      font-size: 13px;
      line-height: 20px;
      padding: 6px 10px;
      outline: none;
    }
    .dshm-search-form button {
      flex: none;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: #2563eb;
      color: #ffffff;
      font-size: 13px;
      line-height: 20px;
      padding: 6px 14px;
      -webkit-tap-highlight-color: transparent;
    }
    body[data-ds-dark-theme] .dshm-search-form button { background: #3b82f6; }
    .dshm-search-form button:active { opacity: 0.85; }
    .dshm-search-form-error { flex-basis: 100%; font-size: 12px; line-height: 18px; color: var(--dsw-alias-state-error-primary, #dc2626); }
    /* Search-model row: absolutely pinned to the bottom of the model menu so
       it is never clipped by the menu's max-height/overflow. The JS adds
       padding-bottom to the menu to reserve space for it. */
    .dshm-search-model-row { order: 99; position: absolute; bottom: 4px; left: 4px; right: 4px; }
    /* Switch sheet: position/width are set inline to cover the open model
       menu; base card styling only here. */
    .dshm-search-model-sheet { right: auto !important; }
    .dshm-search-row {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      border-radius: 10px;
      padding: 8px 10px;
      margin-bottom: 8px;
      background: var(--dsw-alias-bg-layer-1, #ffffff);
    }
    .dshm-search-row-info { flex: 1; min-width: 0; }
    .dshm-search-row-name { font-size: 13px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-search-row-model { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #61666b); }
    .dshm-search-row-actions { display: inline-flex; gap: 6px; flex: none; }
    .dshm-search-mini-btn {
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      background: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      line-height: 18px;
      padding: 4px 8px;
      color: var(--dsw-alias-label-primary, #0f1115);
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-search-mini-btn[data-current="true"] { border-color: var(--dsw-alias-brand-primary, #2563eb); color: var(--dsw-alias-brand-primary, #2563eb); }
    .dshm-search-mini-btn.dshm-danger { color: var(--dsw-alias-state-error-primary, #dc2626); }
    /* message edit/delete/regenerate icon buttons */
    .dshm-msg-action {
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: none;
      color: var(--dsw-alias-label-secondary, #61666b);
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-msg-action:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-msg-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgb(0 0 0 / 0.4);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .dshm-msg-panel {
      width: min(480px, 100%);
      background: var(--dsw-specific-menu, #ffffff);
      border: 1px solid var(--dsw-alias-border-inverted, rgb(0 0 0 / 8%));
      border-radius: 14px;
      box-shadow: var(--dsw-shadow-lv3, 0 8px 24px rgb(0 0 0 / 0.2));
      padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .dshm-msg-title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-msg-textarea {
      box-sizing: border-box; width: 100%; min-height: 120px; resize: vertical;
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      border-radius: 10px; background: var(--dsw-alias-bg-layer-1, #fff);
      color: var(--dsw-alias-label-primary, #0f1115);
      font: inherit; font-size: 14px; line-height: 22px; padding: 10px; outline: none;
    }
    .dshm-msg-footer { display: flex; justify-content: flex-end; gap: 8px; }
    .dshm-msg-btn {
      border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
      background: none; border-radius: 8px; cursor: pointer;
      font-size: 13px; line-height: 20px; padding: 6px 14px;
      color: var(--dsw-alias-label-primary, #0f1115);
    }
    .dshm-msg-btn-primary { background: #2563eb; border-color: #2563eb; color: #fff; }
    body[data-ds-dark-theme] .dshm-msg-btn-primary { background: #3b82f6; border-color: #3b82f6; }

    /* web-search plugin card (replaces the stock card; stays in Plugin config) */
    .dshm-plugin-card {
      list-style: none;
      border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 8%));
      border-radius: 14px;
      overflow: hidden;
      background: var(--dsw-alias-bg-layer-1, #ffffff);
    }
    .dshm-plugin-card-head {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 12px 14px;
      border: none;
      background: none;
      cursor: pointer;
      text-align: left;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-plugin-card-title { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-plugin-card-desc { flex: 1; min-width: 0; font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dshm-plugin-card-chevron {
      flex: none;
      display: inline-flex;
      color: var(--dsw-alias-label-tertiary, #81858c);
    }
    .dshm-plugin-card-body { padding: 4px 14px 14px; }
    .dshm-tool-name { font-size: 13px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary, #0f1115); }
    .dshm-tool-desc { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #61666b); margin-top: 2px; }
    .dshm-tool-params { padding: 0 12px 10px; }
    .dshm-tool-params-title { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #81858c); margin: 4px 0; }
    .dshm-tool-params pre {
      margin: 0;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--dsw-alias-bg-layer-2, #f3f4f6);
      font-family: var(--ds-font-family-code, ui-monospace, Menlo, Consolas, monospace);
      font-size: 11px;
      line-height: 16px;
      color: var(--dsw-alias-label-secondary, #61666b);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .dshm-file-pick {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: none;
      color: var(--dsw-alias-label-secondary, #61666b);
      border-radius: 8px;
      cursor: pointer;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .dshm-file-pick:active { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
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

    // Double-mount guard (mirror of the host half): if the composition mounts
    // this package twice, the browser roster would apply the client twice and
    // duplicate every Slot registration. The flag is module-scoped; a reload
    // starts a fresh module anyway, so no dispose reset is required.
    let clientApplied = false;

    function apply(ctx) {
      if (clientApplied) return;
      clientApplied = true;
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
        // Pure browser-identifier detection: the user agent decides. A phone in
        // "desktop site" mode that switches its UA gets the desktop layout (that
        // is what desktop mode is for); browsers that keep the mobile UA in
        // desktop mode keep the mobile layout by their own choice.
        const mobile = /Android|iPhone|iPod|iPad|Windows Phone|Mobile/i.test(ua);
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
              "aiBubbleTitle": "AI 聊天气泡",
              "aiBubbleDesc": "以聊天气泡样式显示 AI 回复",
              "on": "开",
              "off": "关",
              "userAvatarTitle": "用户头像",
              "userAvatarDesc": "在用户消息旁显示头像",
              "aiAvatarTitle": "AI 头像",
              "aiAvatarDesc": "在 AI 消息旁显示头像",
              "upload": "上传",
              "resetDefault": "恢复默认",
              "pickFile": "上传文件给 AI",
              "fileUploaded": "📎 文件已上传：{path}",
              "uploadFailed": "文件上传失败，请重试",
              "toolsPage": "工具",
              "toolsLoading": "加载中…",
              "toolsEmpty": "暂无工具",
              "toolsError": "加载工具失败",
              "toolParameters": "参数",
              "toolSearch": "搜索工具…",
              "toolSearchEmpty": "没有匹配的工具",
              "toolDisable": "禁用",
              "toolEnable": "启用",
              "plusMore": "更多操作",
              "commands": "命令",
              "searchModelsPage": "搜索模型",
              "webSearchTitle": "网页搜索",
              "webSearchDesc": "搜索模型列表与当前选择",
              "searchModel": "搜索模型",
              "searchModelsEmpty": "暂无搜索模型",
              "searchModelAdd": "添加",
              "searchModelDelete": "删除",
              "searchModelCurrent": "设为当前",
              "searchModelUse": "当前使用",
              "searchModelName": "名称",
              "searchModelId": "模型 ID",
              "searchModelBase": "接口地址（可选）",
              "searchModelType": "类型",
              "searchModelTypeDeepseek": "DeepSeek 搜索",
              "searchModelTypeExa": "Exa 搜索",
              "searchModelTypeBrave": "Brave 搜索",
              "searchModelTypeBing": "Bing 搜索",
              "searchModelTypeTavily": "Tavily 搜索",
              "searchModelTypeFirecrawl": "Firecrawl 搜索",
              "searchModelNameRequired": "请填写名称",
              "searchModelApiKey": "API Key",
              "msgEdit": "Edit",
              "msgDelete": "Delete",
              "msgRegenerate": "Regenerate",
              "msgEditUser": "Edit user message",
              "msgEditAssistant": "Edit assistant message",
              "msgDeleteConfirm": "Delete this message?",
              "save": "Save",
              "cancel": "Cancel",
              "msgEdit": "编辑",
              "msgDelete": "删除",
              "msgRegenerate": "重新生成",
              "msgEditUser": "编辑用户消息",
              "msgEditAssistant": "编辑助手消息",
              "msgDeleteConfirm": "确定删除这条消息吗？",
              "searchModelKeySet": "已填",
              "searchModelKeyUnset": "未填",
              "bgTitle": "聊天背景",
              "bgDesc": "选择图片、裁剪、调节模糊与毛玻璃",
              "pickImage": "选择图片",
              "adjust": "调整",
              "removeBg": "移除背景",
              "dragHint": "拖动图片调整位置",
              "zoom": "缩放",
              "bgBlur": "背景模糊",
              "glass": "毛玻璃",
              "save": "保存",
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
              "aiBubbleTitle": "AI chat bubble",
              "aiBubbleDesc": "Show AI replies as chat bubbles",
              "on": "On",
              "off": "Off",
              "userAvatarTitle": "User avatar",
              "userAvatarDesc": "Show an avatar beside user messages",
              "aiAvatarTitle": "AI avatar",
              "aiAvatarDesc": "Show an avatar beside AI messages",
              "upload": "Upload",
              "resetDefault": "Reset default",
              "pickFile": "Upload a file for the AI",
              "fileUploaded": "📎 File uploaded: {path}",
              "uploadFailed": "File upload failed, please retry",
              "toolsPage": "Tools",
              "toolsLoading": "Loading…",
              "toolsEmpty": "No tools",
              "toolsError": "Failed to load tools",
              "toolParameters": "Parameters",
              "toolSearch": "Search tools…",
              "toolSearchEmpty": "No matching tools",
              "toolDisable": "Disable",
              "toolEnable": "Enable",
              "plusMore": "More actions",
              "commands": "Commands",
              "searchModelsPage": "Search models",
              "webSearchTitle": "Web search",
              "webSearchDesc": "Search model list and current pick",
              "searchModel": "Search model",
              "searchModelsEmpty": "No search models",
              "searchModelAdd": "Add",
              "searchModelDelete": "Delete",
              "searchModelCurrent": "Use now",
              "searchModelUse": "Current",
              "searchModelName": "Name",
              "searchModelId": "Model ID",
              "searchModelBase": "Base URL (optional)",
              "searchModelType": "Type",
              "searchModelTypeDeepseek": "DeepSeek search",
              "searchModelTypeExa": "Exa search",
              "searchModelTypeBrave": "Brave search",
              "searchModelTypeBing": "Bing search",
              "searchModelTypeTavily": "Tavily search",
              "searchModelTypeFirecrawl": "Firecrawl search",
              "searchModelNameRequired": "Name is required",
              "searchModelApiKey": "API Key",
              "searchModelKeySet": "Set",
              "searchModelKeyUnset": "Not set",
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

      // ---------- AI chat bubble toggle ----------
      const AI_BUBBLE_KEY = "dshm.aiBubble";
      function readAiBubble() {
        try { return window.localStorage.getItem(AI_BUBBLE_KEY) === "on"; } catch (_e) { return false; }
      }
      function writeAiBubble(on) {
        try {
          if (on) window.localStorage.setItem(AI_BUBBLE_KEY, "on");
          else window.localStorage.removeItem(AI_BUBBLE_KEY);
        } catch (_e) { /* storage unavailable */ }
      }
      function applyAiBubble(on) {
        if (typeof document === "undefined") return;
        // Attach to <body> so selectors like body[data-ds-dark-theme][data-dshm-ai-bubble]
        // can match (html is not a descendant of body).
        const target = document.body || document.documentElement;
        if (on) target.setAttribute("data-dshm-ai-bubble", "");
        else target.removeAttribute("data-dshm-ai-bubble");
      }

      function AiBubbleRow() {
        useLocaleTick();
        const [on, setOn] = react.useState(readAiBubble);
        const choose = (v) => { writeAiBubble(v); setOn(v); applyAiBubble(v); };
        return react.createElement("div", { className: "dshm-ai-row" },
          react.createElement("div", { className: "dshm-ai-text" },
            react.createElement("div", { className: "dshm-ai-title" }, t("aiBubbleTitle")),
            react.createElement("div", { className: "dshm-ai-desc" }, t("aiBubbleDesc"))),
          react.createElement("div", { className: "dshm-ai-control", role: "radiogroup", "aria-label": t("aiBubbleTitle") },
            react.createElement("button", {
              type: "button",
              className: "dshm-enter-option" + (on ? " dshm-enter-active" : ""),
              "aria-pressed": on,
              onClick: () => choose(true),
            }, t("on")),
            react.createElement("button", {
              type: "button",
              className: "dshm-enter-option" + (!on ? " dshm-enter-active" : ""),
              "aria-pressed": !on,
              onClick: () => choose(false),
            }, t("off"))));
      }

      // ---------- message avatars (user / AI, separately toggled) ----------
      const DEFAULT_USER_AVATAR = "data:image/svg+xml," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#d9dee8"/><circle cx="32" cy="24" r="11" fill="#8b93a3"/><path d="M14 58c0-11 8-17 18-17s18 6 18 17z" fill="#8b93a3"/></svg>');
      const DEFAULT_AI_AVATAR = "data:image/svg+xml," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#3b6ef6"/><rect x="17" y="13" width="30" height="24" rx="6" fill="#ffffff"/><circle cx="26" cy="25" r="3" fill="#3b6ef6"/><circle cx="38" cy="25" r="3" fill="#3b6ef6"/><path d="M26 40h12" stroke="#3b6ef6" stroke-width="3" stroke-linecap="round"/><rect x="20" y="42" width="24" height="10" rx="4" fill="#ffffff"/></svg>');
      const AV_KEY = { user: "dshm.avatarUser", ai: "dshm.avatarAi" };
      function readAvatar(side) {
        try {
          const raw = window.localStorage.getItem(AV_KEY[side]);
          const v = raw ? JSON.parse(raw) : null;
          return {
            on: !!(v && v.on),
            url: v && typeof v.url === "string" ? v.url : null,
            zoom: v && typeof v.zoom === "number" ? v.zoom : 100,
            x: v && typeof v.x === "number" ? v.x : 50,
            y: v && typeof v.y === "number" ? v.y : 50,
          };
        } catch (_e) { return { on: false, url: null, zoom: 100, x: 50, y: 50 }; }
      }
      function writeAvatar(side, cfg) {
        try { window.localStorage.setItem(AV_KEY[side], JSON.stringify(cfg)); } catch (_e) { /* storage unavailable */ }
      }
      // Inject avatars into message flow items. Idempotent: re-running only
      // fixes items whose state is wrong, so streaming re-renders don't flicker.
      // Only the FIRST assistant-step of a contiguous run gets the AI avatar.
      function ensureAvatars() {
        if (typeof document === "undefined") return;
        const scroll = document.querySelector("[data-conversation-scroll]");
        if (!scroll) return;
        const u = readAvatar("user");
        const a = readAvatar("ai");
        const uUrl = u.url || DEFAULT_USER_AVATAR;
        const aUrl = a.url || DEFAULT_AI_AVATAR;
        let prev = null;
        for (const item of scroll.querySelectorAll("[data-chat-flow-kind]")) {
          const kind = item.getAttribute("data-chat-flow-kind");
          const want = (kind === "user" && u.on) || (kind === "assistant-step" && a.on && prev !== "assistant-step");
          const side = kind === "user" ? "user" : "ai";
          let av = item.querySelector(":scope > .dshm-msg-avatar");
          if (want) {
            if (!av) {
              av = document.createElement("div");
              av.className = "dshm-msg-avatar";
              item.appendChild(av);
            }
            const cfg = side === "user" ? u : a;
            av.style.backgroundImage = `url("${side === "user" ? uUrl : aUrl}")`;
            av.style.backgroundSize = `${cfg.zoom || 100}%`;
            av.style.backgroundPosition = `${cfg.x || 50}% ${cfg.y || 50}%`;
            item.setAttribute("data-dshm-av", side);
          } else {
            if (av) av.remove();
            item.removeAttribute("data-dshm-av");
          }
          prev = kind;
        }
      }

      function AvatarRow({ side }) {
        useLocaleTick();
        const isAi = side === "ai";
        const [on, setOn] = react.useState(() => readAvatar(side).on);
        const [hasCustom, setHasCustom] = react.useState(() => !!readAvatar(side).url);
        const [crop, setCrop] = react.useState(null);
        const fileRef = react.useRef(null);
        const pick = (e) => {
          const file = e.target.files && e.target.files[0];
          e.target.value = "";
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async () => {
            const small = await downscaleDataUrl(String(reader.result), 512, 0.85);
            if (small) setCrop({ dataUrl: small, zoom: 100, x: 50, y: 50 });
          };
          reader.readAsDataURL(file);
        };
        const applyCrop = (cfg) => {
          writeAvatar(side, { on, url: cfg.dataUrl, zoom: cfg.zoom, x: cfg.x, y: cfg.y });
          setHasCustom(true);
          setCrop(null);
          ensureAvatars();
        };
        const choose = (v) => {
          const cur = readAvatar(side);
          writeAvatar(side, { on: v, url: cur.url, zoom: cur.zoom, x: cur.x, y: cur.y });
          setOn(v);
          ensureAvatars();
        };
        const reset = () => {
          writeAvatar(side, { on, url: null, zoom: 100, x: 50, y: 50 });
          setHasCustom(false);
          ensureAvatars();
        };
        return react.createElement(react.Fragment, null,
          react.createElement("div", { className: "dshm-av-row" },
            react.createElement("div", { className: "dshm-av-text" },
              react.createElement("div", { className: "dshm-av-title" }, isAi ? t("aiAvatarTitle") : t("userAvatarTitle")),
              react.createElement("div", { className: "dshm-av-desc" }, isAi ? t("aiAvatarDesc") : t("userAvatarDesc"))),
            react.createElement("div", { className: "dshm-av-control" },
              react.createElement("button", {
                type: "button",
                className: "dshm-enter-option" + (on ? " dshm-enter-active" : ""),
                "aria-pressed": on,
                onClick: () => choose(true),
              }, t("on")),
              react.createElement("button", {
                type: "button",
                className: "dshm-enter-option" + (!on ? " dshm-enter-active" : ""),
                "aria-pressed": !on,
                onClick: () => choose(false),
              }, t("off")),
              react.createElement("button", { type: "button", className: "dshm-bg-pick", onClick: () => fileRef.current && fileRef.current.click() }, t("upload")),
              hasCustom && react.createElement("button", { type: "button", className: "dshm-bg-remove", onClick: reset }, t("resetDefault")),
              react.createElement("input", { ref: fileRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: pick }))),
          crop && react.createElement(CropDialog, { crop, shape: "circle", mode: "avatar", onCancel: () => setCrop(null), onApply: applyCrop }));
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

      function CropDialog({ crop, onCancel, onApply, shape = "rect", mode = "background" }) {
        useLocaleTick();
        const circle = shape === "circle";
        const [zoom, setZoom] = react.useState(crop.zoom);
        const [pos, setPos] = react.useState({ x: crop.x, y: crop.y });
        const [blur, setBlur] = react.useState(crop.blur || 0);
        const [glass, setGlass] = react.useState(crop.glass || 0);
        const previewRef = react.useRef(null);
        const drag = react.useRef(null);
        // Match the preview aspect to the real chat column (or 1:1 for avatars).
        let ar = circle ? 1 : 9 / 16;
        if (!circle) {
          try {
            const col = chatRoot();
            if (col) {
              const r = col.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) ar = r.width / r.height;
            }
          } catch (_e) { /* ignore */ }
        }
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
                borderRadius: circle ? "50%" : undefined,
                backgroundImage: `url("${crop.dataUrl}")`,
                backgroundSize: `${zoom}%`,
                backgroundPosition: `${pos.x}% ${pos.y}%`,
                backgroundRepeat: "no-repeat",
                filter: mode === "background" ? `blur(${blur}px) saturate(1.3)` : undefined,
              },
              onPointerDown,
              onPointerMove,
              onPointerUp,
              onPointerCancel: onPointerUp,
            },
              react.createElement("div", { className: "dshm-crop-hint" }, t("dragHint")),
              !circle && react.createElement("div", { className: "dshm-crop-glass dshm-crop-glass-top", style: { backgroundColor: glassColor } }),
              !circle && react.createElement("div", { className: "dshm-crop-glass dshm-crop-glass-bottom", style: { backgroundColor: glassColor } })),
            react.createElement("div", { className: "dshm-crop-zoom" },
              react.createElement("label", null, t("zoom")),
              react.createElement("input", {
                type: "range", min: 100, max: 300, step: 5,
                value: zoom,
                onChange: (e) => setZoom(Number(e.target.value)),
              })),
            mode === "background" && react.createElement("div", { className: "dshm-crop-zoom" },
              react.createElement("label", null, t("bgBlur")),
              react.createElement("input", {
                type: "range", min: 0, max: 20, step: 1,
                value: blur,
                onChange: (e) => setBlur(Number(e.target.value)),
              })),
            mode === "background" && react.createElement("div", { className: "dshm-crop-zoom" },
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

      // ---------- provider balance display (model select popup) ----------
      // Balances come from the host route /api/dshm/balances; providers without
      // a known balance API (Google, Anthropic, free trials, …) are absent and
      // simply show nothing.
      let balances = {};
      let lastFetchAt = 0;
      function fetchBalances(force) {
        if (typeof fetch !== "function") return;
        const now = Date.now();
        if (!force && now - lastFetchAt < 5000) return;
        lastFetchAt = now;
        fetch("/api/dshm/balances", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : {}))
          .then((data) => { balances = data || {}; injectBalances(); })
          .catch(() => { balances = {}; });
      }
      // Provider ids vary by deployment (e.g. "deepseek-official"); match by
      // well-known name so the balance key resolves regardless of the suffix.
      function providerIdOf(titleEl) {
        const id = (titleEl.getAttribute("id") || "").toLowerCase();
        if (id.includes("deepseek")) return "deepseek";
        if (id.includes("openrouter")) return "openrouter";
        if (id.includes("openai")) return "openai";
        return null;
      }
      function fmtBalance(b) {
        const n = Number(b && b.balance);
        if (!isFinite(n)) return null;
        const cur = b.currency === "CNY" ? "\u00a5" : b.currency === "USD" ? "$" : ((b.currency || "") + " ");
        return cur + n.toFixed(2);
      }
      function injectBalances() {
        if (typeof document === "undefined") return;
        document.querySelectorAll("._7KE1Ra_groupTitle").forEach((el) => {
          const old = el.querySelector("[data-dshm-balance]");
          if (old) old.remove();
          const pid = providerIdOf(el);
          const b = pid ? balances[pid] : null;
          const text = b ? fmtBalance(b) : null;
          if (!text) return;
          const span = document.createElement("span");
          span.setAttribute("data-dshm-balance", "");
          span.style.cssText = "margin-left:8px;font-weight:500;color:var(--dsw-alias-label-secondary, #61666b);";
          span.textContent = text;
          el.appendChild(span);
        });
      }

      // ---------- file upload for the AI (via "/" trigger source) ----------
      function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(",")[1] || "");
          r.onerror = () => reject(r.error);
          r.readAsDataURL(file);
        });
      }
      // Captured from the (invisible) composer seat: the current session's
      // input actions + cwd, so the trigger-source pick can upload + send.
      let fileInputActions = null;
      let fileCwd = "";
      let fileDraft = "";
      let fileSessionId = "";
      let fileInputEl = null;
      let filePickBusy = false;
      function dshmPickFile() {
        if (typeof document === "undefined" || filePickBusy) return;
        if (!fileInputEl) {
          fileInputEl = document.createElement("input");
          fileInputEl.type = "file";
          fileInputEl.style.display = "none";
          document.body.appendChild(fileInputEl);
        }
        fileInputEl.onchange = async () => {
          const file = fileInputEl.files && fileInputEl.files[0];
          fileInputEl.value = "";
          if (!file) return;
          filePickBusy = true;
          try {
            const data = await readFileAsBase64(file);
            if (typeof fetch !== "function") return;
            const res = await fetch("/api/dshm/upload", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ cwd: fileCwd || "", name: file.name, data }),
            });
            const j = await res.json();
            if (fileInputActions && typeof fileInputActions.setDraft === "function") {
              if (res.ok && j && typeof j.path === "string") {
                // Keep the user's typed text: strip the trailing trigger slash
                // and append the file path after what they already wrote.
                const cleaned = String(fileDraft || "").replace(/\/\s*$/, "").trim();
                fileInputActions.setDraft(cleaned ? cleaned + " " + j.path : j.path);
              } else {
                fileInputActions.setDraft("⚠️ " + t("uploadFailed"));
              }
            }
          } catch (_e) {
            if (fileInputActions && typeof fileInputActions.setDraft === "function") {
              fileInputActions.setDraft("⚠️ " + t("uploadFailed"));
            }
          }
          filePickBusy = false;
        };
        fileInputEl.click();
      }
      // Action-sheet open state shared between the plus button (input.left)
      // and the sheet itself (input.overlay).
      let dshmPickerOpen = false;
      const pickerListeners = new Set();
      function setPickerOpen(value) {
        if (dshmPickerOpen === value) return;
        dshmPickerOpen = value;
        for (const fn of Array.from(pickerListeners)) fn();
      }
      function subscribePicker(fn) { pickerListeners.add(fn); return () => { pickerListeners.delete(fn); }; }
      function usePickerOpen() {
        return react.useSyncExternalStore(subscribePicker, () => dshmPickerOpen);
      }

      // Open the stock command menu. First try a programmatic click on the
      // native "+" (it stays in the DOM, just hidden on mobile); fall back to
      // driving the input-trigger service directly.
      function dshmOpenCommands() {
        if (typeof document === "undefined") return;
        const btn = document.querySelector("button.uV2eYG_add, [data-composer-card] .tools button[aria-haspopup='listbox']");
        if (btn) { btn.click(); return; }
        if (inputTriggers !== undefined && typeof inputTriggers.toggleSource === "function") {
          inputTriggers.toggleSource("command", { trigger: "/", query: "", position: "leading", span: { start: 0, end: 0, draftRev: 0 } });
        }
      }

      // Occupant of conversation.input.left: captures session input actions +
      // cwd (still powers the "/" upload source on desktop), and on mobile
      // renders the plus button that opens the action sheet. Desktop renders
      // nothing, exactly like before.
      function FilePickButton(props) {
        useLocaleTick();
        const sessionId = props.sessionId;
        const cwd = typeof props.useSessions === "function"
          ? props.useSessions((st) => (st && st.byId && sessionId ? st.byId[sessionId].cwd : undefined))
          : undefined;
        const draft = typeof props.useInput === "function"
          ? props.useInput((st) => (st ? st.draft : ""))
          : "";
        fileInputActions = props.inputActions || null;
        fileCwd = cwd || "";
        fileDraft = draft || "";
        fileSessionId = sessionId || "";
        const open = usePickerOpen();
        return react.createElement("button", {
          type: "button",
          className: "dshm-plus-btn",
          "aria-label": t("plusMore"),
          "aria-haspopup": "menu",
          "aria-expanded": open ? "true" : "false",
          onClick: (e) => { e.preventDefault(); e.stopPropagation(); setPickerOpen(!open); },
        }, react.createElement("svg", {
          width: 14, height: 14, viewBox: "0 0 16 16",
          fill: "none", stroke: "currentColor", strokeWidth: 1.7,
          strokeLinecap: "round", "aria-hidden": true,
        }, react.createElement("path", { d: "M8 3v10M3 8h10" })));
      }

      // Occupant of conversation.input.overlay: bottom action sheet offering
      // "Commands" (the stock command menu) and "Upload file".
      function PickerSheet() {
        useLocaleTick();
        const open = usePickerOpen();
        react.useEffect(() => {
          if (!open) return;
          // Close on any press OUTSIDE the sheet (capture phase, so it works
          // no matter how the backdrop is positioned/covered) and on Esc.
          const onPointer = (e) => {
            const t = e.target;
            if (t && t.nodeType === 1 && typeof t.closest === "function" && t.closest(".dshm-picker-sheet")) return;
            setPickerOpen(false);
          };
          const onKey = (e) => { if (e.key === "Escape") setPickerOpen(false); };
          document.addEventListener("pointerdown", onPointer, true);
          document.addEventListener("keydown", onKey);
          return () => {
            document.removeEventListener("pointerdown", onPointer, true);
            document.removeEventListener("keydown", onKey);
          };
        }, [open]);
        if (!open) return null;
        return react.createElement(react.Fragment, null,
          react.createElement("div", { className: "dshm-picker-backdrop" }),
          react.createElement("div", { className: "dshm-picker-sheet", role: "menu" },
            react.createElement("button", {
              type: "button",
              className: "dshm-picker-item",
              role: "menuitem",
              onClick: () => { setPickerOpen(false); dshmOpenCommands(); },
            },
              react.createElement("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", "aria-hidden": true },
                react.createElement("path", { d: "M3 5.5h10M3 8h10M3 10.5h6" })),
              react.createElement("span", null, t("commands"))),
            react.createElement("button", {
              type: "button",
              className: "dshm-picker-item",
              role: "menuitem",
              onClick: () => { setPickerOpen(false); dshmPickFile(); },
            },
              react.createElement("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", "aria-hidden": true },
                react.createElement("path", { d: "M8 3.5v9M3.5 8h9" })),
              react.createElement("span", null, t("pickFile")))));
      }

      // ---------- multi-model web search ----------
      // Search-model list + current choice, cached from /api/dshm/search-models.
      let searchModelsCache = { models: [], current: "" };
      function fetchSearchModels() {
        if (typeof fetch !== "function") return Promise.resolve(searchModelsCache);
        return fetch("/api/dshm/search-models", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : { models: [], current: "" }))
          .then((d) => {
            searchModelsCache = {
              models: Array.isArray(d.models) ? d.models : [],
              current: typeof d.current === "string" ? d.current : "",
            };
            return searchModelsCache;
          })
          .catch(() => searchModelsCache);
      }
      function postSearchModels(body) {
        if (typeof fetch !== "function") return Promise.resolve(false);
        return fetch("/api/dshm/search-models", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }).then((r) => (r.ok ? r.json() : { ok: false }))
          .then((d) => {
            if (d && d.ok === true && Array.isArray(d.models)) {
              searchModelsCache = { models: d.models, current: typeof d.current === "string" ? d.current : "" };
            }
            return !!(d && d.ok === true);
          })
          .catch(() => false);
      }
      // Switch-sheet open state (the row lives in the model menu, the sheet in
      // conversation.input.overlay).
      // The model-select menu is a multi-pane container: the root pane holds
      // "Model"/"Reasoning level" cells, and tapping one replaces the menu with
      // that pane's list. We add a third root cell, "Search model", and make it
      // replace the menu in-place with the search-model list (same style as the
      // reasoning-level pane), covering the other options.
      function searchModelCell(menu) {
        const label = searchModelsCache.models.find((m) => m.id === searchModelsCache.current);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "_7KE1Ra_cell";
        cell.setAttribute("data-dshm-search-row", "1");
        cell.setAttribute("role", "menuitem");
        const cellLabel = document.createElement("span");
        cellLabel.className = "_7KE1Ra_cellLabel";
        cellLabel.textContent = t("searchModel");
        const cellValue = document.createElement("span");
        cellValue.className = "_7KE1Ra_cellValue";
        cellValue.textContent = label ? (label.label || label.model) : "…";
        const cellChevron = document.createElement("span");
        cellChevron.className = "_7KE1Ra_cellChevron";
        const SVGNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("width", "14");
        svg.setAttribute("height", "14");
        svg.setAttribute("viewBox", "0 0 14 14");
        svg.setAttribute("fill", "none");
        const path = document.createElementNS(SVGNS, "path");
        path.setAttribute("d", "M5.5 2.15137L5.92383 2.57617L8.65137 5.30273C8.90706 5.55843 9.13382 5.78438 9.29785 5.98828C9.46883 6.20088 9.61756 6.44405 9.66602 6.75C9.69222 6.91565 9.69222 7.08435 9.66602 7.25C9.61756 7.55595 9.46883 7.79912 9.29785 8.01172C9.13382 8.21561 8.90706 8.44157 8.65137 8.69727L5.92383 11.4238L5.5 11.8486L4.65137 11L5.07617 10.5762L7.80273 7.84863C8.07732 7.57405 8.24849 7.40124 8.3623 7.25977C8.46904 7.12709 8.47813 7.07728 8.48047 7.0625C8.48703 7.02105 8.48703 6.97895 8.48047 6.9375C8.47813 6.92272 8.46904 6.87291 8.3623 6.74023C8.24848 6.59876 8.07732 6.42595 7.80273 6.15137L5.07617 3.42383L4.65137 3L5.5 2.15137Z");
        path.setAttribute("fill", "currentColor");
        svg.appendChild(path);
        cellChevron.appendChild(svg);
        cell.appendChild(cellLabel);
        cell.appendChild(cellValue);
        cell.appendChild(cellChevron);
        cell.addEventListener("click", () => { openSearchModelPanel(menu); });
        return cell;
      }
      function openSearchModelPanel(menu) {
        // Keep focus on the menu itself before removing children, otherwise the
        // focused element disappears and the ModelSelect's onBlur closes the
        // whole popup, leaving nothing visible.
        menu.setAttribute("tabindex", "-1");
        try { menu.focus(); } catch (_e) { /* ignore */ }
        while (menu.firstChild) menu.removeChild(menu.firstChild);
        menu.setAttribute("data-dshm-search-panel", "1");
        menu.style.paddingBottom = "4px";
        const models = searchModelsCache.models;
        const current = searchModelsCache.current;
        const SVGNS = "http://www.w3.org/2000/svg";
        if (models.length === 0) {
          const empty = document.createElement("div");
          empty.className = "dshm-search-model-empty";
          empty.textContent = t("searchModelsEmpty");
          menu.appendChild(empty);
          return;
        }
        for (const m of models) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "_7KE1Ra_option" + (m.id === current ? " _7KE1Ra_selected" : "");
          btn.setAttribute("role", "menuitemradio");
          btn.setAttribute("aria-checked", m.id === current ? "true" : "false");
          const name = document.createElement("span");
          name.className = "_7KE1Ra_modelName";
          name.textContent = m.label || m.model;
          btn.appendChild(name);
          if (m.id === current) {
            const check = document.createElement("span");
            check.className = "_7KE1Ra_check";
            const csvg = document.createElementNS(SVGNS, "svg");
            csvg.setAttribute("width", "16");
            csvg.setAttribute("height", "16");
            csvg.setAttribute("viewBox", "0 0 16 16");
            csvg.setAttribute("fill", "none");
            csvg.setAttribute("stroke", "currentColor");
            csvg.setAttribute("stroke-width", "1.5");
            csvg.setAttribute("stroke-linecap", "round");
            const cpath = document.createElementNS(SVGNS, "path");
            cpath.setAttribute("d", "M3.5 8.5l3 3 6-7");
            csvg.appendChild(cpath);
            check.appendChild(csvg);
            btn.appendChild(check);
          }
          btn.addEventListener("click", () => {
            postSearchModels({ current: m.id }).then((ok) => {
              if (!ok) return;
              const trigger = document.querySelector("._7KE1Ra_trigger");
              if (trigger) trigger.click();
            });
          });
          menu.appendChild(btn);
        }
      }
      function ensureSearchModelRow() {
        if (typeof document === "undefined") return;
        const menus = document.querySelectorAll("._7KE1Ra_menu");
        for (const menu of menus) {
          if (menu.getAttribute("data-dshm-search-panel") === "1") continue;
          const existing = menu.querySelector("[data-dshm-search-row]");
          const isRoot = menu.querySelector("._7KE1Ra_cell:not([data-dshm-search-row])") !== null;
          if (!isRoot) {
            if (existing) existing.remove();
            continue;
          }
          if (existing) {
            const label = searchModelsCache.models.find((m) => m.id === searchModelsCache.current);
            const val = existing.querySelector("._7KE1Ra_cellValue");
            if (val) val.textContent = label ? (label.label || label.model) : "…";
            continue;
          }
          menu.appendChild(searchModelCell(menu));
        }
      }

      function refreshSearchModelRowText() {
        if (typeof document === "undefined") return;
        const cell = document.querySelector("[data-dshm-search-row]");
        if (!cell) return;
        const label = searchModelsCache.models.find((m) => m.id === searchModelsCache.current);
        const val = cell.querySelector("._7KE1Ra_cellValue");
        if (val) val.textContent = label ? (label.label || label.model) : "…";
      }

      // ---------- message edit / delete / regenerate ----------
      // Branch-based (like dsh-message-edit): actions fork a new session
      // version; the host route returns the new session id, which we open.
      const EDIT_PATH = "M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z";
      const REFRESH_PATH = "M7.92136 0.349152C10.3744 0.349234 12.5564 1.5052 13.9557 3.29894L15.1281 2.12759C15.3303 1.92546 15.6767 2.06943 15.6767 2.35538V5.53923C15.6766 5.71626 15.5329 5.85976 15.3559 5.86002H12.171C11.8854 5.8597 11.7426 5.51465 11.9443 5.31249L12.9641 4.29056C11.8237 2.74305 9.98908 1.74106 7.92136 1.74097C4.46436 1.74097 1.66233 4.543 1.66233 8C1.66233 11.457 4.46436 14.259 7.92136 14.259C11.3782 14.2589 14.1804 11.4569 14.1804 8H15.5722C15.5722 12.2251 12.1465 15.6507 7.92136 15.6508C3.69614 15.6508 0.270508 12.2252 0.270508 8C0.270508 3.77478 3.69614 0.349152 7.92136 0.349152Z";
      const TRASH_PATH = "M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 13.9714 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z";

      function msgSvgIcon(path) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "14");
        svg.setAttribute("height", "14");
        svg.setAttribute("viewBox", "0 0 16 16");
        svg.setAttribute("fill", "none");
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", path);
        p.setAttribute("fill", "currentColor");
        svg.appendChild(p);
        return svg;
      }
      function postMessageEdit(op) {
        if (typeof fetch !== "function") return Promise.resolve(null);
        return fetch("/api/dshm/message-edit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(op),
        }).then((r) => (r.ok ? r.json() : { ok: false }))
          .then((d) => (d && d.ok === true && typeof d.sessionId === "string" ? d.sessionId : null))
          .catch(() => null);
      }
      function openSession(sessionId) {
        if (typeof sessionId !== "string" || sessionId.length === 0) return;
        const sessions = ctx.get("sessions");
        if (sessions && typeof sessions.open === "function") sessions.open(sessionId);
      }
      // Textarea editor overlay for editing one message block.
      function mountEditor(block, sessionId) {
        const overlay = document.createElement("div");
        overlay.className = "dshm-msg-overlay";
        const panel = document.createElement("div");
        panel.className = "dshm-msg-panel";
        const title = document.createElement("div");
        title.className = "dshm-msg-title";
        title.textContent = block.kind === "user" ? t("msgEditUser") : t("msgEditAssistant");
        const input = document.createElement("textarea");
        input.className = "dshm-msg-textarea";
        input.value = block.text;
        const footer = document.createElement("div");
        footer.className = "dshm-msg-footer";
        const save = document.createElement("button");
        save.className = "dshm-msg-btn dshm-msg-btn-primary";
        save.textContent = t("save");
        const cancel = document.createElement("button");
        cancel.className = "dshm-msg-btn";
        cancel.textContent = t("cancel");
        footer.append(save, cancel);
        panel.append(title, input, footer);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        let done = false;
        const close = () => { if (!done) { done = true; overlay.remove(); } };
        save.addEventListener("click", () => {
          if (done) return;
          save.disabled = true;
          postMessageEdit({ action: "edit", sessionId, eventSeq: block.eventSeq, blockIndex: block.blockIndex, text: input.value }).then((newId) => {
            if (newId) { close(); openSession(newId); }
            else { save.disabled = false; }
          });
        });
        cancel.addEventListener("click", close);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
        const onKey = (e) => { if (e.key === "Escape") close(); };
        document.addEventListener("keydown", onKey);
        const cleanupKey = () => document.removeEventListener("keydown", onKey);
        const origClose = close;
        const wrappedClose = () => { cleanupKey(); origClose(); };
        overlay.__close = wrappedClose;
        return wrappedClose;
      }
      function plainText(s) {
        return (s || "")
          .replace(/```[\s\S]*?```/g, " ")
          .replace(/`[^`]*`/g, " ")
          .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
          .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/[*_~>#|]+/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }
      function startMessageEditInjection(messages, sessionId) {
        const claimed = new Set();
        const sync = () => {
          // Precise message action-row class (p-xYUq_actions), with a suffix
          // fallback; the wide [class*="actions"] also matched header rows.
          const rows = document.querySelectorAll('.p-xYUq_actions, [class$="_actions"]');
          for (const row of rows) {
            if (row.__dshmEditInjected === true) continue;
            const text = (row.parentElement && row.parentElement.parentElement ? row.parentElement.parentElement.textContent : "").trim();
            if (text.length === 0) continue;
            const hay = plainText(text);
            const matching = [...new Set(messages
              .filter((m) => {
                const needle = plainText(m.text).slice(0, 20);
                return needle.length > 0 && hay.includes(needle);
              })
              .map((m) => m.eventSeq))];
            const eventSeq = matching.find((c) => !claimed.has(c));
            if (eventSeq === undefined) continue;
            const blocks = messages.filter((m) => m.eventSeq === eventSeq);
            if (blocks.length === 0) continue;
            row.__dshmEditInjected = true;
            claimed.add(eventSeq);

            const mkBtn = (path, label, onClick) => {
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "dshm-msg-action";
              btn.setAttribute("aria-label", label);
              btn.title = label;
              btn.appendChild(msgSvgIcon(path));
              btn.addEventListener("click", onClick);
              return btn;
            };
            const editBtn = mkBtn(EDIT_PATH, t("msgEdit"), () => {
              if (blocks.length === 1 && blocks[0] !== undefined) mountEditor(blocks[0], sessionId);
              else if (blocks[0] !== undefined) mountEditor(blocks[0], sessionId);
            });
            const delBtn = mkBtn(TRASH_PATH, t("msgDelete"), () => {
              const b = blocks[0];
              if (b === undefined) return;
              const sure = (typeof window !== "undefined" && typeof window.confirm === "function") ? window.confirm(t("msgDeleteConfirm")) : true;
              if (!sure) return;
              postMessageEdit({ action: "delete", sessionId, eventSeq: b.eventSeq }).then((newId) => { if (newId) openSession(newId); });
            });
            row.appendChild(editBtn);
            row.appendChild(delBtn);
            if (blocks.some((b) => b.kind === "user")) {
              const rerollBtn = mkBtn(REFRESH_PATH, t("msgRegenerate"), () => {
                postMessageEdit({ action: "reroll", sessionId }).then((newId) => { if (newId) openSession(newId); });
              });
              row.appendChild(rerollBtn);
            }
          }
        };
        sync();
        const observer = new MutationObserver(() => { if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(sync); });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
        return observer;
      }

      // Invisible session-scoped occupant: fetch editable messages and inject
      // edit/delete/regenerate icons into each message action row.
      function MessageEditInjector(props) {
        useLocaleTick();
        const sessionId = typeof props.useSession === "function"
          ? props.useSession((s) => (s ? s.sessionId : undefined))
          : props.sessionId;
        react.useEffect(() => {
          if (!sessionId || typeof fetch !== "function") return;
          let current = true;
          let observer = null;
          fetch("/api/dshm/message-edit?sessionId=" + encodeURIComponent(sessionId), { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : { messages: [] }))
            .then((d) => {
              if (!current) return;
              const messages = Array.isArray(d.messages) ? d.messages : [];
              if (messages.length > 0) observer = startMessageEditInjection(messages, sessionId);
            })
            .catch(() => {});
          return () => { current = false; if (observer !== null) observer.disconnect(); };
        }, [sessionId]);
        // Render a zero-size keeper so the occupant is always mounted.
        return react.createElement("span", { style: { display: "none" } });
      }

      // Replaces the stock "Web search" card in Settings → Plugins config.
      // The stock card edited the single web-search-deepseek model; since the
      // web row now points at dshm-search, the card manages the search-model
      // list and current selection instead.
      function WebSearchCard() {
        useLocaleTick();
        // Default to EXPANDED so the Add form is visible immediately.
        const [open, setOpen] = react.useState(true);
        const [state, setState] = react.useState({ status: "loading", models: [], current: "" });
        const [label, setLabel] = react.useState("");
        const [type, setType] = react.useState("exa");
        const [modelId, setModelId] = react.useState("");
        const [apiKey, setApiKey] = react.useState("");
        const [baseURL, setBaseURL] = react.useState("");
        const [formError, setFormError] = react.useState("");
        const load = () => {
          setState((s) => ({ status: "loading", models: s.models, current: s.current }));
          fetchSearchModels().then((d) => setState({ status: "ready", models: d.models, current: d.current }));
        };
        react.useEffect(load, []);
        const addModel = () => {
          // Only DeepSeek needs a model id; every other service (Exa, Brave,
          // Bing, Tavily, Firecrawl) uses the name field as its identifier.
          const name = (type === "deepseek" ? (modelId || "").trim() : (label || "").trim());
          if (!name) { setFormError(t("searchModelNameRequired")); return; }
          setFormError("");
          const next = state.models.concat([{
            id: "",
            label: (label || "").trim() || name,
            type,
            apiKey: (apiKey || "").trim() || void 0,
            model: type === "deepseek" ? name : "",
            baseURL: (baseURL || "").trim() || void 0,
          }]);
          postSearchModels({ models: next }).then((ok) => {
            if (ok) { setLabel(""); setType("exa"); setModelId(""); setApiKey(""); setBaseURL(""); setFormError(""); load(); }
            else setState((s) => ({ ...s, status: "error" }));
          });
        };
        const removeModel = (id) => {
          const next = state.models.filter((m) => m.id !== id);
          postSearchModels({ models: next }).then((ok) => { if (ok) load(); });
        };
        const makeCurrent = (id) => {
          postSearchModels({ current: id }).then((ok) => { if (ok) { load(); refreshSearchModelRowText(); } });
        };
        const { status, models, current } = state;
        // Build the Add form FIRST as an explicit element; it renders as the
        // first child of the body so it can never be skipped.
        const form = react.createElement("div", { className: "dshm-search-form" },
          react.createElement("input", {
            type: "text",
            placeholder: t("searchModelName"),
            value: label,
            onChange: (e) => setLabel(e.target.value),
            "aria-label": t("searchModelName"),
          }),
          react.createElement("select", {
            className: "dshm-search-type",
            value: type,
            onChange: (e) => setType(e.target.value),
            "aria-label": t("searchModelType"),
          },
            react.createElement("option", { value: "exa" }, t("searchModelTypeExa")),
            react.createElement("option", { value: "brave" }, t("searchModelTypeBrave")),
            react.createElement("option", { value: "bing" }, t("searchModelTypeBing")),
            react.createElement("option", { value: "tavily" }, t("searchModelTypeTavily")),
            react.createElement("option", { value: "firecrawl" }, t("searchModelTypeFirecrawl")),
            react.createElement("option", { value: "deepseek" }, t("searchModelTypeDeepseek"))),
          type === "deepseek" ? react.createElement("input", {
            type: "text",
            placeholder: t("searchModelId"),
            value: modelId,
            onChange: (e) => setModelId(e.target.value),
            "aria-label": t("searchModelId"),
          }) : null,
          react.createElement("input", {
            type: "password",
            placeholder: t("searchModelApiKey"),
            value: apiKey,
            onChange: (e) => setApiKey(e.target.value),
            "aria-label": t("searchModelApiKey"),
            autoComplete: "off",
          }),
          react.createElement("input", {
            type: "text",
            placeholder: t("searchModelBase"),
            value: baseURL,
            onChange: (e) => setBaseURL(e.target.value),
            "aria-label": t("searchModelBase"),
          }),
          react.createElement("button", { type: "button", onClick: addModel }, t("searchModelAdd")),
          formError ? react.createElement("div", { className: "dshm-search-form-error" }, formError) : null);
        const header = react.createElement("button", {
          type: "button",
          className: "dshm-plugin-card-head",
          "aria-expanded": open ? "true" : "false",
          onClick: () => setOpen(!open),
        },
          react.createElement("span", { className: "dshm-plugin-card-title" }, t("webSearchTitle")),
          react.createElement("span", { className: "dshm-plugin-card-desc" }, t("webSearchDesc")),
          react.createElement("span", { className: "dshm-plugin-card-chevron" },
            react.createElement("svg", { width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", "aria-hidden": true },
              react.createElement("path", { d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z", fill: "currentColor" }))));
        return react.createElement("li", { className: "dshm-plugin-card" },
          header,
          open ? react.createElement("div", { className: "dshm-plugin-card-body" },
            form,
            status === "loading" && react.createElement("div", { className: "dshm-tools-status" }, t("toolsLoading")),
            status === "error" && react.createElement("div", { className: "dshm-tools-status" }, "⚠️ " + t("toolsError")),
            status === "ready" && models.length === 0 && react.createElement("div", { className: "dshm-tools-status" }, t("searchModelsEmpty")),
            status === "ready" && models.map((m) => react.createElement("div", { key: m.id, className: "dshm-search-row" },
              react.createElement("div", { className: "dshm-search-row-info" },
                react.createElement("div", { className: "dshm-search-row-name" }, m.label || m.model),
                react.createElement("div", { className: "dshm-search-row-model" },
                  (m.type === "exa" ? "Exa" : m.type === "brave" ? "Brave" : m.type === "bing" ? "Bing" : m.type === "tavily" ? "Tavily" : m.type === "firecrawl" ? "Firecrawl" : "DeepSeek") + " · " + (m.model || "") +
                  " · " + t(m.apiKey ? "searchModelKeySet" : "searchModelKeyUnset"))),
              react.createElement("div", { className: "dshm-search-row-actions" },
                react.createElement("button", {
                  type: "button",
                  className: "dshm-search-mini-btn",
                  "data-current": m.id === current ? "true" : "false",
                  disabled: m.id === current,
                  onClick: () => makeCurrent(m.id),
                }, t("searchModelCurrent")),
                react.createElement("button", {
                  type: "button",
                  className: "dshm-search-mini-btn dshm-danger",
                  onClick: () => removeModel(m.id),
                }, t("searchModelDelete")))))) : null);
      }

      function ToolsPage() {
        useLocaleTick();
        const [state, setState] = react.useState({ status: "loading", tools: [] });
        const [disabled, setDisabled] = react.useState([]);
        const [query, setQuery] = react.useState("");
        const [open, setOpen] = react.useState(null);
        const [saving, setSaving] = react.useState(false);
        const reloadConfig = () => {
          if (typeof fetch !== "function") return;
          fetch("/api/dshm/tools-config", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : { disabled: [] }))
            .then((d) => setDisabled(Array.isArray(d.disabled) ? d.disabled : []))
            .catch(() => {});
        };
        react.useEffect(() => {
          let current = true;
          const load = () => {
            setState((s) => ({ status: "loading", tools: s.tools }));
            if (typeof fetch !== "function") { setState({ status: "error", tools: [] }); return; }
            Promise.all([
              fetch("/api/dshm/tools?session=" + encodeURIComponent(fileSessionId || ""), { cache: "no-store" })
                .then((r) => (r.ok ? r.json() : { tools: [] }))
                .then((d) => d.tools || []),
              fetch("/api/dshm/tools-config", { cache: "no-store" })
                .then((r) => (r.ok ? r.json() : { disabled: [] }))
                .then((d) => (Array.isArray(d.disabled) ? d.disabled : []))
                .catch(() => []),
            ]).then(([tools, dis]) => {
              if (!current) return;
              setState({ status: "ready", tools });
              setDisabled(dis);
            }).catch(() => { if (current) setState({ status: "error", tools: [] }); });
          };
          load();
          return () => { current = false; };
        }, []);
        const toggleTool = (name) => {
          if (saving) return;
          const next = disabled.includes(name) ? disabled.filter((n) => n !== name) : disabled.concat(name);
          setDisabled(next);
          setSaving(true);
          fetch("/api/dshm/tools-config", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ disabled: next, sessionId: fileSessionId || "" }),
          }).then((r) => (r.ok ? r.json() : { ok: false }))
            .then((d) => { setSaving(false); if (!d || d.ok !== true) reloadConfig(); })
            .catch(() => { setSaving(false); reloadConfig(); });
        };
        const { status, tools } = state;
        const q = (query || "").trim().toLowerCase();
        const filtered = q ? tools.filter((tool) =>
          (tool.name || "").toLowerCase().includes(q) ||
          (tool.description || "").toLowerCase().includes(q)) : tools;
        const disabledSet = new Set(disabled);
        return react.createElement("div", { className: "dshm-tools" },
          status === "ready" && react.createElement("input", {
            type: "search",
            className: "dshm-tools-search",
            placeholder: t("toolSearch"),
            value: query,
            onChange: (e) => setQuery(e.target.value),
            "aria-label": t("toolSearch"),
          }),
          status === "loading" && react.createElement("div", { className: "dshm-tools-status" }, t("toolsLoading")),
          status === "error" && react.createElement("div", { className: "dshm-tools-status" }, "⚠️ " + t("toolsError")),
          status === "ready" && tools.length === 0 && react.createElement("div", { className: "dshm-tools-status" }, t("toolsEmpty")),
          status === "ready" && tools.length > 0 && filtered.length === 0 && react.createElement("div", { className: "dshm-tools-status" }, t("toolSearchEmpty")),
          status === "ready" && filtered.map((tool, i) => {
            const isOpen = open === i;
            const isOff = disabledSet.has(tool.name);
            let paramsText = "";
            try { paramsText = JSON.stringify(tool.parameters || {}, null, 2); } catch (_e) { paramsText = String(tool.parameters); }
            return react.createElement("div", { key: tool.name || i, className: "dshm-tool" + (isOff ? " dshm-tool-off" : "") },
              react.createElement("div", { className: "dshm-tool-row" },
                react.createElement("button", {
                  type: "button",
                  className: "dshm-tool-head",
                  onClick: () => setOpen(isOpen ? null : i),
                  "aria-expanded": isOpen ? "true" : "false",
                },
                  react.createElement("div", { className: "dshm-tool-name" }, tool.name || ("tool-" + i)),
                  tool.description ? react.createElement("div", { className: "dshm-tool-desc" }, tool.description) : null),
                react.createElement("button", {
                  type: "button",
                  className: "dshm-switch",
                  role: "switch",
                  "aria-checked": isOff ? "false" : "true",
                  "aria-label": (isOff ? t("toolEnable") : t("toolDisable")) + " " + (tool.name || ""),
                  "data-on": isOff ? "false" : "true",
                  disabled: saving,
                  onClick: (e) => { e.stopPropagation(); toggleTool(tool.name); },
                })),
              isOpen && paramsText !== "{}" && react.createElement("div", { className: "dshm-tool-params" },
                react.createElement("div", { className: "dshm-tool-params-title" }, t("toolParameters")),
                react.createElement("pre", null, paramsText)));
          }));
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

      const inputTriggers = ctx.get("inputTriggers");
      if (inputTriggers !== undefined) {
        ctx.effect(() => inputTriggers.registerSource({
          trigger: "/",
          name: "upload-file",
          order: 60,
          candidates: () => Promise.resolve([{ name: t("pickFile") }]),
          onPick: () => { dshmPickFile(); return "handled"; },
        }), "ui-mobile: upload source");
      }

      ctx.effect(() => {
        // Provider balance display: fetch once at load, then inject whenever the
        // model-select popup renders provider group titles.
        fetchBalances(true);
        let balMo = null;
        if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
          balMo = new MutationObserver((records) => {
            let relevant = false;
            for (const rec of records) {
              for (const node of rec.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches && (node.matches("._7KE1Ra_groupTitle") ||
                    (node.querySelector && node.querySelector("._7KE1Ra_groupTitle")))) {
                  relevant = true;
                  break;
                }
              }
              if (relevant) break;
            }
            if (relevant) {
              fetchBalances(false);
              if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(injectBalances);
            }
          });
          balMo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }
        return () => {
          if (balMo !== null) balMo.disconnect();
        };
      }, "ui-mobile: provider balances");

      ctx.effect(() => {
        // Keep the "Search model" row in sync with the model-select menu:
        // fetch the model list, then (re)place/remove the row whenever the
        // menu or its groups change (open, close, switch to reasoning level…).
        let smMo = null;
        let scheduled = false;
        const sync = () => {
          scheduled = false;
          fetchSearchModels();
          if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(ensureSearchModelRow);
        };
        const schedule = () => {
          if (scheduled) return;
          scheduled = true;
          if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(sync);
          else sync();
        };
        if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
          smMo = new MutationObserver((records) => {
            let relevant = false;
            for (const rec of records) {
              for (const node of rec.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches && (node.matches("._7KE1Ra_menu, ._7KE1Ra_cell, ._7KE1Ra_groupTitle, ._7KE1Ra_option") ||
                    (node.querySelector && node.querySelector("._7KE1Ra_menu, ._7KE1Ra_cell, ._7KE1Ra_groupTitle, ._7KE1Ra_option")))) {
                  relevant = true;
                  break;
                }
              }
              if (relevant) break;
            }
            if (relevant) schedule();
          });
          smMo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }
        return () => {
          if (smMo !== null) smMo.disconnect();
        };
      }, "ui-mobile: search model row");

      const slots = ctx.get("slots");
      if (slots === undefined) return;
      ctx.effect(() => {
        // Re-apply the saved chat background once the layout frame is mounted,
        // and keep watching for the conversation root being remounted.
        applyAiBubble(readAiBubble());
        let tries = 0;
        const tryRender = () => {
          if (chatRoot()) {
            syncBg();
            ensureAvatars();
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
        // Avatar injection: react when message flow items are added/removed
        // (covers streaming, session switches and remounts).
        let avMo = null;
        if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
          avMo = new MutationObserver((records) => {
            let relevant = false;
            for (const rec of records) {
              for (const node of rec.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches && (node.matches("[data-chat-flow-kind]") ||
                    (node.querySelector && node.querySelector("[data-chat-flow-kind]")))) {
                  relevant = true;
                  break;
                }
              }
              if (relevant) break;
            }
            if (relevant && typeof requestAnimationFrame !== "undefined") requestAnimationFrame(ensureAvatars);
          });
          avMo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }
        return () => {
          if (mo !== null) mo.disconnect();
          if (avMo !== null) avMo.disconnect();
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
        const off5b = slots.inject("settings.general.item", () => slots.register({ name: "settings.general.item", id: "dshm-ai-bubble", order: 28 }, AiBubbleRow));
        const off5c = slots.inject("settings.general.item", () => slots.register({ name: "settings.general.item", id: "dshm-avatar-user", order: 27 }, () => react.createElement(AvatarRow, { side: "user" })));
        const off5d = slots.inject("settings.general.item", () => slots.register({ name: "settings.general.item", id: "dshm-avatar-ai", order: 26 }, () => react.createElement(AvatarRow, { side: "ai" })));
        const off6 = slots.inject("settings.general.item", () => slots.register({ name: "settings.general.item", id: "dshm-chat-bg", order: 25 }, BackgroundRow));
        const off7 = slots.inject("conversation.input.left", () => slots.register({ name: "conversation.input.left", id: "dshm-file-pick", order: 5 }, FilePickButton));
        const off8 = slots.inject("settings.section", () => slots.register({ name: "settings.section", id: "dshm-tools", order: 15, label: () => t("toolsPage") }, ToolsPage));
        const off9 = slots.inject("conversation.input.overlay", () => slots.register({ name: "conversation.input.overlay", id: "dshm-picker-sheet", order: 2 }, PickerSheet));
        // Replaces the stock web-search card: same id, LOWER priority shadows
        // the shipped entry (lowest priority renders), avoiding the
        // "already has an entry with id web-search at priority 0" loader error.
        const off10 = slots.inject("settings.plugin.item", () => slots.register({ name: "settings.plugin.item", id: "web-search", order: 20, priority: -10, label: () => t("webSearchTitle") }, WebSearchCard));
        const off12 = slots.inject("conversation.session.header.actions", () => slots.register({ name: "conversation.session.header.actions", id: "dshm-message-edit", order: 50 }, MessageEditInjector));
        return () => { off1(); off2(); off2b(); off3(); off4(); off5(); off5b(); off5c(); off5d(); off6(); off7(); off8(); off9(); off10(); off12(); };
      }, "ui-mobile: slots");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});

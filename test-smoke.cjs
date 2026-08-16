const fs = require("fs");
const path = require("path");
const PROFILE = "/data/data/com.termux/files/usr/lib/node_modules/@deepseek-ai/dsh/node_modules";
const React = require(path.join(PROFILE, "react"));
const ReactDOMServer = require(path.join(PROFILE, "react-dom/server"));
console.log("react version:", require(path.join(PROFILE, "react/package.json")).version);

const code = fs.readFileSync("/data/data/com.termux/files/home/projects/dsh-client-ui-mobile/lib/client.js", "utf8");

const captured = [];
const registrations = [];

let fakeSessionsCurrent = "session-aaa";
const fakeSessions = {
  list: {
    getSnapshot: () => ({ current: fakeSessionsCurrent, byId: {} }),
    subscribe: (fn) => { fakeSessionsSub = fn; return () => { fakeSessionsSub = null; }; },
  },
};
let fakeSessionsSub = null;
const fakeSlotService = {
  inject(name, register) { registrations.push({ name }); register(fakeSlotService); return () => {}; },
  register(desc, Comp) { captured.push({ desc, Comp }); return { dispose: () => {} }; },
};

const ctx = {
  get(name) {
    if (name === "slots") return fakeSlotService;
    if (name === "locale") {
      const loc = (key) => key;
      loc.tick = () => 0;
      loc.subscribe = () => () => {};
      loc.getSnapshot = () => ({ lang: "zh" });
      return loc;
    }
    if (name === "sessions") return fakeSessions;
    return undefined;
  },
  effect(cb) { cb(); return () => {}; },
  on() { return () => {}; },
  root: { ctx: {} },
};

function fakeEl() {
  return {
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    style:{}, appendChild(){}, removeChild(){},
    classList:{ add(){}, remove(){} }, dataset: {}, textContent: "",
    addEventListener(){}, removeEventListener(){},
  };
}
global.document = {
  body: fakeEl(),
  head: fakeEl(),
  documentElement: fakeEl(),
  createElement: () => fakeEl(),
  createElementNS: () => fakeEl(),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener(){}, removeEventListener(){},
};
global.window = {
  __ModuleLoader__: { load(def) { captured.push(def); } },
  addEventListener(){}, removeEventListener(){},
};
global.MutationObserver = class { constructor(cb){ this.cb = cb; } observe(){} disconnect(){} };
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.fetch = () => Promise.reject(new Error("no fetch"));
global.localStorage = { getItem: () => null, setItem(){}, removeItem(){} };

new Function("window", code)(global.window);
const def = captured.find((d) => d.id === "@local/dsh-client-ui-mobile");
if (!def) { console.error("module not captured"); process.exit(1); }

const requireStub = (id) => {
  if (id === "react") return React;
  if (id === "react-dom/server") return ReactDOMServer;
  if (id === "react-dom") return { render(){}, hydrate(){}, createRoot(){ return { render(){} }; } };
  if (id === "react-dom/client") return { createRoot(){ return { render(){} }; } };
  throw new Error("unexpected require: " + id);
};
const exportsObj = def.factory(requireStub);

exportsObj.apply(ctx);
console.log("apply ran; slot registrations:", registrations.map(r => r.name).join(", "));
console.log("captured occupants:", captured.filter(c => c.Comp).map(c => c.desc.id).join(", "));

for (const c of captured.filter(c => c.Comp)) {
  try {
    const el = React.createElement(c.Comp, { sessionId: "s1", messageId: "m1" });
    const html = ReactDOMServer.renderToStaticMarkup(React.createElement(React.StrictMode, null, el));
    console.log("occupant", c.desc.id, "rendered:", html.slice(0, 120));
  } catch (e) {
    console.error("occupant", c.desc.id, "THREW:", e && e.stack ? e.stack.split("\n").slice(0, 4).join("\n") : e);
    process.exitCode = 1;
  }
}
console.log("SMOKE DONE"); process.exit(0);

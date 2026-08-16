# dsh-client-ui-mobile

Mobile-browser adaptation for the [DSH](https://github.com/deepseek-ai/deepseek-harness) Web UI, plus message editing and multi-provider web search. Desktop browsers keep the original layout; only mobile browsers (detected by UA) get the mobile view.

Tested against DSH `0.1.0-rc.6` (web profile). The core layout relies on stable framework data attributes and should survive upgrades; a few detail styles depend on version-specific class names, see the compatibility note below.

---

## Features

| Feature | Description |
|---|---|
| Drawer layout | On mobile the sidebar is hidden and the conversation fills the screen; the top-left button opens the sidebar drawer, tapping the backdrop closes it |
| Desktop unchanged | Desktop UA renders the original layout |
| Message editing | Every AI and user message has edit, delete, and regenerate buttons. Edit changes text only and never re-invokes the AI; delete removes just the target message (deleting an AI message also removes that turn's tool-call records); regenerate re-runs from the clicked user message |
| Multi-provider web search | Settings - Plugins - Web search: configure search services across 12 providers (Exa, Brave, Bing, Tavily, Firecrawl, DeepSeek, You.com, Serper, SerpApi, Kagi, SearXNG self-hosted, Bocha), each with its own API key; switch the active service from the "Search model" entry in the model picker |
| Tool management | Settings - Tools: filter by name or description, enable or disable each tool; stored in `~/.dsh/dshm-tools-config.json`, survives restarts |
| File upload | Type `/` or tap the plus button on the left of the input bar to upload a phone file into the current working directory; the path is appended to the input (not sent automatically) |
| Balance display | Provider balances in the model picker (DeepSeek / OpenRouter / OpenAI); providers without a balance API are hidden |
| Chat background and avatars | Settings - General: background image (crop, blur, frosted glass), AI bubble color, user and AI avatars (upload + circular crop) |
| Enter key setting | Settings - General - Mobile enter key: send or insert a newline |
| Stats bar | Bottom conversation stats collapse to a one-line preview; message time, duration, TTFT and tok/s are shown in full |
| Bilingual UI | Plugin strings follow the app language (Chinese / English) |

See [CHANGELOG.md](./CHANGELOG.md) for the full history.

## Install

Requires DSH with the web profile installed, i.e. `~/.dsh/profiles/web/` exists.

```bash
git clone <repo-url> dsh-client-ui-mobile
cd dsh-client-ui-mobile
./install.sh
```

The script copies the plugin to `~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/`, adds the composition rows to `~/.dsh/profiles/web/cordis.patch.yml`, and switches the `web` row's `searchProvider` to `dshm-search` (required by the search feature).

Restart DSH and hard-refresh the browser.

Manual install:

```bash
mkdir -p ~/.dsh/profiles/web/node_modules/@local
cp -r lib package.json ~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/
```

Then append to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- id: web
  config:
    searchProvider: dshm-search

- insert:
    - id: ui-mobile
      name: '@local/dsh-client-ui-mobile'
```

Restart DSH and refresh.

## Uninstall

```bash
./uninstall.sh
```

Or manually delete `~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/`, remove the `ui-mobile` row from `cordis.patch.yml`, and restart DSH.

## Usage

- Open the DSH page from a mobile browser and the mobile layout activates automatically
- Buttons under each message: edit (change text), delete, regenerate (user messages only, re-runs from that message)
- Settings - Plugins - Plugin configuration - Web search: add a search service (type + API key); SearXNG takes a self-hosted base URL and needs no key; switch providers via the "Search model" entry in the model picker
- Settings - Tools: toggle individual tools
- Type `/` or tap the plus button to upload a file

## Mobile detection

UA only:

```
/Android|iPhone|iPod|iPad|Windows Phone|Mobile/i.test(navigator.userAgent)
```

- Mobile UA enables the mobile layout
- A desktop UA (e.g. "Request desktop site") shows the desktop layout

## Compatibility notes

- The core drawer layout uses stable data attributes (`data-sidebar-collapsed`, `data-details-collapsed`, `data-shell-overlay`) and usually keeps working after DSH upgrades
- Detail styles (settings panel, stats bar, message metadata) depend on generated CSS class names of the current version; if one breaks after an upgrade, update the matching class names in `lib/client.js`
- This is a community plugin, not an official DSH component; back up `cordis.patch.yml` before editing it

## License

[MIT](./LICENSE)

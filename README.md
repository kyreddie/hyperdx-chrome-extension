# HyperDX Chrome Extension

Inject [@hyperdx/browser](https://github.com/hyperdxio/hyperdx-js) into any website for local RUM debugging and session replay — similar to the [Grafana Faro Chrome plugin](https://github.com/erikwennerberg/grafana-faro-chrome-plugin).

The SDK is bundled locally (~480KB) so it works on pages with strict Content Security Policy (no dependency on unpkg at runtime).

## Requirements

- Google Chrome or Chromium-based browser (Edge, Brave, etc.)
- HyperDX ingestion endpoint (cloud or self-hosted), if you want telemetry to be stored

## Install (unpacked / developer mode)

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the `my_hyperdx_ext` folder (this directory).

The extension should appear as **HyperDX Browser Extension**.

## Configure

1. Click the extension icon in the toolbar.
2. Set **Service Name** (required) — e.g. `my-frontend-app`.
3. Optionally set **API Key** — required for HyperDX Cloud; leave empty for some self-hosted setups.
4. Optionally set **Collector URL** — default cloud endpoint is `https://in-otel.hyperdx.io`.
5. Toggle **Only inject on matching URLs** if you want to limit which sites are instrumented.

### URL pattern examples

| Pattern | Matches |
|--------|---------|
| `http://homedepot.com/*` | HTTP only on `homedepot.com` |
| `*://homedepot.com/*` | HTTP and HTTPS on `homedepot.com` |
| `*://*.homedepot.com/*` | Subdomains such as `www.homedepot.com` |
| `https://localhost:3000/*` | Local dev server on port 3000 |

One pattern per line (or comma-separated). Reload the tab after saving.

## Verify it works

1. Open DevTools on a monitored page (**Console** tab).
2. Reload the page after saving extension settings.
3. Look for:

```
[HyperDX Extension] Configuration valid, injecting HyperDX
[HyperDX Extension] Injected via extension scripts
[HyperDX Extension] HyperDX initialized
```

4. Check your HyperDX / ClickStack UI under **Client Sessions**.

## Reload after code changes

Whenever you change extension files:

1. Go to `chrome://extensions` → **Reload** on this extension.
2. **Hard-refresh** (or close and reopen) tabs you are testing — old content scripts can show `chrome-extension://invalid/` errors.

## Updating the bundled SDK

The browser bundle is pinned to `@hyperdx/browser@0.24.0`:

```bash
curl -fsSL "https://unpkg.com/@hyperdx/browser@0.24.0/build/index.js" \
  -o js/hyperdx-browser.bundle.js
```

Then reload the extension in Chrome.

## Troubleshooting

| Symptom | What to try |
|--------|-------------|
| `chrome-extension://invalid/` | Reload extension + refresh the tab |
| CSP blocks inline script | Extension uses external `chrome-extension://` scripts first; reload extension |
| CSP blocks extension scripts | Page may only allow inline scripts — extension falls back automatically; some sites block both |
| No injection on a site | Check **Enable** toggle and URL filter patterns |
| `HyperDX: Missing apiKey` | Expected if API key is empty; add a key for cloud ingestion |

## Project layout

```
my_hyperdx_ext/
├── manifest.json
├── popup.html
├── css/popup.css
├── js/
│   ├── content.js              # Reads config, injects SDK
│   ├── hyperdx-browser.bundle.js
│   ├── pageInit.js             # HyperDX.init() in page context
│   ├── urlPatterns.js
│   └── popup.js
└── icons/
```

## Publish to GitHub

From the repository root (parent of `my_hyperdx_ext`):

```bash
# One-time: sign in to GitHub
gh auth login

# Create a new public repo and push (pick a name you prefer)
gh repo create hyperdx-chrome-extension --public --source=. --remote=origin --push

# Or push to an existing repo you already created on GitHub:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

The extension lives in `my_hyperdx_ext/`. To use only that folder as the repo root, copy or clone just that directory into its own repository.

## Privacy

This extension injects observability code into pages you visit. Use only on sites you are allowed to debug, and avoid committing API keys to version control.

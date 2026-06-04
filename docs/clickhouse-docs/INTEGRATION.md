# ClickHouse docs integration

These files are formatted for the [clickhouse-docs](https://github.com/ClickHouse/clickhouse-docs) repository and can be opened as a pull request there.

## Files to add

| Source (this repo) | Destination (clickhouse-docs) |
|--------------------|-------------------------------|
| `docs/clickhouse-docs/docs/use-cases/observability/clickstack/example-datasets/chrome-extension.md` | `docs/use-cases/observability/clickstack/example-datasets/chrome-extension.md` |
| `docs/clickhouse-docs/static/images/clickstack/chrome-extension/extension-config.png` | `static/images/clickstack/chrome-extension/extension-config.png` |

## Sidebar entry

Add a row to the table in `docs/use-cases/observability/clickstack/example-datasets/index.md`:

```markdown
| [Chrome Extension](chrome-extension.md) | Inject the Browser SDK into any website using the HyperDX Chrome extension — no application code changes required |
```

Suggested placement: after the Session Replay Demo row.

## Published URL

After merge, the page will be available at:

https://clickhouse.com/docs/use-cases/observability/clickstack/example-datasets/chrome-extension

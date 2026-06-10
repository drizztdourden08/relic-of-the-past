<!-- @layer docs @kind doc -->
# Build from Source

## Prerequisites

- **Node.js ≥ 24** (see [`.nvmrc`](https://github.com/drizztdourden08/relic-of-the-past/blob/master/.nvmrc)).
- A legally obtained *A Link to the Past* ROM — supplied at runtime, **never committed**.
- The WebAssembly core is committed **prebuilt**, so a normal build does **not** need the Emscripten
  SDK. You only need it when changing C under `core/` — see [Building the WASM Core](building-wasm.md).

## Run & build

```bash
npm install          # install dependencies
npm run dev          # electron-vite dev server + Electron
npm run build        # production build (electron-vite)
npm run build:win    # packaged build (see package.json for :mac / :linux)
```

For testing, always launch so the app never steals focus or makes noise:

```bash
npm run dev -- -- --no-focus --muted
```

## Quality gate

```bash
npm run lint     # tsc --noEmit && eslint .
npm run analyze  # classify + lint ALL file types (analyze:diff / :ci / :tag variants)
npm run ci       # tsc + eslint + repo analysis (what CI runs)
```

A PostToolUse lint hook flags coding-standard violations on every edit, and a Stop hook gates changed
files each turn (`analyze:ci`). Run the `coding-standards` skill's checkup after changes.

## First run

The app needs a user-provided ROM and asset blob (`assets/*.sfc`, `assets/assets.dat`) — gitignored,
never committed (same for `test-roms/` and `saves/`). On first launch, import your ROM and the app
extracts what it needs locally. See [Quick Start](../getting-started/quick-start.md) and
[Importing a ROM](../getting-started/importing-a-rom.md).

## Repo orientation

| Path | What |
|------|------|
| `core/zelda3/` | Vendored C decompilation (treat as upstream). |
| `core/game-hooks/` · `core/wasm-build/` | Our C hook layer + Emscripten build. |
| `apps/desktop/src/` | React renderer (`lib/game/` is the bridge; `stores/`, `ui/`). |
| `apps/desktop/electron/` | Main process + preload ([Electron & IPC](../architecture/electron-ipc.md)). |
| `shared/` | Pure code shared by renderer + electron ([asset-extraction](../architecture/asset-extraction.md), [navigation](../architecture/navigation.md), types). |
| `tests/` · `scripts/` · `docs/` | Tests, build helpers, documentation. |

Path aliases: `@shared/*` → `shared/`, `@app/*` → `apps/desktop/src/`. See the
[Architecture overview](../architecture/overview.md) for zones and dependency invariants.

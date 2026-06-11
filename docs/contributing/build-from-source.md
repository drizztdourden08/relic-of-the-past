<!-- @layer docs @kind doc -->
# Build from Source

## Prerequisites

- Node.js ≥ 24 (see [`.nvmrc`](https://github.com/drizztdourden08/relic-of-the-past/blob/master/.nvmrc)).
- A legally obtained *A Link to the Past* ROM, supplied at runtime and kept out of commits.
- Emscripten SDK (Windows; the repo expects it at `E:\GameProjects\emsdk` or `$EMSDK`). The WASM core
  is gitignored rather than committed. `npm run dev` / `npm run build` auto-build it on first run, and
  again whenever C under `core/` changes, via the `ensure-wasm` pre-step. See
  [Building the WASM Core](building-wasm.md).

## Run & build

```bash
npm install          # install deps; auto-fetches the Electron binary (ensure-electron)
npm run dev          # electron-vite dev server + Electron (auto-builds WASM if missing/stale)
npm run build        # production build (electron-vite) — also auto-builds WASM
npm run build:win    # packaged build (see package.json for :mac / :linux)
```

`npm install` runs `ensure-electron` (re-fetches Electron's native binary if a bare `node_modules`
left it out), and `dev`/`build` run `ensure-wasm` first — a fast mtime check that rebuilds the WASM
core only when it's missing or a C source changed. Force a WASM rebuild with `npm run ensure-wasm`.

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

The app needs a user-provided ROM and asset blob (`assets/*.sfc`, `assets/assets.dat`). These stay
gitignored and out of commits, as do `test-roms/` and `saves/`. On first launch, import your ROM and the
app extracts what it needs locally. See [Quick Start](../getting-started/quick-start.md) and
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

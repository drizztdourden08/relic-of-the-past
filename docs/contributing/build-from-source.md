<!-- @layer docs @kind doc -->
# Build from Source

## Prerequisites

- Node.js ≥ 24 (see [`.nvmrc`](https://github.com/drizztdourden08/relic-of-the-past/blob/master/.nvmrc)).
- pnpm 10. Run `corepack enable` once and Node provides the version `package.json` pins in
  `packageManager`. The repo is a pnpm workspace, and `pnpm install` installs every package in it.
- A legally obtained *A Link to the Past* ROM, supplied at runtime and kept out of commits.
- Emscripten SDK (Windows; at `third_party/emsdk` in the main checkout, or `$EMSDK`; version pinned in `package.json`). The WASM core
  is gitignored, not committed. `pnpm run dev` / `pnpm run build` auto-build it on first run, and
  again whenever C under `core/` changes, via the `ensure-wasm` pre-step. See
  [Building the WASM Core](building-wasm.md).

## Run & build

```bash
pnpm install          # install deps; auto-fetches the Electron binary (ensure-electron)
pnpm run dev          # brock dev in apps/desktop: dev server + Electron (auto-builds WASM if missing/stale)
pnpm run build        # packaged Windows build (brock build in apps/desktop, then electron-builder), auto-builds WASM too
pnpm run build:web    # brock web build in apps/desktop: the renderer alone, into apps/desktop/dist/web
pnpm run build:win    # packaged build (see package.json for :mac / :linux)
```

`pnpm install` runs `ensure-electron` (re-fetches Electron's native binary if a bare `node_modules`
left it out), and `dev`/`build` run `ensure-wasm` first. That is a fast mtime check, and it rebuilds the
WASM core only when it's missing or a C source changed. Force a WASM rebuild with `pnpm run ensure-wasm`.

For testing, always launch so the app never steals focus or makes noise:

```bash
pnpm run dev -- --no-focus --muted
```

## Local ports

Every local server the project runs sits in one fixed block of ports. The base and each role
are defined once, in `packages/hub-contracts/src/ports/ports.constants.ts`; nothing else writes a port number.

| Offset | Role |
|---|---|
| +0 | the app's renderer dev server (`pnpm run dev`) |
| +1 | reserved for a component catalogue |
| +2 | the Sanctuary site (`pnpm --filter @rotp/sanctuary dev`) |
| +3 | the Sanctuary API (`pnpm --filter @rotp/sanctuary-api dev`), which the site proxies `/api` to |
| +4 | a static file server, for testing install manifests |
| +5 | the mGBA Lua socket tracer |
| +6 | the Hookshop site (`pnpm --filter @rotp/store dev`) |
| +7 | the Hookshop API (`pnpm --filter @rotp/store-api dev`), which the store proxies `/api` to |
| +8 to +9 | free for other project tools |

The two sites are Brock side web apps: each `brock.site.ts` names its offset and its API's
offset, and these must match the roles above. An API's `dev` script serves its bundle
(`pnpm run bundle` first) on its own offset.

A worktree can carry a `.rotp-port-slot` file holding a slot number N (or set
`ROTP_PORT_SLOT`); the whole block then moves up by 10 x N, so two checkouts never ask for
the same port. The sites and their APIs read Brock's `.brock-port-slot` (or `BROCK_PORT_SLOT`)
instead, which a worktree carries with the same slot. The main checkout is slot 0. The dev servers use `strictPort`, so a port
already in use stops them with an error instead of moving them somewhere unexpected.

## Quality gate

```bash
pnpm run lint     # tsc --noEmit && eslint .
pnpm run analyze  # classify + lint ALL file types (analyze:diff / :ci / :tag variants)
pnpm run ci       # tsc + eslint + repo analysis (what CI runs)
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
| `apps/desktop/src/` | React renderer (`game/`, `stores/`, `views/`, `widgets/`, `hud/`). |
| `apps/desktop/electron/` | Main process + preload ([Electron & IPC](../architecture/electron-ipc.md)). |
| `packages/` | Workspace packages shared by renderer + electron, imported as `@rotp/*`: `game-core` (the WASM bridge), [asset-extraction](../architecture/asset-extraction.md), [navigation](../architecture/navigation.md), `game-data`, and more. |
| `tests/` · `scripts/` · `docs/` | Test fixtures and the coverage registry (each package and app keeps its tests in its own `tests/` folder), build helpers, documentation. |

The path alias `@app/*` points at `apps/desktop/src/`. See the
[Architecture overview](../architecture/overview.md) for zones and dependency invariants.

## The private companion repository (optional)

Some material this project uses is derived from the original game and is not tracked in
this repository: the named save states the end-to-end tests load. Those live in a
separate **private** repository and are copied into place on demand. The record dataset
itself is not one of them: `packages/game-data/src/data/records/` (screens, connections, checks,
items, actors and the rest) is an ordinary tracked directory in this repository, and
needs no access to the private one.

**You do not need the private repository.** Without access:

- the app builds and runs, with the full record dataset already in place,
- `pnpm run lint` and the unit tests pass,
- the end-to-end tests that need a save state report as *skipped*.

The private repository is a **sibling checkout**, not something this repository clones.
Put it beside this one as `../rotp-vault`, or point `ROTP_VAULT_DIR` at it. Inside it,
the `tree/` folder mirrors this repository's own paths, so a file at
`tree/tests/fixtures/save-states/intro.sav` lands at `tests/fixtures/save-states/intro.sav`.
The path is the whole mapping; there is nothing else to configure, and anything the
vault keeps outside `tree/` is never touched.

```bash
pnpm run vault:sync
```

Sync runs **both ways**. It indexes both sides by content, compares them against the
state recorded by the last run, and applies every change that is unambiguous: a file
edited only here is written to the vault, a file edited only there is written to your
checkout, and a deletion on either side is carried across. Anything edited on *both*
sides since the last sync is a conflict, so it is reported and left alone. Writes into the
vault are committed there on its current branch; pushing them onward is left to you.

It also runs automatically after `pnpm install`, and is a no-op with a single line of
output when you have no access, and it never fails a build. To see what would change
without writing anything:

```bash
pnpm run vault:status
```

To settle conflicts wholesale, declare a winner:

```bash
pnpm run vault:force-pull
```

```bash
pnpm run vault:force-push
```

Access is granted per contributor; ask the repository owner if you need it.

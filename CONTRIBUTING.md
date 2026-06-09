<!-- @layer root-config @kind doc -->
# Contributing to Relic of the Past

Thanks for your interest in improving the project! This guide covers how to get set up and the
conventions we follow. By participating you agree to keep interactions respectful and constructive.

> [!IMPORTANT]
> This is an unofficial fan-made/open-source project, not affiliated with Nintendo. **Never commit
> copyrighted game assets, ROMs, or extracted data.** The app ships no game data — contributors and
> users provide their own legally obtained ROM. PRs that add such material will be rejected.

## Prerequisites

- **Node.js ≥ 24** (see [`.nvmrc`](.nvmrc))
- A legally obtained *A Link to the Past* ROM, supplied at runtime (never committed)
- The WebAssembly core is committed prebuilt, so a normal build does **not** require the Emscripten
  SDK. You only need it when changing C code under `core/`.

## Getting set up

```bash
npm install
npm run dev          # run the app in development
```

See [docs/getting-started.md](docs/getting-started.md) for first-run details.

## Project layout

A three-layer architecture (C → WASM bridge → React/Electron). Read these before diving in:

- [CLAUDE.md](CLAUDE.md) — the project guide and architecture overview
- [docs/architecture.md](docs/architecture.md) — zone map and dependency invariants
- [docs/design-system.md](docs/design-system.md) — component tiers and design tokens

## Coding standards (enforced)

Standards are **mechanically enforced** — see [docs/coding-standards.md](docs/coding-standards.md).
The highlights:

- **≤ 200 lines per file**, one thing per file, deep logical folders
- **Arrow functions only**; exports grouped at the end; `import type { … }` for type-only imports
- No raw hex/colors in component CSS; no raw HTML outside design-system primitives
- Every file is tagged (`@layer`/`@kind`) and analyzed

Before opening a PR, run the same gate CI runs:

```bash
npm run ci    # tsc + eslint + repo analysis + WASM export-drift check
```

If you change C code in `core/`, keep the `EXPORTED_FUNCTIONS` lists in `build.bat` and `Makefile`
in sync (`npm run check:exports` enforces this) and rebuild the WASM.

## Tests

Automated tests are intentionally minimal. Playwright is available as a **tool**, not a committed
suite — write throwaway specs in `tests/scratch/` (gitignored), run, then delete. The only permanent
spec is `tests/snapshot.spec.ts` (the visual-snapshot harness). Prefer the app's built-in automation
flags (`--auto-state`, `--screenshot`, `--dump-layers`, `--dump-nav`) — see
[docs/testing-capabilities.md](docs/testing-capabilities.md).

## Commits & pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`,
  `refactor:`, `docs:`…), scoped where helpful (e.g. `fix(design): …`).
- Branch from `master`; keep PRs focused and small.
- Fill out the PR template and make sure `npm run ci` passes.
- Update relevant docs when behavior changes.

## Reporting bugs & requesting features

Use the issue templates. For security-sensitive reports, follow [SECURITY.md](SECURITY.md) instead of
opening a public issue.

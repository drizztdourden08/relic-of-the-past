<!-- @layer root-config @kind doc -->
# Contributing to Relic of the Past

Thanks for your interest in improving the project! This guide covers how to get set up and the
conventions we follow. By participating you agree to keep interactions respectful and constructive.

> [!IMPORTANT]
> This is an unofficial fan-made/open-source project, not affiliated with Nintendo. **Never commit
> copyrighted game assets, ROMs, or extracted data.** The app ships no game data, so contributors and
> users bring their own legally obtained ROM. PRs that add such material will be rejected.

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

See the [Quick Start](docs/getting-started/quick-start.md) for first-run details, and the
[Contributing guide](docs/contributing/index.md) for the full contributor handbook.

## Project layout

A three-layer architecture (C → WASM bridge → React/Electron). Read these before diving in:

- [CLAUDE.md](CLAUDE.md) is the project guide and architecture overview
- [docs/architecture/overview.md](docs/architecture/overview.md) has the zone map and dependency invariants
- [docs/contributing/design-system.md](docs/contributing/design-system.md) covers component tiers and design tokens

## Coding standards (enforced)

Standards are **mechanically enforced**. The full set is in [docs/contributing/coding-standards.md](docs/contributing/coding-standards.md).
The highlights:

- **≤ 200 lines per file**, one thing per file, deep logical folders
- **Arrow functions only**; exports grouped at the end; `import type { ... }` for type-only imports
- No raw hex/colors in component CSS; no raw HTML outside design-system primitives
- Every file is tagged (`@layer`/`@kind`) and analyzed

Before opening a PR, run the same gate CI runs:

```bash
npm run ci    # tsc + eslint + repo analysis
```

If you change C code in `core/`, rebuild the WASM. New `Wasm*` exports only need
the `EMSCRIPTEN_KEEPALIVE` tag (which exports them), so there is no `EXPORTED_FUNCTIONS`
list to maintain in `build.bat`/`Makefile`.

## Copyright / media gate

An automatic gate flags any **media** (images, audio, video, music, fonts, ROM/asset binaries) or
**Nintendo trademark reference** you add. It runs locally via a `commit-msg` hook and on GitHub
via the **Copyright Gate** check. The project ships no game assets, so anything flagged needs explicit
approval: add `[allow-copyright]` to your commit message, or (for PRs) a maintainer applies the
`copyright-ok` label. Full details: [docs/contributing/copyright-gate.md](docs/contributing/copyright-gate.md).

## Tests

Automated tests are intentionally minimal. Playwright is available as a **tool**, not a committed
suite, so write throwaway specs in `tests/scratch/` (gitignored), run them, then delete them. The only permanent
spec is `tests/snapshot.spec.ts` (the visual-snapshot harness). Prefer the app's built-in automation
flags (`--auto-state`, `--screenshot`, `--dump-layers`, `--dump-nav`). They are documented in
[docs/contributing/testing.md](docs/contributing/testing.md).

## Commits & pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`,
  `refactor:`, `docs:`, and so on), scoped where helpful (e.g. `fix(design): ...`).
- Branch from `master`; keep PRs focused and small.
- Fill out the PR template and make sure `npm run ci` passes.
- Update relevant docs when behavior changes.

## Reporting bugs & requesting features

Use the issue templates. For security-sensitive reports, follow [SECURITY.md](SECURITY.md) instead of
opening a public issue.

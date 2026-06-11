<!-- @layer docs @kind doc -->
# Contributing Guide

Thanks for helping improve Relic of the Past! This is the contributor hub; the repo-root
[`CONTRIBUTING.md`](https://github.com/drizztdourden08/relic-of-the-past/blob/master/CONTRIBUTING.md)
is the short version GitHub surfaces, and points here.

> [!IMPORTANT]
> This is an unofficial fan project, not affiliated with Nintendo. Keep ROMs, game assets, and
> extracted data out of commits. PRs that add such material are rejected, and the
> [Copyright Gate](copyright-gate.md) flags them automatically.

## Start here

1. [Build from Source](build-from-source.md) — Node ≥ 24, `npm install`, `npm run dev`. The WASM
   core is committed prebuilt, so you don't need Emscripten for normal work.
2. [Coding Standards](coding-standards.md) — ≤200 lines/file, arrow functions, exports at end,
   one-thing-per-file, deep folders. ESLint and hooks enforce all of it.
3. [File Tagging & Analysis](file-tagging.md) — every file carries `@layer`/`@kind`; `npm run analyze`
   gates changed files. New file → `npm run analyze:tag`.
4. [Plan Format](plan-format.md) — every implementation plan names its design pattern(s), shows a
   CRUD filetree, the data model in TS, and a flow diagram.

## When your change touches…

| Area | Read |
|------|------|
| C / the game core | [Building the WASM Core](building-wasm.md), [Adding a WASM Function](adding-a-wasm-function.md) |
| The C↔JS boundary | [Game Hooks Reference](../hooks/overview.md) |
| Renderer ↔ main (Electron IPC) | [Adding an IPC Channel](adding-an-ipc-channel.md), [Electron & IPC](../architecture/electron-ipc.md) |
| Architecture / where code goes | [Architecture overview](../architecture/overview.md) |
| UI components | [Design System](design-system.md), [Design Language](design-language.md) |
| Anything user-visible | run the app and verify — [Testing](testing.md) |

## Before you open a PR

```bash
npm run ci    # tsc + eslint + repo analysis
```

- [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`…), scoped where helpful.
- Branch from `master`, keep PRs small and focused, and fill out the PR template.
- Update docs in [`docs/`](../README.md) when behavior changes. They're the source of truth and sync to the Wiki.
- For security-sensitive reports, follow [Security](../project/security.md) rather than opening a public issue.

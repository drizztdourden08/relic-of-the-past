<!-- @layer root-config @kind doc -->
<div align="center">

<img src="apps/desktop/public/logos/logo-256.png" alt="Relic of the Past" width="160" />

# Relic of the Past

**A modern, cross-platform desktop launcher for the open-source *A Link to the Past* PC port —
polished UI, controller support, save profiles, MSU-1 audio, and randomizer tooling.**

[![CI](https://github.com/drizztdourden08/relic-of-the-past/actions/workflows/ci.yml/badge.svg)](https://github.com/drizztdourden08/relic-of-the-past/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/drizztdourden08/relic-of-the-past?include_prereleases&sort=semver)](https://github.com/drizztdourden08/relic-of-the-past/releases)
[![License](https://img.shields.io/github/license/drizztdourden08/relic-of-the-past)](LICENSE)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-blue)](#installation)
[![Built with](https://img.shields.io/badge/built%20with-Electron%20%2B%20React%20%2B%20WASM-9cf)](#how-it-works)

**Project status:** Pre-release / Beta — actively developed, expect rough edges.

</div>

---

> [!IMPORTANT]
> **Disclaimer.** This is an unofficial fan-made/open-source project. It is not affiliated with,
> endorsed by, sponsored by, or approved by Nintendo. Nintendo, The Legend of Zelda, and related
> names, characters, music, artwork, and assets are trademarks and/or copyrights of Nintendo.
> **No Nintendo-owned game assets are included in this repository — you must provide your own
> legally obtained ROM.**

## What is this?

Relic of the Past wraps a decompiled C reimplementation of the game (compiled to WebAssembly) in a
React UI inside Electron, giving the classic PC port a first-class desktop experience: a real
launcher, per-game save profiles, controller remapping and haptics, MSU-1 music packs, display and
HUD options, and an in-progress randomizer tracker.

It ships **no game data**. On first run you point it at your own ROM; the app extracts the assets it
needs locally on your machine.

## Installation

Download the latest build for your platform from the
[**Releases**](https://github.com/drizztdourden08/relic-of-the-past/releases) page:

| Platform | Download |
|----------|----------|
| Windows  | Portable `.exe` or Installer `.exe` |
| macOS    | `.dmg` |
| Linux    | `.AppImage` or `.deb` |

Then launch the app and select your ROM when prompted. See [docs/getting-started.md](docs/getting-started.md)
and [docs/installation.md](docs/installation.md) for details.

## Build from source

Requires **Node.js ≥ 24** (see [`.nvmrc`](.nvmrc)). The WebAssembly core is committed prebuilt, so a
normal build does **not** need the Emscripten SDK.

```bash
npm install        # install dependencies
npm run dev        # run the app in development
npm run build:win  # produce a packaged build (see package.json for mac/linux)
```

Quality checks (run by CI on every push/PR):

```bash
npm run ci         # tsc + eslint + repo analysis + WASM export-drift check
```

> Rebuilding the WebAssembly core is a separate manual step and is only needed when changing C code
> under `core/`. See `core/wasm-build/` and the project docs.

## How it works

```
core/zelda3 (vendored C)  ──Emscripten──▶  zelda3.{js,wasm}  ◀──ccall──  React UI (Electron)
```

A three-layer architecture: the vendored C decompilation, our C↔JS hook layer compiled to WASM, and
the TypeScript/React renderer. See [docs/architecture.md](docs/architecture.md) and
[CLAUDE.md](CLAUDE.md) for the full picture.

## Documentation

- [Getting started](docs/getting-started.md) · [Installation](docs/installation.md) · [Known limitations](docs/known-limitations.md)
- [Architecture](docs/architecture.md) · [Coding standards](docs/coding-standards.md) · [Design system](docs/design-system.md)
- Features: [profiles](docs/features/profiles.md), [saves](docs/features/saves.md),
  [controllers](docs/features/input-controllers.md), [MSU audio](docs/features/audio-msu.md),
  [HUD](docs/features/hud.md), and more under [docs/features/](docs/features).

## Credits & license

This project stands on the shoulders of the open-source community — see [CREDITS.md](CREDITS.md).
Application code is released under the [MIT License](LICENSE). The vendored decompilation under
`core/zelda3/` is distributed under its own license (`core/zelda3/LICENSE.txt`).

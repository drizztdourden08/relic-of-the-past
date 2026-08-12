<!-- @layer docs @kind doc -->
# Documentation

This folder is the **source of truth** for all project documentation. It is also published to the
project **GitHub Wiki** automatically (see [Wiki sync](#wiki-sync) below) — so the same content
reads well both when browsing the repo and on the Wiki tab.

**👉 Start at [Home](Home.md)**, or jump straight in:

| Section | What's inside |
|---------|---------------|
| [Getting Started](getting-started/quick-start.md) | Quick start, installation, importing a ROM, first launch |
| [User Guide](user-guide/profiles.md) | Every user-facing feature — saves, display, audio, input, cheats, navigation… |
| [Widgets](widgets/overview.md) | The floating panels (inventory, checks, cheats, navigation, debug, logs, dataset) |
| [Architecture](architecture/overview.md) | Zones & invariants, the WASM bridge, asset extraction, navigation, Electron/IPC |
| [Game Hooks Reference](hooks/overview.md) | Every `Wasm*` export and `GameHook_*` callback crossing the C↔JS boundary |
| [Contributing](contributing/index.md) | Build from source, WASM build, coding standards, testing, design system |
| [Legal](legal/third-party-notices.md) | Third-party licenses bundled with the app |

The full navigation menu is [`_Sidebar.md`](_Sidebar.md) (rendered as the Wiki sidebar).

## Conventions

- **Short, single-purpose files**, grouped into deep logical folders — same philosophy as the code
  ([coding standards](contributing/coding-standards.md)).
- Every doc starts with a `<!-- @layer docs @kind doc -->` tag (see [file tagging](contributing/file-tagging.md)).
- Links are relative `.md` paths so they resolve both in-repo and on the Wiki.

## Wiki sync

Pushes to `master` that touch `docs/**` mirror this folder to the `*.wiki` repo via
`.github/workflows/docs-wiki-sync.yml`. **Edit docs here, never on the Wiki** (Wiki edits are
overwritten on the next sync).

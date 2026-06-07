<!-- @layer docs @kind doc -->
# File tagging & whole-project analysis

Every file in the repo is tagged and analyzed by one harness: **`npm run analyze`**
(`scripts/analyze/analyze.mjs`). This is the single source of truth for project
health across **all** languages — not just the eslint-able ones.

## Tags

Each file carries two tags:

- `@layer` — architectural zone (e.g. `renderer-components`, `shared-game`,
  `bridge-wasm`, `electron-main`, `core-game-hooks`, `core-zelda3`, `tooling-scripts`).
- `@kind` — what the file *is*: `data` · `logic` · `component` · `hook` · `types` ·
  `style` · `constants` · `barrel` · `generated` · `test` · `config` · `build` ·
  `doc` · `native` · `asset`.

### Two tag channels (precedence: manifest → header → heuristic)

1. **In-file header** — for any file that can hold a comment:
   ```ts
   /* @layer shared-input @kind data */
   ```
   (CSS/C use `/* */`, Markdown `<!-- -->`, shell/yaml `#`.)
2. **Manifest** — `scripts/analyze/file-tags.jsonc` — for files that *can't* hold a
   comment (JSON, binaries, asm) and to bulk-tag trees we must not edit (vendored
   `core/zelda3/**`). Manifest entries are authoritative.

Add/refresh headers automatically: **`npm run analyze:tag`** (idempotent — skips
files already tagged). New comment-less or vendored files → add a manifest glob.

## Per-kind policy (`scripts/analyze/policy.mjs`)

Baseline cap is **200 code lines**; documented variances:

| kind | cap | linters |
|---|---|---|
| logic / component / hook / types / constants | 200 | eslint + tsc |
| native *(our C: game-hooks, wasm-build)* | 200 | clang-format* |
| barrel | 80 | eslint + tsc |
| style (CSS) | 300 | stylelint |
| test | 300 | eslint + tsc |
| **data / generated / asset / doc / config** | **exempt** | (tsc for data) |

*Data is the deliberate exception:* large tables are organized by **category under
`data/` folders** (or named `*.data.ts`) instead of being held to the logic cap —
see eslint's data override and the P2 reorg.

**Vendored** `core/zelda3/**` is analyzed but its findings are **hints (info)**,
never gating — it's an upstream project we don't fully own.

## Tools (Adapter pattern — `scripts/analyze/adapters/`)

`line-policy` (universal, all languages) · `eslint` (TS/JS) · `tsc` · `stylelint`
(CSS) · `markdownlint` (docs, warn-only) · `clang-format` (our C, *enabled once a
`.clang-format` exists*). Each tool degrades gracefully if not installed.

## Commands

| command | purpose |
|---|---|
| `npm run analyze` | full report over every file (+ `report.json`) |
| `npm run analyze:diff` | only files changed vs HEAD |
| `npm run analyze:ci` | diff + **exit 1 on gating violations** (the gate) |
| `npm run analyze:tag` | insert missing `@layer/@kind` headers |

The **Stop hook** runs `analyze:ci` on changed files after every turn, so size /
quality regressions are caught on exactly the files you touched.

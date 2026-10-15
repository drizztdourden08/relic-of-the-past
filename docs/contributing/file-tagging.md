<!-- @layer docs @kind doc -->
# File tagging & whole-project analysis

Every file in the repo is tagged and checked for size by one harness: **`pnpm run analyze`**
(`tooling/analyze/analyze.mjs`). It reads every language, including the ones eslint cannot read.
Linting itself lives in `pnpm run lint`, `pnpm run lint:md`, `brock prose` and `brock gate`.

## Tags

Each file carries two tags:

- `@layer`: architectural zone (e.g. `renderer-components`, `shared-game`,
  `bridge-wasm`, `electron-main`, `core-game-hooks`, `core-zelda3`, `tooling-scripts`).
- `@kind`: what the file *is*, `data` · `logic` · `component` · `hook` · `types` ·
  `style` · `constants` · `barrel` · `generated` · `test` · `config` · `build` ·
  `doc` · `native` · `asset`.

### Two tag channels (the manifest wins over the header, the header over the heuristic)

1. **In-file header:** for any file that can hold a comment:

   ```ts
   /* @layer shared-input @kind data */
   ```

   (CSS/C use `/* */`, Markdown `<!-- -->`, shell/yaml `#`.)
2. **Manifest:** `tooling/analyze/file-tags.jsonc`, for files that *can't* hold a
   comment (JSON, binaries, asm) and to bulk-tag trees we must not edit (vendored
   `core/zelda3/**`). Manifest entries are authoritative.

Add/refresh headers automatically: **`pnpm run analyze:tag`** (idempotent, so it skips
files already tagged). New comment-less or vendored files get a manifest glob.

## Per-kind policy (`tooling/analyze/policy.mjs`)

Baseline cap is **200 code lines**; documented variances:

| kind | cap |
|---|---|
| logic / component / hook / types / constants | 200 |
| native *(our C: game-hooks, wasm-build)* | 200 |
| barrel | 80 |
| style (CSS) | 300 |
| test | 300 |
| **data / generated / asset / doc / config** | **exempt** |

*Data is the deliberate exception:* large tables are organized by **category under
`data/` folders** (or named `*.data.ts`) instead of being held to the logic cap.

**Vendored** `core/zelda3/**` is analyzed but its findings are **hints (info)**,
never gating, because it's an upstream project we don't fully own.

## Checks (Adapter pattern in `tooling/analyze/adapters/`)

`line-policy` (the cap per kind, all languages) and `dead-css-var` (a CSS variable
that is used but never defined; it counts the variables the repo defines and the ones the
Tessera package's own CSS defines, found by resolving the package). Type checks, eslint, stylelint, markdownlint, prose and
clang-format run through their own commands and are not part of this harness.

## Commands

| command | purpose |
|---|---|
| `pnpm run analyze` | full report over every file (+ `tooling/analyze/report.json`) |
| `pnpm run analyze:diff` | only files changed vs HEAD |
| `pnpm run analyze:ci` | diff + **exit 1 on gating violations** (the gate) |
| `pnpm run analyze:tag` | insert missing `@layer/@kind` headers |

The **Stop hook** runs `analyze:ci` on changed files after every turn, so size
regressions are caught on exactly the files you touched.

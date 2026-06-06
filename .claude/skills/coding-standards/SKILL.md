---
name: coding-standards
description: Enforce this project's strict coding standards on every change — arrow functions, exports-at-end, ≤200 lines/file, one-thing-per-file, logical folder structure, type-only imports, and applying the right design pattern. Use when writing or editing any TS/TSX in this repo, when planning a feature (the plan must state design patterns + final filetree), when doing CRUD on files/components, or when reviewing whether code is clean. Run the post-change checkup before declaring any change done.
---

# Coding standards — apply & verify, every change

Authoritative rules: @docs/coding-standards.md. For smells, refactoring techniques,
design patterns, and SOLID, use the `refactoring-guru` skill. Mechanically backed by
`eslint.config.mjs` + the PostToolUse lint hook — but **do not rely on the hook
alone**; the structural and design-pattern judgment is yours.

## When planning (before writing)

Follow the full plan format: @docs/plan-format.md. Be **concise — show, don't
narrate.** Every plan includes:
1. **Goal** (1–2 sentences).
2. **Design pattern(s)** chosen and *why* (or explicit "no pattern needed"). Reach
   for a pattern the moment its smell appears — see the catalog.
3. **CRUD filetree** — every file with `A`/`M`/`D`/`R` markers, showing the folder
   structure so the one-thing-per-file decomposition is visible up front.
4. **Data model in real TS code** when types change (new, or before→after).
5. **Key code blocks** for the important units (signatures, skeletons).
6. **Flow/preview diagram** (data flow, sequence, or UI wireframe) when it helps —
   generate it with the **asciiflow** MCP server and paste the export inline.

Example plan tail:
```
Patterns: Strategy (per-screen pathfinding), Facade (lib/game API).
Filetree:
  shared/game/navigation/strategies/
  ├── A  FloodFillStrategy.ts   (one strategy, arrow fns, exports at end)
  ├── A  AStarStrategy.ts
  ├── A  strategy.types.ts
  └── M  index.ts               (barrel — + new strategies)
```

## Structural decomposition (how to split)

- **Component** → its own folder:
  `Name/Name.tsx` + `Name.css` + `types.ts` + `constants.ts` + `behavior/` + `sub-components/` + `index.ts`.
- **behavior/** — one hook/handler/function per file (`useX.ts`, `handleY.ts`).
- **sub-components/** — child components used only by this component, one per file.
- **types.ts / constants.ts** — split interfaces/types and constants out of the component file.
- **index.ts** — barrel, re-export only, no logic.
- Don't over-split: no folder with a single trivial file unless it will grow.

## The post-change checkup (run before saying "done")

After every Write/Edit, verify:

- [ ] **≤ 200 lines** (the hook reports `max-lines` if not — split immediately).
- [ ] **Arrow functions only** — no `function` declarations.
- [ ] **Exports grouped at end** — no inline `export const/function/type`.
- [ ] **One thing per file** — exactly one component / hook / function / type-group.
- [ ] **Folder structure** — sub-components, behavior, types, constants split out
      as above; placed in the right logical folder.
- [ ] **`import type`** for type-only imports; **destructure params on line 1**.
- [ ] **Right pattern applied** where a smell called for one (catalog).
- [ ] **No new monolith, no copy-paste** of a thing used 2+ times (extract instead).

If the lint hook returned violations for the file you touched, **fix them now** —
never defer. Re-run `npx eslint <file>` to confirm clean.

## When a touched file is already over-limit

Policy is **refactor-when-touched**: if you edit a file that already violates the
cap (e.g. a 900-line legacy file), split the part you're working in into proper
units as part of the change rather than growing it further. Note the split in your
summary. Don't mass-refactor unrelated files in the same change.

## Naming (recap)

Hooks `useXyz`; components `PascalCase`; types `PascalCase` (no `I`); utils
`camelCase` verb-noun; handlers `handleXyz` (internal) / `onXyz` (props);
booleans `isXyz`/`showXyz`. Full detail in @docs/coding-standards.md.

<!-- @layer docs @kind doc -->
# How to Present a Plan

Every implementation plan for this project follows this format. Keep it **concise**. Show the work, don't narrate it. Favor code blocks and diagrams over prose.

## Deliverable: a rendered HTML page

A plan ships as an **HTML artifact**, not a wall of chat text:

- Write the page source to `plans/<name>.html` so it persists with the project
  (`/plans` is gitignored, per the plans-folder rule).
- Publish it with the **Artifact** tool so it renders as a real page.
- Treatment is **utilitarian and polished**: genuine typographic hierarchy, a considered
  palette, both light and dark themes, tables for findings, code blocks for real code.
  It is not a landing page but a document that is scanned and operated on.

Markdown in `plans/*.md` stays fine for short notes and throwaway working docs. Anything
presented as *the plan* gets the rendered page.

## Required sections (in order)

1. **Goal:** one or two sentences. What and why.
2. **Design pattern(s):** which GoF/Refactoring-Guru pattern(s) and *why* (or an
   explicit "no pattern needed"). Use the `refactoring-guru` skill; when refactoring,
   also name the **code smell(s)** removed and **technique(s)** applied.
3. **Filetree (CRUD):** the exact files created/modified/deleted, as a tree with
   change markers. This is mandatory for any change that adds/moves/removes files.
4. **Data model:** when types/models change, show the **actual TS code** (new or
   before→after), not a description.
5. **Key code:** real code blocks for the important new/changed units (signatures,
   component skeletons, the core function) so they can be seen before approval.
6. **Flow / preview:** a data-flow, sequence, component-hierarchy, or UI-layout
   diagram when it aids understanding. Use **mermaid** (see the Flow / preview section below).
7. **Standards check:** confirm tiers (if UI), ≤200 lines/file, one-thing-per-file.

Omit a section only if it doesn't apply (e.g. no data-model change).

## CRUD filetree legend

```
A  added        M  modified        D  deleted        R  renamed/moved
```

Mark every entry. Example:

```
apps/web/src/
├── components/views/SaveManager/
│   ├── A  SaveManager.tsx          (view - owns state, composes primitives)
│   ├── A  behavior/useSaveSlots.ts (data: IPC + store)
│   ├── A  types.ts
│   └── A  index.ts
├── components/compounds/
│   └── A  SlotCard/SlotCard.tsx    (compound - domain card from Card + primitives)
└── M  lib/game/save-states.ts      (+ deleteSlot())
D  apps/web/src/widgets/OldSavePanel.tsx
```

## Data model: show real code

```ts
// types.ts (new)
type SaveSlot = {
  id: number;
  label: string;
  savedAt: number;       // epoch ms
  thumbnailUrl: string | null;
};

export type { SaveSlot };
```

For changes, show before→after:

```ts
// before
type Profile = { id: string; name: string };
// after
type Profile = { id: string; name: string; lastSlot: number | null };
```

## Key code: show the unit, not a paragraph

```ts
// behavior/useSaveSlots.ts
const useSaveSlots = (profileId: string) => {
  const { slots, refresh } = useSaveStore(profileId);
  const deleteSlot = useCallback((id: number) => window.api.deleteSlot(profileId, id), [profileId]);
  return { slots, refresh, deleteSlot };
};

export { useSaveSlots };
```

## Flow / preview: mermaid

For **box-and-arrow flows, sequence/component diagrams, and dependency graphs**, write
**mermaid**. Artifacts render it natively: `<pre class="mermaid">...</pre>` in an HTML page,
or a ```mermaid fence in markdown. No MCP server, no hand-drawn boxes.

```html
<pre class="mermaid">
flowchart LR
  W["Widget"] --> FA["lib/game/flood<br/>getScreenGrids → buildFloodOptions"]
  S["Simulator"] --> FA
  FA --> F["floodFillScreen"]
</pre>
```

- **Quote every node label** (`A["text (ok)"]`). Parentheses and slashes otherwise break
  the parse. Use `<br/>` for line breaks inside a node.
- Keep to `flowchart` / `sequenceDiagram` / `graph`; exotic diagram types render
  inconsistently.
- **Put diagrams on a light "plate"** (a fixed pale background card) so they stay legible
  in both themes, because mermaid's own colours don't follow the page tokens.

Use plain text (not mermaid) for: the **CRUD filetree** (it's a text tree, above) and
**tile-grid / pixel-art sketches** (see the `interpret-game-screenshot` skill).

Hand-drawn ASCII is an acceptable fallback only when a plan must stay pure markdown.

## House style: the standard plan look

This is the agreed visual system for plan pages. Reuse it; don't reinvent per plan.
It is derived from the app's own debug UI (warm near-black, amber/gold titles, cyan data
lines), so a plan reads like a tool document, not a generic web page.

### Tokens

```css
:root {
  /* Neutrals: warm, amber-biased. A pure mid-grey reads as unconsidered */
  --ground: #12100e; --surface: #1b1815; --surface-2: #221e1a; --hairline: #322b24;
  --text: #ece6da; --text-dim: #a89e8d; --text-faint: #7c7365;
  /* Accent = the game's gold; cool = the FLOOD-line cyan, used for links/secondary */
  --accent: #e8a33d; --cool: #5fb3c4;
  /* Semantic, kept separate from the accent */
  --ok: #7fb861; --warn: #e0a63c; --bad: #c9663f;
  /* Fixed pale card for diagrams, since mermaid ignores page tokens */
  --plate: #f2eee5; --plate-ink: #241f1a;

  --mono: ui-monospace, "SF Mono", "Cascadia Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  --sans: "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
  --step: clamp(0.82rem, 0.8rem + 0.1vw, 0.9rem);
  --maxw: 74rem;
}
```

Light theme flips to warm paper (`--ground: #f7f4ed`, `--surface: #fffdf8`,
`--text: #1e1a16`) with the accents darkened for contrast (`--accent: #a96a10`,
`--cool: #2b7c8e`, `--ok: #4a7f31`, `--bad: #a2431f`).

**Theme wiring is token-level:** define the palette on `:root`, redefine *only the tokens*
under `@media (prefers-color-scheme: dark)`, then again under `:root[data-theme="dark"]`
and `:root[data-theme="light"]` so the viewer's toggle wins in both directions. Style
components through the tokens and never inside the media query.

### Type

- **Headings + data in mono, body in sans.** Mono headings suit debug/disassembly subject
  matter; the sans keeps prose readable. No webfont URLs, because the artifact CSP blocks font
  CDNs and you get a silent fallback. System stacks only.
- Body `line-height: 1.62`, paragraphs capped at `68ch`, standfirst at `60ch`.
- `text-wrap: balance` on headings; uppercase eyebrows/labels at `0.1-0.16em` tracking.
- `font-variant-numeric: tabular-nums` wherever digits line up.

### Layout & components

- Single centred spine at `--maxw`; `gap`-based flex/grid, not per-element margins.
- **Masthead:** mono eyebrow → `h1` → standfirst → a **verdict strip** of 3-5 headline
  numbers (`dl` grid with `gap: 1px` over a `--hairline` background for hairline dividers).
- **`h2`:** mono, `border-bottom: 2px solid var(--accent)`, plus a small filled phase badge.
- **Findings table:** mono ID column in `--accent`, a severity **chip** per row. Chips tint
  from one token: `background: color-mix(in srgb, var(--bad) 22%, transparent)` with a 45%
  border. Wrap every table in an `overflow-x: auto` container so the body never scrolls
  sideways.
- **Steps:** `ol` with `counter-reset` and circular numbered markers + a top hairline per
  item. Use numbering **only when order is real** (a dependency chain), never as decoration.
- **Callouts:** `3px` left border in `--cool` for information or `--bad` for blocking.
- **Code:** mono `0.78rem` on `--surface`, `2px solid var(--accent)` left border,
  `overflow-x: auto`. Colour spans inside: comment / keyword / string / deleted.
- **Diagram plates:** always-pale card (`--plate`) with an uppercase mono `figcaption`, so
  mermaid stays legible in either theme.
- Visible `:focus-visible`, and honour `prefers-reduced-motion`.

### Structural honesty

Numbering, eyebrows, dividers and chips must encode something **true**. Steps are numbered
because they depend on each other, and chips carry the real severity categories from the audit.
If a device is only decoration, drop it.

## Style rules

- **Concise.** No restating the request; no walls of prose.
- **Code over description:** if you'd describe a type or function, show it instead.
- **A diagram beats a paragraph** for flow/layout: write it as mermaid on a pale plate
  (see Flow / preview).
- Always end a plan with the pattern(s) + filetree even if the rest is short.
- **Read the House style section above before writing the page.** The palette, type and
  components are fixed for every plan; don't derive a new look from this doc's summary or
  from a memory note.

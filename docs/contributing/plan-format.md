<!-- @layer docs @kind doc -->
# How to Present a Plan

Every implementation plan for this project follows this format. Keep it **concise** —
show, don't narrate. Favor code blocks and ASCII over prose.

## Required sections (in order)

1. **Goal** — one or two sentences. What and why.
2. **Design pattern(s)** — which GoF/Refactoring-Guru pattern(s) and *why* (or an
   explicit "no pattern needed"). Use the `refactoring-guru` skill; when refactoring,
   also name the **code smell(s)** removed and **technique(s)** applied.
3. **Filetree (CRUD)** — the exact files created/modified/deleted, as a tree with
   change markers. This is mandatory for any change that adds/moves/removes files.
4. **Data model** — when types/models change, show the **actual TS code** (new or
   before→after), not a description.
5. **Key code** — real code blocks for the important new/changed units (signatures,
   component skeletons, the core function) so they can be seen before approval.
6. **Flow / preview** — a data-flow, sequence, component-hierarchy, or UI-layout
   diagram when it aids understanding. Generate it with the **asciiflow** MCP server
   and paste the exported ASCII inline (see the Flow / preview section below).
7. **Standards check** — confirm tiers (if UI), ≤200 lines/file, one-thing-per-file.

Omit a section only if it genuinely doesn't apply (e.g. no data-model change).

## CRUD filetree legend

```
A  added        M  modified        D  deleted        R  renamed/moved
```

Mark every entry. Example:

```
apps/web/src/
├── components/views/SaveManager/
│   ├── A  SaveManager.tsx          (view — owns state, composes primitives)
│   ├── A  behavior/useSaveSlots.ts (data: IPC + store)
│   ├── A  types.ts
│   └── A  index.ts
├── components/compounds/
│   └── A  SlotCard/SlotCard.tsx    (compound — domain card from Card + primitives)
└── M  lib/game/save-states.ts      (+ deleteSlot())
D  apps/web/src/widgets/OldSavePanel.tsx
```

## Data model — show real code

```ts
// types.ts — new
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

## Key code — show the unit, not a paragraph

```ts
// behavior/useSaveSlots.ts
const useSaveSlots = (profileId: string) => {
  const { slots, refresh } = useSaveStore(profileId);
  const deleteSlot = useCallback((id: number) => window.api.deleteSlot(profileId, id), [profileId]);
  return { slots, refresh, deleteSlot };
};

export { useSaveSlots };
```

## Flow / preview — generate with the asciiflow MCP server

For **box-and-arrow flows, sequence/component diagrams, and UI wireframes**, generate
the ASCII with the **asciiflow** MCP server — don't hand-draw it. Then **paste the
exported ASCII into the message/plan** inside a code block (the user does not see raw
tool output).

- Tools: `canvas_batch` (preferred — one call: `canvas_new` → `draw_box` /
  `draw_arrow` / `draw_line` / `add_text` → auto-exports). Coordinates are char-grid
  `x/y/w/h` (boxes min 3×3).
- **End arrows one cell short of a box** — an arrowhead landing on a border overwrites
  it (`wind▼w.api`). Leave the head in the gap.
- Run diagrams **sequentially** (shared canvas); start each with `canvas_new`.
- **Fallback:** if the MCP server is unavailable, hand-draw the ASCII.

Use plain text (not the tool) for: the **CRUD filetree** (it's a text tree, above) and
**tile-grid / pixel-art sketches** (see the `interpret-game-screenshot` skill).

Example (a Save-Manager flow + wireframe) is produced by `canvas_batch` and pasted as
a fenced block, e.g.:

```
┌──SaveManager───┐    ┌──useSaveSlots──┐    ┌───saveStore────┐
│                │────►                │────►                │
└────────────────┘    └────────────────┘    └────────────────┘
```

## Style rules

- **Concise.** No restating the request; no walls of prose.
- **Code over description** — if you'd describe a type or function, show it instead.
- **A diagram beats a paragraph** for flow/layout — generate it with the asciiflow
  MCP server (see Flow / preview) and paste the export inline.
- Always end a plan with the pattern(s) + filetree even if the rest is short.

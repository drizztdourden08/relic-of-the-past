<!-- @layer claude-config @kind doc -->
---

name: design-system
description: Build and maintain the app's design system — design tokens and reusable UI primitives (Button, Card, Dialog, Field…) — with strict structure. Use when adding/changing UI styling, creating a reusable component, touching apps/desktop/src/design-system/, introducing a color/spacing/radius value, or when a visual pattern is about to be duplicated. Keeps tokens the single source of truth and primitives strictly organized
---

# Design system

Rules & target structure: @docs/contributing/design-system.md. All code obeys
@docs/contributing/coding-standards.md (arrow fns, exports at end, ≤200 lines, one-thing-per-file).

## Step 0 — pick the right tier (do this first)

Every component is one tier (full definitions + real examples in the doc). Tiers
live in `components/<tier>/`; `design-system/` is tokens only.

- **Primitive** (`components/primitives/`) — generic atom, domain-agnostic. Button, Select, Toggle.
- **Composite** (`components/composites/`) — generic **structural** combo of primitives. Card, Dialog, Overlay.
- **Compound** (`components/compounds/`) — **domain-specific** presentational unit (takes a domain prop, fetches nothing). ProfileCard, RomCard, SaveSlot. *(Project meaning — a composed domain card/form, NOT the React-Context pattern.)*
- **View** (`components/views/`, `widgets/`) — page/feature with **business logic + data** (stores, IPC, game). Only tier allowed to touch data.

Decision: touches data/stores/IPC or owns state? → **View**. Tied to a domain concept
but presentational? → **Compound**. Generic structural combo? → **Composite**. Generic
atom? → **Primitive**.

> **Hard boundary:** primitives/composites/compounds must NOT import stores,
> `window.api`, `lib/game`, or navigation — data flows in via props. If a bare
> component "needs data," it's a View — move it. State the chosen tier in your plan.

## Before styling anything

1. **Token check** — does the value exist in `design-system/tokens.css`? Use
   `var(--token)`. Never write raw hex or magic px in a component. If the value is
   new and legitimate, **add a token first**, then use it.
2. **Reuse check** — does the component already exist in the right tier folder
   (`components/primitives|composites|compounds/`)? Use it. If not and it's reusable,
   create it in the tier you chose in Step 0 (see Rule of Two).

## Rule of Two

A UI pattern used **2+ times** is extracted to the right tier — never copy-pasted.
The second occurrence is the trigger. State the extraction in your plan (a generic
combo is usually a small Facade over markup + tokens).

## Creating a component

```
components/<tier>/Name/         # tier = primitives | composites | compounds | views
├── Name.tsx     — one component, arrow fn, exports at end, ≤200 lines
├── Name.css     — scoped styles, tokens only, class names prefixed to the component
├── types.ts     — NameProps and related types (exports at end)
└── index.ts     — barrel (re-export only)
```

- Variants via **props + data-attributes/CSS** (`variant`, `size`), not duplicated
  components.
- Bare tiers (primitive/composite/compound) import **no** stores/`window.api`/`lib/game`.
- Add it to that tier's `index.ts` barrel.

## Styling rules

- CSS colocated as `Component.css`; prefer CSS over inline `style`.
- Inline `style={{}}` only for dynamic values (computed transforms, measured sizes).
- Feature components **compose** primitives; they don't re-implement primitive styling.

## Checkup (after any design-system change)

- [ ] Tokens only — no raw hex / magic px (it's in `tokens.css`).
- [ ] Primitive reused, not duplicated; Rule of Two honored.
- [ ] Folder + file structure matches the target; ≤200 lines; arrow fn; exports at end.
- [ ] No feature logic leaked into `design-system/`.
- [ ] Plan stated the pattern (e.g. Facade/Composite) and the filetree.

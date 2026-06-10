<!-- @layer docs @kind doc -->
# Design System — Structure & Rules

The strict, organized foundation for the app's UI: **design tokens** plus a
**four-tier component library**. All code obeys @docs/contributing/coding-standards.md. For
*where* UI fits in the wider app, see @docs/architecture/overview.md.

## Where things actually live

All UI lives under **`apps/desktop/src/ui/`**, split into a reusable
**`design-system/`** and app-facing **`domains/`**:

```
ui/
├── design-system/          @ds/*  — reusable, domain-agnostic
│   ├── tokens/             concept files (color, space, size, radius, border,
│   │                       typography, shadow, motion, z-index, opacity, reset)
│   │                       + index.css (the single @import entry; imported once in main.tsx)
│   ├── primitives/         tier 1 — generic atoms; the ONLY place raw HTML is allowed
│   └── composites/         tier 2 — generic structural combos
└── domains/                @domains/*  — domain-specific UI
    ├── app/
    │   ├── compounds/      tier 3 — domain presentational
    │   └── views/          tier 4 — page/feature with logic + data
    ├── widgets/            domain: overlay widgets
    └── hud/                domain: game HUD (own primitives/composites/compounds/views)
```

Aliases: `@ds/*` → `ui/design-system/*`, `@domains/*` → `ui/domains/*` (plus the
existing `@app/*` → `apps/desktop/src/*`, `@shared/*`). Non-presentational code
(`App/`, `stores/`, `lib/`, `hooks/`, `utils/`) stays at `src/` root.

## Component taxonomy — four tiers

Every UI component is exactly one tier. **Pick the tier first**, then build it in the
right folder. The first three are **bare, self-contained, presentational** — data in
via props/callbacks, **no stores / `window.api` / `lib/game` / navigation**. Only
**Views** are wired to data and logic.

| Tier | What it is | Domain-aware? | Logic/data? | Lives in | Real examples |
|------|-----------|---------------|-------------|----------|---------------|
| **Primitive** | Generic UI atom | ❌ generic | ❌ | `components/primitives/` | Button, Select, Toggle, TextInput, Badge, Slider, TabBar, Toast |
| **Composite** | Generic **structural** unit built from primitives | ❌ generic | ❌ | `components/composites/` | Card, Dialog, Overlay, DropdownMenu, FullScreenLayer, SettingsLayout, Widget |
| **Compound** | **Domain-specific** presentational unit composed from primitives/composites | ✅ a concept | ❌ (data via props) | `components/compounds/` | ProfileCard, RomCard, SaveSlot, HeroSaveCard, CreateProfileForm |
| **View** | Page/feature with business logic + data | ✅ | ✅ stores, IPC, game | `components/views/`, `widgets/` | ProfileHub, GameLayer, TrackerView, SpriteDebug, TitleBar |

**Primitive** — a generic atom, no domain knowledge. `<Button>`, `<Select>`,
`<Toggle>`. Pure props in, events out. Reusable in any app.

**Composite** — a generic, reusable **structural/layout** component built from
primitives, still domain-agnostic. `<Card>`, `<Dialog>`, `<Overlay>`,
`<DropdownMenu>`. Often a small **Facade** over markup + tokens.

**Compound** — a **domain-specific** presentational component for a concrete concept,
composed from primitives/composites. `<ProfileCard>`, `<RomCard>`, `<SaveSlot>`.
Knows about a domain *shape* (it takes a `Profile`/`Rom`/`Slot` prop) but is still
**bare** — it fetches nothing, owns no store, fires callbacks up. (Note: this is the
project's meaning of "compound" — a composed domain card/form — **not** the
React-Context "compound components" pattern.)

**View** — the container. Owns state via Zustand stores / `window.api` IPC /
`lib/game`, and passes data + callbacks down into the bare tiers. The **only** tier
with business logic; logic lives in its `behavior/` hooks.

> **Hard boundary:** primitives, composites, and compounds must **not** import
> stores, `window.api`, `lib/game`, or navigation. Data flows in via props only. If a
> bare component "needs to fetch/subscribe," it's actually a **View** — move it. This
> container/presentational split is what keeps the library reusable and testable.

### Choosing the tier

- Touches stores / IPC / game / navigation, or owns state? → **View**.
- Tied to a specific domain concept but purely presentational? → **Compound**.
- Generic structural combo of primitives, domain-agnostic? → **Composite**.
- Generic single atom? → **Primitive**.

## Per-component structure (enforced by the structure-policy)

```
<tier>/<Name>/
├── <Name>.tsx          — one component, arrow fn, exports at end, ≤200 lines  ┐
├── <Name>.css          — scoped styles, tokens only, class names prefixed     │ ONLY
├── <Name>.type.ts      — <Name>Props etc. (exports at end)                    │ these
├── <Name>.constants.ts — static config (optional)                            │ at root
├── index.ts            — barrel (re-export only)                              ┘
├── behavior/           — hooks/handlers, one per file
└── sub-components/<Child>/  — children used only here (recursive: same shape)
```

Root files are **name-prefixed** (`<Name>.type.ts`, `<Name>.constants.ts`). Any
other file at the component root, or any subfolder other than `behavior/` /
`sub-components/`, is flagged by the **structure-policy** (R12, see below).

## Rules

**Tokens**

1. `ui/design-system/tokens/` (one concept file per category) is the **single
   source of truth**. Use `var(--token)` — **no raw hex, no magic px**.
2. New design value? Add a token first, then use it.
3. Readability via **value contrast** + the spacing scale, not ad-hoc numbers.

**Components**
4. One component per folder; one thing per file; ≤200 lines; arrow fn; exports at end.
5. **Rule of two:** a UI pattern used 2+ times is extracted to the right tier — never
   copy-pasted. The second occurrence is the trigger.
6. Variants via **props + data-attributes/CSS**, not duplicated components
   (`<Button variant="danger">`, not `DangerButton`).

**Styling**
7. CSS colocated as `<Name>.css`; class names scoped/prefixed (no global bleed).
   Prefer CSS over inline `style`.
8. Inline `style={{}}` only for genuinely dynamic values (computed transforms,
   measured sizes).

**Boundaries**
9. `ui/design-system/` holds tokens + reusable primitives/composites — no
   logic/data imports (see the hard boundary above). Domain UI lives in `ui/domains/`.
10. Views compose the lower tiers; they don't re-implement primitive styling.

## Mechanical enforcement

Three policies back the rules above (currently **warnings to work toward**, will
flip to **error** once each reaches zero). See the full rules table in
@docs/contributing/coding-standards.md.

| Rule | Tool | What it flags |
|------|------|---------------|
| **R11 no-raw-html** | ESLint (`local/no-raw-html`) | any lowercase JSX element outside `primitives/` — use `Box`/`Text`/`Flex`/`Button`/… |
| **R12 structure-policy** | analyze adapter | component-root files other than `<Name>.{tsx,css,type.ts,constants.ts}`+`index.ts`, or subfolders other than `behavior/`/`sub-components/` |
| **R13 token-policy** | stylelint (`color-no-hex`, `color-named`) | raw hex / named colors in `ui/**` component CSS (tokens/ exempt) |

Reports: `npm run report` (all three) · `report:html` · `report:structure` ·
`report:tokens`. Form controls (`input`/`select`/`textarea`) are already a hard
**error** outside primitives.

## Growing it

New UI need → pick the tier (above) → check for an existing component to reuse → if
none and it's reusable, create it in the right tier folder → wire data only at the
View tier. Every change runs the `coding-standards` checkup and is placed per
@docs/architecture/overview.md.

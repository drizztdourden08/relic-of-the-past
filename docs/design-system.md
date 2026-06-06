<!-- @layer docs @kind doc -->
# Design System — Structure & Rules

The strict, organized foundation for the app's UI: **design tokens** plus a
**four-tier component library**. All code obeys @docs/coding-standards.md. For
*where* UI fits in the wider app, see @docs/architecture.md.

## Where things actually live

- `apps/desktop/src/design-system/` — **tokens only**: `tokens.css` (color, spacing,
  radii, type — ALttP dark palette) + `reset.css`. No components here.
- `apps/desktop/src/components/` — the **four tiers**, each in its own folder:
  `primitives/`, `composites/`, `compounds/`, `views/`.
- `apps/desktop/src/widgets/` — feature widgets/overlays (view-tier: they own logic/data).

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

## Per-component structure

```
components/<tier>/<Name>/
├── <Name>.tsx        — one component, arrow fn, exports at end, ≤200 lines
├── <Name>.css        — scoped styles, tokens only, class names prefixed
├── types.ts          — <Name>Props etc. (exports at end)
├── behavior/         — (Views) hooks/handlers, one per file
├── sub-components/   — children used only here, one per file
└── index.ts          — barrel (re-export only)
```

## Rules

**Tokens**
1. `tokens.css` is the **single source of truth**. Use `var(--token)` — **no raw
   hex, no magic px**.
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
9. `design-system/` holds tokens only. Primitives/composites/compounds are
   presentational — no logic/data imports (see the hard boundary above).
10. Views compose the lower tiers; they don't re-implement primitive styling.

## Growing it

New UI need → pick the tier (above) → check for an existing component to reuse → if
none and it's reusable, create it in the right tier folder → wire data only at the
View tier. Every change runs the `coding-standards` checkup and is placed per
@docs/architecture.md.

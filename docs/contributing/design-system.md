<!-- @layer docs @kind doc -->
# Design System Structure & Rules

The app's UI is built on [Tessera](https://github.com/drizztdourden08/tessera)
(`@drizztdourden08/tessera`): its tokens, its primitives and composites, its field kits
and its data engine. RotP adds only what is its own: domain compounds, views, the HUD
and a small theme. All code obeys @docs/contributing/coding-standards.md. For where UI
fits in the wider app, see @docs/architecture/overview.md.

## Where things actually live

```
@drizztdourden08/tessera     tokens.css, palettes/rotp.css, primitives, composites,
                             data, field-kits, color-picker (reusable, domain-agnostic)
apps/desktop/src/
├── theme.css               RotP's own tokens, unlayered, imported after Tessera's
├── tokens/game-text.css    colours and geometry of text the game draws
├── fonts/                  the dialogue face (game-font.css, alttp-ext.woff2, licence)
└── ui/domains/             @domains/*  - domain-specific UI
    ├── app/
    │   ├── compounds/      tier 3 - domain presentational
    │   └── views/          tier 4 - page/feature with logic + data
    ├── widgets/            domain: overlay widgets
    └── hud/                domain: game HUD (own primitives/composites/compounds/views)
```

Each app entry imports `@drizztdourden08/tessera/tokens.css`, then
`@drizztdourden08/tessera/palettes/rotp.css`, then RotP's `theme.css`, and sets
`data-palette="rotp"` on its root element. The root renders inside
`TesseraProvider` (and, in the desktop app, `ViewStorageProvider` with RotP's
saved view snapshots). The two sites (Sanctuary and the Hookshop store) do the same.

Aliases: `@domains/*` → `ui/domains/*`, `@app/*` → `apps/desktop/src/*`, `@shared/*`.
Non-presentational code (`App/`, `stores/`, `lib/`, `hooks/`, `utils/`) stays at `src/`
root.

## The four component tiers

Every UI component is exactly one tier. Primitives and composites come from Tessera;
RotP writes compounds and views. The first three tiers are bare, self-contained, and
presentational: data comes in via props and callbacks, with no access to stores,
`window.api`, `lib/game`, or navigation. Only Views are wired to data and logic.

| Tier | What it is | Domain-aware? | Logic/data? | Lives in | Real examples |
|------|-----------|---------------|-------------|----------|---------------|
| **Primitive** | Generic UI atom | no | no | Tessera `primitives` | Button, Select, Toggle, TextInput, Status, Slider, Tabs |
| **Composite** | Generic structural unit built from primitives | no | no | Tessera `composites` | Card, Dialog, DropdownMenu, WindowTitleBar, Widget, DataTable |
| **Compound** | Domain-specific presentational unit | yes, a concept | no (data via props) | `ui/domains/app/compounds/` | ProfileCard, RomCard, SaveSlot, SpritePicker |
| **View** | Page/feature with business logic + data | yes | stores, IPC, game | `ui/domains/app/views/`, `widgets/` | ProfileHub, GameLayer, TitleBar |

**Compound:** a domain-specific presentational component for a concrete concept,
composed from Tessera parts. It knows a domain shape (it takes a `Profile`/`Rom`/`Slot`
prop) but stays bare: it fetches nothing, owns no store, and fires callbacks up.

**View:** the container. Owns state via Zustand stores, `window.api` IPC, or
`lib/game`, and passes data and callbacks down into the bare tiers. Its business logic
lives in its `behavior/` hooks.

> **Hard boundary:** compounds keep clear of stores, `window.api`, `lib/game`, and
> navigation imports. If a bare component needs to fetch or subscribe, it is a View.

### Choosing the part

- Tessera has a part for it? Use it. A RotP part that repeats a Tessera part is replaced
  and deleted.
- Touches stores, IPC, game, or navigation, or owns state? → **View**.
- Tied to a game or app concept and purely presentational? → **Compound**.
- Generic and missing from Tessera? Propose it for Tessera; until then keep it as a
  compound and say so in its folder's usage.

## Per-component structure (enforced by the structure-policy)

```
<tier>/<Name>/
├── <Name>.tsx          - one component, arrow fn, exports at end, ≤200 lines
├── <Name>.css          - scoped styles, tokens only, class names prefixed
├── <Name>.type.ts      - <Name>Props etc. (exports at end)
├── <Name>.constants.ts - static config (optional)
├── index.ts            - barrel (re-export only)
├── behavior/           - hooks/handlers, one per file
└── sub-components/<Child>/  - children used only here (recursive: same shape)
```

## Rules

**Tokens**

1. Tessera's tokens are the source of truth: colours by role (`--c-primary`,
   `--c-secondary`, `--c-text`, ...), one size scale (`--size-*`), spacing, radii, type.
   Use `var(--token)`, with no raw hex and no magic px.
2. `theme.css` holds only what Tessera has no token for: the game text tokens, the
   dialogue face and the sizes of RotP's own screens. A new value goes there only when
   no Tessera token fits.

**Components**

3. One component per folder; one thing per file; ≤200 lines; arrow fn; exports at end.
4. **Rule of two:** a UI pattern used 2+ times gets extracted to the right tier rather
   than copy-pasted.
5. Express variants via props and data-attributes/CSS, not duplicated components.

**Styling**

6. Colocate CSS as `<Name>.css` with scoped, prefixed class names. Prefer CSS over
   inline `style`; keep inline styles for computed values.

## Growing it

New UI need → find the Tessera part → if none fits, pick the tier → build it in the
right folder → wire data only at the View tier. Every change runs the
`coding-standards` checkup and is placed per @docs/architecture/overview.md.

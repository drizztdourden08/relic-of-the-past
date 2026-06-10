<!-- @layer docs @kind doc -->
# Design Language — Relic of the Past

> The single source of truth for **how the app should look and feel**.
> `docs/contributing/design-system.md` covers the *code* tiers (primitives/composites/compounds/views);
> this doc covers the *visual* rules: surfaces, elevation, color roles, controls,
> spacing, type, sizing, and hierarchy. **Read this before designing anything new.**
>
> **One style for the whole app.** The only exception is `domains/hud/**` — it
> replicates the SNES game HUD with its own pixel-art primitives and the exact
> game palette, and is deliberately outside everything below.

---

## 0. The look in one paragraph

A **dark, near-black, neutral** interface (not blue-tinted) with a warm **gold**
(Triforce) accent and a **green** (Hyrule) primary action. Surfaces step up a
small **neutral elevation ladder**; floating things cast soft shadows and, when
they sit over the running game, use a translucent "glass" surface with a blur.
Typography is small, dense, and functional. Gold means *"this is selected / where
you are"*; green means *"this is the primary action"*; everything else is quiet.

---

## 1. Color roles (semantic — never reach past these)

All color comes from `design-system/tokens/color.css`. Components must use tokens,
never raw hex/rgb (enforced by stylelint). Pick by **role**, not by hue:

### 1.1 Surfaces — the elevation ladder
The surfaces are **neutral near-black** (no blue tint). Higher = closer to the user.

| Level | Token | Value | Use for |
|---|---|---|---|
| 0 — canvas | `--color-bg-deep` | `#0a0a0f` | app background, code blocks, deepest insets |
| 1 — base | `--color-bg-base` | `#111116` | page panels, inset wells inside a card |
| 2 — raised | `--color-bg-raised` | `#1a1a20` | cards, list rows, docked widgets, inputs, default buttons |
| 3 — elevated | `--color-bg-elevated` | `#222228` | dialogs, dropdowns, popovers, hover of a raised control |
| glass | `--color-bg-overlay` | `rgb(10 10 15 / .88)` | translucent surface for panels floating **over the game** |

**Rule:** a child surface is at most **one level** above its parent. Don't skip
levels, and don't invent a 4th solid tier.

### 1.2 Surface tints (state overlays, not new colors)
| Token | Use |
|---|---|
| `--color-surface-hover` (white 4%) | hover on a transparent/ghost control |
| `--color-surface-hover-strong` (white 7%) | hover on an already-raised control |
| `--color-surface-inset` (white 2%) | faint inset zones |
| `--color-surface-selected` (gold 8%) | **selected/active** background tint |

### 1.3 Borders
`--color-border-subtle` `#2a2a30` (default hairline) · `--color-border-default`
`#333340` (controls) · `--color-border-strong` `#444450` (hover/emphasis) ·
`--color-border-hover` (white 10%, on glass).

### 1.4 Text
`--color-text-primary` `#e8e8ec` · `--color-text-secondary` `#a0a0a8` ·
`--color-text-muted` `#666670` · `--color-text-faint` `#44444c`.
**There is no `tertiary`** — use `muted`.

### 1.5 Accents & semantics — the meaning of each hue
This is the rule that fixes most of today's inconsistency:

| Role | Hue | Tokens | Where it's allowed |
|---|---|---|---|
| **Selection / active / "you are here"** | **Gold** | `--color-gold-base/-bright`, bg `--color-surface-selected` (or `--color-gold-glow`), border `--color-gold-base` | active tab, selected segment, toggle-on, selected filter/chip, focus ring, selected list row |
| **Primary action** | **Gold** | gold tokens | the most important action / CTA; also = selection/active/focus |
| **Secondary action** | **Green** | green tokens | the second action, shown right next to the primary |
| **Tertiary / utility** | **Grey** | surface + border + dim text | Cancel, Back, tools — the common neutral button |
| **Ghost** | transparent | none + grey text | low-emphasis inline actions; grey hover fill |
| **Destructive** | **Red** | `--color-danger-*` | delete/remove, error text, close-on-hover |
| **Warning / pending** | **Amber** | `--color-warning-base/-dim` | "reachable but not done", caution banners |
| **Informational only** | **Blue** | `--color-info-base` | neutral status/info text & icons — **never** a selection state |
| **Status: complete/success** | Green | `--color-green-base/-bright` | done/obtained |

> **Hard rule — three action tiers, side by side:** **gold = primary**, **green =
> secondary**, **grey = tertiary/ghost**. Gold is also the selection/active/focus
> color. Green is *not* "positive-only" and *not* a generic active state — it is the
> second-most-prominent **action** sitting next to a gold primary. Plain utility
> buttons (Cancel, Back, tools like the Navigation FUNCTIONS row) are **tertiary
> (grey)**. Red = destructive · amber = warning · blue = info **text/icons only**
> (never an action or selection color).

---

## 2. Elevation: shadow + blur

### 2.1 Shadow ladder (3 steps — use the token, never a raw shadow)
| Token | Value | Use |
|---|---|---|
| `--shadow-sm` *(=overlay)* | `0 4px 16px rgb(0 0 0 / .4)` | tooltips, small poppers |
| `--shadow-md` *(=dropdown)* | `0 8px 24px rgb(0 0 0 / .5)` | dropdowns, toasts, floating widgets |
| `--shadow-lg` | `0 12px 32px rgb(0 0 0 / .6)` | dialogs, full-screen layer cards |

> Today there are 5+ ad-hoc shadows (widget `0 4 20`, fullscreen `0 16 48`, settings
> `0 8 32`…). Snap each to the nearest token. *(Action: add `--shadow-sm`/`--shadow-md`
> aliases so names read as a ladder.)*

### 2.2 Backdrop blur (2 tiers only)
| Token | Value | Use |
|---|---|---|
| `--blur-sm` | `4px` | light scrims (save-state, pause), save-slot action overlays |
| `--blur-md` | `8px` | floating glass panels over the game (widgets, shadow editor, log overlay) |

> Today: 2px / 4px / 8px / 16px with no rule. Snap to **4** or **8**. *(Action: add the
> two blur tokens.)*

### 2.3 Scrims (modal backdrops — 2 tiers)
| Token | Value | Use |
|---|---|---|
| `--color-scrim` | `rgb(0 0 0 / .6)` | standard modal/dialog backdrop |
| `--color-scrim-game` | `rgb(0 0 0 / .35)` | when the game must stay visible behind (pause) |

> Today: 0.35 / 0.6 / 0.75 / 0.85 / 0.88 all coexist. Collapse to these two.

---

## 3. Shape, spacing, type, motion

### 3.1 Radius
`--radius-sm 4` · `--radius-md 6` · `--radius-lg 8` · `--radius-xl 12`.
**Convention:** chips/inputs/small buttons = `sm`; cards/panels = `lg`; dialogs/large
surfaces = `lg`; pills = a deliberate full-round (define `--radius-pill: 999px`).
> `3px` appears **35×** as an off-scale workaround → snap to `--radius-sm` (4). Pills at
> `10px` → `--radius-pill`.

### 3.2 Spacing
One scale for gap/margin/padding: `--space-xs 4 · -sm 8 · -md 12 · -lg 16 · -xl 24 · -2xl 32`.
> Spacing is only **38% tokenized** today. `2px`(95×), `6px`(75×), `3px`(31×), `10px`(17×)
> dominate. Rule: **use a token.** `6px`→`sm`(8) or `xs`(4); `3px`/`2px`→`xs`(4) or 0;
> `10px`→`md`(12). Hairline `1–2px` is allowed *only* for borders/optical nudges, never layout.

### 3.3 Type
Family `--font-sans` (UI) / `--font-mono` (ids, code, numbers).
Sizes: `--text-xs 10 · -sm 11 · -base 13 · -lg 16 · -xl 20`. Weights `400/500/600`.
> Font-size is **57% tokenized**. The real gaps: `12px`(24×, between sm & base) and
> `9px`(12×, below xs). Rule: snap `12→base(13)` or `sm(11)`, `9/8→xs(10)`. Don't widen
> the scale — densify by weight/color, not by inventing sizes.

### 3.4 Motion
`--transition-fast .1s` (hover/press) · `--transition-normal .15s` (enter/layout).
Dialog enter = fade+scale 0.95→1 over .15s. Don't hand-roll durations.

### 3.5 Z-index — always the token, never a raw number
`--z-base 1 · -sticky 10 · -nav-overlay 20 · -backdrop 50 · -panel 100 · -floating 110 ·
-modal 200 · -popover 250 · -toast 300 · -tooltip 400`. Portal layers mirror these.
> Components currently hard-code `z-index: 100/200/300`. Replace with the token. Two
> things at `200` (dropdown + widget-settings) is a real collision risk.

---

## 4. Controls (the part that's most inconsistent today)

**Default to a design-system primitive. Do not hand-roll a control that a primitive
already covers.** Primitives & their canonical look:

| Primitive | Look | Selected state |
|---|---|---|
| `Button` | radius `lg`, border `subtle`, bg `raised`, text `secondary`; hover bg `elevated` + text `primary` | `primary` variant = **green**; `secondary`/`ghost`/`danger` |
| `IconButton` | 22 or 36px square, transparent, radius `sm`, ghost hover | — |
| `SegmentedControl` | track radius `md`; indicator **gold-glow** | **gold** |
| `TabBar` | text tabs, 2px bottom border | **gold** text + gold underline |
| `Toggle` | 36×20 track, radius pill | **gold** track |
| `RadioGroup` / `ToggleGroup` | bordered, radius `md` | **gold** border + gold-glow bg |
| `TagPicker` | chip, radius `sm`, `2px 8px` | **gold** text + gold-glow bg |

**Rules**
1. **Tab decks → `TabBar`.** Never hand-roll. (4 hand-rolled today: data-manager,
   profile-hub, controls-settings, cheats-widget.)
2. **Selectable chips/tags → `TagPicker`.** (tracker filters, conn-editor tags today.)
3. **Mutually-exclusive options → `SegmentedControl`/`RadioGroup`.**
4. **One primary `Button` (green) per view/section.** Everything else is `secondary`/`ghost`.
5. **Selected = gold, always.** A control's "active" state uses gold tokens regardless
   of which widget it lives in.
6. A bespoke control is justified **only** when no primitive fits; then it still uses
   the tokens above and the gold/green/danger rules.

---

## 5. Containers: cards, dialogs, panels, widgets

### 5.1 Card (`Card` primitive)
bg `raised`, border `subtle`, radius `lg`, padding `md`/`lg`. Variants: default,
interactive (hover → border `strong` + bg `elevated`), danger.

### 5.2 Dialogs (`DialogShell` / `WizardDialogShell`)
Surface `elevated`, border `default`, radius `lg`, shadow `lg`, scrim `--color-scrim`.
**Two widths only:** `--dialog-w-sm 400` (confirm/about), `--dialog-w-md 600`
(forms/wizards). Wizards: header (title + right-aligned meta) → step bar → body → actions.

### 5.3 Floating panels over the game (tracker, shadow editor, log overlay)
Glass surface `--color-bg-overlay`, `--blur-md`, border `subtle`, radius `lg`,
shadow `md`. **Fixed widths from a token set:** `--panel-w-sm 200 · -md 280 · -lg 380`.
> Today these are blue-tinted `rgb(20 20 30 …)` at random widths (180/260/420). Move to
> the neutral glass token + a panel-width token.

### 5.4 Widgets (`Widget` composite)
Docked = surface `raised`, square edges; floating = glass + blur-md + shadow-md +
radius `lg`. **Minimum width `--widget-w-min: 240px`.** The runtime opacity var
(`--widget-frame-opacity`) is legitimate (user setting) — keep it, but derive the
color from the neutral glass token, not a one-off blue rgb.

---

## 6. Hierarchy rules (how to compose a screen)

1. **Surfaces step exactly one level.** canvas → page(base) → card(raised) → popover(elevated).
2. **One primary action (green) per surface.** Secondary actions are quiet.
3. **Gold marks the current/selected thing** — at most one "active" per group.
4. **Section headers**: `text-secondary`, `xs`/`sm`, uppercase, `letter-spacing .04em`.
5. **Body text** `secondary`; **emphasis** `primary`; **meta/ids** `muted` + `font-mono`.
6. **Spacing rhythm:** `sm`(8) between controls, `md`(12) between groups, `lg`(16)+
   section padding. Never eyeball px.
7. **Borders are hairlines** (`subtle`); reserve `strong` for hover/emphasis only.

---

## 7. Building something new — checklist

- [ ] Could a **primitive/composite** already do this? Use it. (Don't reinvent tabs/chips/buttons/dialogs.)
- [ ] Every color is a **role token** (§1). No raw hex/rgb. No ghost token names (§ audit).
- [ ] Surface is the right **elevation level** and only one above its parent.
- [ ] Spacing/radius/type are **tokens** (§3). No `3px`/`6px`/`12px` one-offs.
- [ ] Shadow + blur + scrim from the **ladders** (§2).
- [ ] `z-index` is a **token** (§3.5).
- [ ] Selected = **gold**; the one CTA = **green**; destructive = **danger**; info = **blue (text only)**.
- [ ] Widths come from the **dialog/panel/widget width tokens** (§5).
- [ ] Run `npm run report` → stylelint/structure/raw-html all clean.

---

## 8. Token gaps to add (so the rules above are expressible)

These are referenced by the rules but not yet defined — add to `tokens/`:

```css
/* radius.css */   --radius-pill: 999px;
/* shadow.css */   --shadow-sm: var(--shadow-overlay);   --shadow-md: var(--shadow-dropdown);
/* effect.css */   --blur-sm: 4px;  --blur-md: 8px;
/* color.css  */   --color-scrim: rgb(0 0 0 / .6);  --color-scrim-game: rgb(0 0 0 / .35);
/* size.css   */   --dialog-w-sm: 400px; --dialog-w-md: 600px;
                   --panel-w-sm: 200px; --panel-w-md: 280px; --panel-w-lg: 380px;
                   --widget-w-min: 240px;
```

And **delete/alias the ghost tokens** components reference but that don't exist
(they silently no-op today): `--color-bg-sunken`→`bg-base`, `--color-bg-active`→
`surface-selected`, `--color-bg-hover`→`surface-hover`, `--color-bg-input`→`bg-raised`,
`--color-bg-surface`→`bg-raised`, `--color-accent-default`→`gold-base`,
`--color-accent-subtle`→`gold-glow`, `--color-accent-text`→`gold-bright`,
`--color-text-tertiary`→`text-muted`, `--color-danger/-default`→`danger-base`,
`--color-success`→`green-base`, `--color-error`→`danger-base`,
`--color-border-focus`→`gold-base`, `--radius-full`→`radius-pill`.

## Token enforcement — colors are tokens-only (mechanically blocked)

Raw colors are **gating errors**, not conventions. Two blockers:

1. **CSS** (`.stylelintrc.json`): `color-no-hex` + `color-named` (error) and a
   `function-disallowed-list` banning `rgb() / rgba() / hsl() / hsla() / hwb()` in
   all `apps/desktop/src/ui/**/*.css`. Use `var(--c-*)` / `var(--color-*)`.
2. **Inline styles / TS** (`eslint.config.mjs` → `local/no-raw-color`, error): bans
   hex/rgb/hsl literals assigned to colour-ish style properties (`color`,
   `background`, `borderColor`, `fill`, `stroke`, `boxShadow`, …). Dynamic values
   (`color: cond ? a : b`, `fn()`) and canvas `ctx.fillStyle = …` assignments do
   **not** match — those are the legitimate escape hatches below.

### Documented exceptions (where raw colors are allowed)

| Where | Why |
|-------|-----|
| `tokens/**` | The token definitions themselves. |
| `domains/hud/**` | Replicates the in-game HUD with the exact SNES palette — game-accurate, not design tokens. |
| Canvas rendering (`navigation-overlay/draw/*`, shadow `render*`, `gizmo-render`) | `ctx.fillStyle`/`ImageData` need real colour strings; a CSS `var()` can't be used. |
| Categorical data-viz palettes (`EDGE_COLORS`, `DIR_COLORS`, `ReqIcon`, HID byte-roles in `ByteGrid`/`wizard-helpers`, sprite-category hues, driver-type badge, log `CHANNEL_COLORS`) | Fixed distinct hues that **encode categories** (like chart colours), not theme accents. Centralised constants, not scattered literals. |
| Dynamic frame opacity (`Widget`/`TrackerView` frames) | `rgb(… / calc(α * var(--frame-opacity)))` — per-instance runtime opacity, not a flat token. Opted out per-line with `/* stylelint-disable-line function-disallowed-list */`. |
| `DebugWidget` | Deliberate retro green-on-black terminal. |
| Electron main process (`electron/**`) | Native `BrowserWindow` options (e.g. window `backgroundColor`) — not renderer CSS. |

Sub-10px font sizes in dense debug widgets are left as-is (the type scale floors
at `--text-xs` = 10px).

### Update — dimensional tokens are also forced now

Beyond color, these are hard-blocked in `ui/**` CSS (stylelint
`declaration-property-value-disallowed-list`), tokens + HUD exempt:

| Property | Rule | Token |
|----------|------|-------|
| `font-size` | no numbers (px/rem/em) | `--text-*` |
| `font-weight` | no raw numbers | `--weight-*` |
| `border-radius` | no `px` (allows `%`, `0`) | `--r-*` / `--radius-xl` |
| `z-index` | no positive integers (allows `0`) | `--z-*` ladder |
| `padding` / `margin` / `gap` | no `px` | `--space-*` |

Existing raw values were rounded to the nearest token. `var(--token, fallback)`
fallbacks are banned (tokens-only) — use the token bare. Positioning offsets
(`top/left/right/bottom`), `width/height`, and `border-width` are **not** forced
(no positional token scale; these are layout, not design-scale values). Inline
`style={{}}` dimensional values in dense debug widgets are not yet rule-enforced
(the type scale floors at 10px; those widgets use 8–9px).

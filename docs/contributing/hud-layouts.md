<!-- @layer docs @kind doc -->
# HUD Layouts & Glyph Packs

The Extended HUD draws five elements (life, magic, counters, wallet and the button
cluster) wherever the active layout puts them, over a game that knows nothing about
any of it. This page is the contributor's view of that system: the placement model,
how the cluster's geometry is derived, how a glyph resolves, where a player's own
layouts and images live, and what it takes to add a sixth element.

For the player-facing description of the same screens, see
[HUD settings](../user-guide/hud.md).

> **Where the code lives.** The model and all its maths are portable and React-free:
> types in `shared/types/hud/`, geometry in `shared/hud/layouts/`, glyph resolution in
> `shared/input/glyphs/`. The renderer half is `HudLayoutView` (live HUD) and
> `HudLayoutEditor` (the editor), with per-profile storage in `apps/web/src/lib/hud/`.

## The layout model

A `HudLayout` is a name, an id, and one `HudPlacement` per element plus a block of
button-cluster options.

```ts
interface HudPlacement {
  id: HudElementId;                    // 'life' | 'magic' | 'consumables' | 'wallet' | 'buttons'
  anchor: HudAnchor;                   // one of nine
  offset: { x: number; y: number };    // SNES px INWARD from the anchor
  scale: number;                       // 0.5..3, quarter steps
  opacity: number;                     // 0.2..1
  visible: boolean;
}
```

**Everything is in SNES pixels, never screen pixels.** `HudLayoutView` measures the
canvas once and multiplies; that is what lets one layout survive a resize, a change of
aspect ratio and 240-line mode without being re-authored.

### Anchors and the inward rule

The nine anchors are the three horizontal bands (`left` / `center` / `right`) crossed
with the three vertical ones (`top` / `mid` / `bottom`), spelled `top-left`,
`top-center` through `bottom-right`, with the middle cell just `center`.

The offset is measured **inward from the anchor**. That is down from a top anchor, up from a
bottom one, right from a left one, left from a right one. Widening the display
therefore moves an element with its own corner instead of stranding it mid-screen,
which is the whole reason the model stores distances instead of coordinates.

A centred axis has no edge to measure from, so it **ignores the offset on that axis**
instead of drifting by it. `center` ignores both.

All of this is `placeElement` in `shared/hud/layouts/place-element.ts`. It is pure and
total: no clamping, no rounding, no reads of anything but its three arguments. Pixel
snapping is the renderer's call, not this layer's.

### Natural sizes

`placeElement` needs a size to place, and `naturalSize(id, ctx)` in `element-sizes.ts`
supplies the size an element draws itself at *before* the placement's scale.
Three of the five are constants measured off the real sprites. Two are not:

| Element | Natural size |
|---------|--------------|
| `life` | 80 wide; one 8px heart row per ten containers, no caption |
| `magic` | 80 × 16 at full. The bar's own width IS the value, so the reserve is taken at full and a shorter bar draws nothing behind it |
| `consumables` | 30 × 24, three icon+digits rows in a column |
| `wallet` | 48 × 16 |
| `buttons` | 72 with the face cross alone, 148 once the d-pad is free; height from the pad in hand |

The two variable ones arrive through `NaturalSizeContext` (`hearts`, `cluster`)
instead of from a table, because neither is knowable at authoring time.

**A natural size describes the whole compound, not the sprite the element is
named after.** The extended `HudLife` draws hearts only. The LIFE caption belongs to
the console replica and is opt-in through `showCaption`, but while it
was drawn unconditionally its 9px went unmeasured, and the shipped layout put the
magic bar under the second row of hearts. When you add or retune an element,
measure what the component renders, not what it is named after.

**Offsets in a built-in preset clear the element at its LARGEST**, because the
offsets are fixed and the state that sizes an element is not. The default's vitals
are an **L**, not a column: a full twenty-container life block at 6..22 with the
magic bar under it at 28..44, and the counts column beside the hearts at x 94. They
went sideways because stacked three deep they reached y 74, eighteen pixels past
the pause panels' origin at y 56, in a column with eight pixels of slack. A save
with three hearts leaves the second heart row's space empty instead of having the
whole block shuffle as containers are collected. `compact` and `bottom-right` map over the default's
placements, so they inherit that clearance and only widen it.

`useResolvedPlacements` is where a layout becomes rectangles, once per frame: filter
to `visible`, ask for the natural size, apply `fitScale` to the cluster only, then
`placeElement`.

## Button-cluster geometry

`layoutCluster(slots, options)` in `cluster-shapes.ts` turns the modern scheme's slot
list into positioned chips. Its one governing rule:

> **A cluster is one group per assignable category, laid left to right.** With the
> face cross alone it is 72 × 48; once movement moves to the stick and the d-pad is
> free, the second cross puts it at 148 × 48. Only those two groups exist, because §15
> narrowed the assignable set to face and d-pad, so those are the only two widths.

The pieces:

- **A chip is 24 × 24**, made of a 16 × 16 glyph with the assigned item's 16 × 16 sprite
  offset into it by `buttons.spriteOffset` (default `{ x: 8, y: 8 }`).
- **A flat row holds two chips**, at x 0 and x 48. Row pitch is **28** (chip 24 plus a
  4px gap); the last row in a group does not pay for the trailing gap.
- **Slots are grouped into rows by kind** (`triggers`, `shoulders`, `face`, `dpad`,
  `sticks`, `paddles`) and the groups are emitted in `buttons.rowOrder`. Any kind the
  caller's order forgot is appended in the shipped order, and a repeated kind is
  dropped, so a hand-edited layout can never silently swallow a bound control nor be
  charged twice for one group's height.
- **An empty group contributes no row and no gap.** A pad with no paddles is exactly
  as tall as if the kind did not exist.
- **`face` and `dpad` draw as a cross at exactly four members**, 64 tall, at up (24,0),
  left (0,20), right (48,20), down (24,40). The points are chosen by SDL **position**,
  never by a printed letter: `NORTH`/`WEST`/`EAST`/`SOUTH` for face,
  `DPAD_UP`/`LEFT`/`RIGHT`/`DOWN` for the d-pad. Anything else, such as a partial group
  or a pad reporting more than four face buttons, falls back to the flat grid, because a
  cross missing a point reads as a bug and not as a shape.
- **Paddles are split out by position name** (`LEFT_PADDLE*` / `RIGHT_PADDLE*`). SDL
  files them under the `shoulder` category, so the position is the only honest seam.
- **`'system'` slots get no row at all** because they are never item slots.

Worked heights, so a change here has something to check against:

| Bound controls | Cluster |
|---|---|
| 2 shoulders + 4 face | 72 × 92 |
| 2 triggers, 2 shoulders, 4 face, 2 paddles | 72 × 148 |
| ...plus the two stick clicks | 72 × 176 |
| four d-pad slots | adds 68 (a 64-tall cross plus one gap) |

### fitScale shrinks and never reflows

```ts
const fitScale = (natural: Size, column: Size): number =>
  (natural.h > 0 ? Math.min(1, column.h / natural.h) : 1);
```

One factor over the **whole** cluster. A cluster that rearranged itself when the window
narrowed would be a control map the player has to re-learn mid-game, so the cluster
gets smaller and keeps its shape. The column it is fitted into is the view height less
the placement's own `offset.y` at *both* ends, so a shrunk cluster still never touches
either edge. Only `buttons` is fitted; every other element takes its placement scale
as-is.

There are exactly two shapes, `'diamond'` and `'grid'`. A third name, `'row'`,
used to sit in `ClusterShape` and produced byte-identical geometry to `'grid'`:
a group is at most two chips across, so there is no picture "a row" could draw that
a two-chip-wide grid does not, and the name was carrying no behaviour. It is gone
from the type. `normalizeClusterShape(shape)` folds anything that is not
`'diamond'` into `'grid'`, and both `layoutCluster` and the storage layer's
`cloneLayout` run stored options through it, so a layout saved on disk under the
old name keeps rendering exactly as it always did.

## Glyph packs

A pack maps SDL's **positional** control names to artwork. Keying by position rather
than by a printed letter is what lets one pack serve every device family without
claiming a control exists.

```ts
interface GlyphPack {
  id: string; name: string; builtIn: boolean;
  glyphs: Partial<Record<SdlButtonName | SdlAxisName, GlyphSource>>;
  fallbackPack?: string;
}
```

### The resolution chain

`resolveGlyph(packId, position, deviceFamily, packs)` is a chain of responsibility;
the first answer wins:

1. the chosen pack,
2. the pack that pack names as its own `fallbackPack`, followed as far as it goes
   (cycle-safe, so a pack already visited is never asked twice),
3. the **device family's** pack,
4. the generic pack, which covers every position.

`null` out the far end is not an error: it means the position has no artwork anywhere
and the caller should fall back to the control's own label.

**`glyphPack: 'auto'`**, the shipped default, drops step 1 and leaves the
device family to answer. A player who never opens the glyph setting sees their own
pad. Choosing a pack explicitly is therefore an *override* of the device, not a
replacement for it, which is what makes a custom pack containing four face buttons
still draw correct shoulders and triggers.

The family comes from `deviceFamilyOf(slots)` (`HudLayoutView/behavior/device-family.ts`),
which reads it back off the icon key the device layer already stamped on each slot
(`xbox-a`, `ps-cross`) instead of making an IPC round trip from a per-frame render
path. A keyboard reports no SDL position at all, so it is the one case decided by the
binding.

Built-in packs: `switch`, `xbox`, `playstation`, `gc`, `snes`, `generic`, `keyboard`.
None of them re-state which glyph a position gets. They are built from the family
tables in `shared/input/family/`, so a family gaining a position shows up for free and
cannot drift.

### Custom packs

A custom pack is an **override, never a replacement**: it holds only the positions the
player actually imported and names a built-in as its `fallbackPack`. That makes
importing one button a one-minute job instead of a twenty-glyph commitment.

Images are stored the way user sprites are, as raw bytes in the platform file store
with a JSON manifest beside them, and handed to the renderer as object URLs. There is
no protocol handler for this folder the way there is for extracted sprites, so bytes
are read once and cached; `customGlyphUrl(fileKey)` is the synchronous lookup a render
pass needs, and `primeGlyphUrls(packs)` is what fills the cache first. Pass the raw
URL straight to `<img>`, because running a `blob:` URL through `publicAsset` mangles it.

## Where a player's own data lives

Everything is per profile, and every path goes through the platform file store, the
same route every other per-profile blob takes.

| What | Path |
|------|------|
| Custom layouts | `profiles/<profileId>/hud-layouts.json` |
| Custom pack manifest | `profiles/<profileId>/hud-glyph-packs.json` |
| Imported glyph images | `profiles/<profileId>/hud-glyphs/<packId>__<POSITION>.<ext>` |
| Which layout is active | `hudLayoutId` in the profile's settings |

The profile is resolved by `activeProfileId()`. It is **told** first: the settings
screen calls `setHudProfileId(id)` while it is mounted, because it is the one place
holding the profile object that is actually being edited, and clears it on the way
out. Failing that it infers, in order, the running game's profile, the profile a
`--profile` launch pinned, then the app state's last-selected one, because the
editor is deliberately usable with no game running.

**Built-in layouts are code and are never stored.** The preset registry is the only
place they exist, so a preset that is later retuned reaches every profile that chose
it. What *is* stored is a fork: a whole `HudLayout` with its own id, `builtIn: false`,
and `basedOn` naming the preset it started from. A custom layout is therefore
self-contained, so it never breaks when its origin changes, while still remembering
where it came from, which is what the editor's "start from" list needs.

Read a stored id back with `resolveStoredLayout(id)`, never `layoutById`, because the latter
knows built-ins only, so a custom id silently falls back to the default. An unknown id
answers the shipped default instead of nothing, because a stale id in a settings file
is a far likelier cause than a real request for no interface at all.

## Adding a new HUD element

The two exhaustive `switch`es make the compiler most of your checklist: add the id
first and `tsc` will point at every site that has to answer for it.

1. **`shared/types/hud/hud-layout.ts`**: add the id to `HudElementId`.
2. **`shared/hud/layouts/element-sizes.ts`**: add its natural size constant and a
   `case` in `naturalSize`. If the size depends on live state, add a field to
   `NaturalSizeContext` instead of reading a store from this layer.
3. **`shared/hud/layouts/default-layout.ts`**: add a `hudPlacement(...)` line to
   `DEFAULT_HUD_LAYOUT.placements`. The other presets map over the default's
   placements, so they pick the element up for free.
4. **Build the element itself** as a HUD compound under
   `apps/web/src/ui/domains/hud/compounds/`. Keep it bare and presentational, taking a
   `scale` and its data as props. See [Design System](design-system.md) for the tiers.
5. **`HudLayoutView.elementFor`**: add the `case` that renders it.
6. **`HudLayoutEditor.constants.ts`**: add the id to `ELEMENT_ORDER` and a label to
   `ELEMENT_LABELS`, then a `case` in `StageElement` so the editor previews it.
7. **`HudLayoutEditor/behavior/sample-state.ts`**: give it plausible sample data, so
   the editor still previews with no game running.

Existing saved layouts will not contain a placement for the new id. That is fine
because `useResolvedPlacements` iterates the layout's own placements, so an older layout
does not draw it. Do not migrate stored files for this.

## Built-in presets diverge from the plan on purpose

The published plan proposed three **per-family** presets (`switch-pro-2`,
`snes-classic`, `minimal`), a `HudLayout.forGamepadTypes` field, and a pad being
plugged in picking its own preset. The shipped presets are `default`, `compact` and
`bottom-right`, all family-agnostic, and `HudLayout` has no `forGamepadTypes`. That
was a decision, not an oversight:

- **Glyph packs already follow the device family.** With `glyphPack: 'auto'`, the pad
  in hand already changes what the cluster *draws*. A per-family *layout* would only
  change where things sit, and where things sit is a taste preference, not a fact
  about the hardware.
- **The cluster's geometry already adapts to the pad by itself.** Rows appear and
  disappear per bound control and the cross only forms at four, so the per-family
  sizing the plan wanted falls out of the geometry for free.
- **Auto-switching on a pad drop would move the player's HUD without being asked**,
  and would fight a layout they had deliberately chosen.
- The three shipped presets instead differ along the axes players actually ask about:
  overall size (`compact` is the baseline at 0.75) and which corner the cluster sits
  in (`bottom-right`).

Re-adding a per-family layout later is purely additive. It takes a `forGamepadTypes` field
and a lookup at the point `hudLayoutId` is resolved. Nothing in the current model
blocks it.

## Known gaps

- **No delete affordance for custom layouts.** The editor can create, fork, rename and
  save; it cannot remove. The storage-side `deleteCustomLayout` was removed instead of
  left as unreferenced code. Add both halves together if the editor grows the button.
- **A GameCube pad reports family `nintendo`**, so `'auto'` gives it Switch glyphs. The
  `gc` pack is reachable only by naming it explicitly.
- The plan page sketches a fourth cluster shape, "Arc". The code ships two; the page
  is ahead of the implementation there.

## Checklist

- [ ] New sizes and offsets are in SNES pixels, and offsets are measured inward.
- [ ] Nothing added to `shared/hud/layouts/` reads a store, a DOM node or React.
- [ ] The cluster is 72 wide with the face cross alone, 148 with the d-pad free, and no wider for any pad you can find.
- [ ] Glyphs are keyed by SDL position, never by a printed letter.
- [ ] A custom-pack change still resolves through the fallback chain, not around it.
- [ ] `npm run ci` green, and `tests/COVERAGE.md` updated if you added a kept test.

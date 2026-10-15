<!-- @layer docs @kind doc -->
# Code notes: packages/hud

Facts about `packages/hud` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/hud/src/data/compile-expr/compile-expr.constants.ts

- `MAX_EXPR_LENGTH` caps the source before it reaches the recursive descent parser. Every level of nesting costs at least two characters, so the cap keeps deeply nested parentheses from exhausting the call stack. Real HUD formulas are well under 100 characters.
- `REFUSED_FUNCTIONS` is exported so the editor's error table can pin the same list.

## packages/hud/src/data/compile-expr/compile-expr.ts

A source is parsed once and cached by its exact text. Once a document has loaded the engine only calls `evaluate`, never `parse`; the cache is what makes that true. `compileExprCacheSize` exists for tests that prove the cache works.

## packages/hud/src/data/compile-expr/compile-fresh.ts

The parser is expr-eval, cut down to arithmetic over a fixed scope.

- `assignment`, `fndef`, `in` and `array` are switched off. The shipped `parser.d.ts` has no `array` key, but the compiled parser reads it at runtime (`isOperatorEnabled('[')`), which is why `HardenedOperators` adds it to the type.
- `concatenate` is switched off as a correctness fix. In expr-eval `||` joins strings and the logical or is spelled `or`, so `life_current || 0` used to parse, produce the string "110" from 11 and 0, and come back as the number 110 with no error. `&&` fails loudly on its own.
- `random()` is refused after the parse, by asking `symbols()` whether it was named. expr-eval cannot drop a single function, and deleting it from `parser.functions` would only turn it into an unknown name that fails at evaluate time. A layout that re-rolls every frame cannot be previewed, diffed or reproduced.
- The scope is a plain object of numbers, so member access has nothing to reach through even with `allowMemberAccess` at its default.
- expr-eval parse errors read `parse error [1:20]`: the first number is always line 1, the second is the column.
- Nothing here throws into the caller: parse and evaluate failures both come back as values.

## packages/hud/src/data/expand-limits.constants.ts

The two limits on `repeat` and `switch` expansion live in `data/` because both the engine (`packages/hud/src/engine/expand.ts`) and the validator (`packages/hud/src/layouts/validate-expand-budget.ts`) need them, and the validator must not depend on the engine.

- `MAX_REPEAT_COUNT` (200) caps one repeat's resolved count at runtime. It sits above every real use: twenty heart containers, the widest keyboard glyph pack's 107 positions, any slot list.
- `MAX_EXPANDED_NODES` (5000) caps a whole document's worst case node count, checked statically at load and again at runtime while `expand` unrolls. The built-ins place well under a hundred nodes; nested repeats of 200 by 200 are the shape it catches.

## packages/hud/src/data/resolve-value/resolve-value.ts

This is the one seam between an expression result and every consumer (a size, a repeat count, an opacity).

- A result outside plus or minus 1,000,000 folds to that bound. The bound is far above every legitimate value (SNES pixel sizes, item counts, slot numbers) and stops `1/0` from becoming a repeat count of Infinity.
- `NaN`, a compile failure and an evaluate failure all fold to 0, the same safe empty answer a zero size or a zero count gives.
- Negative results are not clamped: edges and animation offsets are negative on purpose. A caller that means a count (a `repeat`) applies the floor itself.
- A value that is neither a number nor `{ from: 'data', expr }` folds to 0 so a malformed document never throws into the layout pass. A grid `gap: { x, y }` left on a flex container once reached `compileExpr(undefined)` and crashed the editor. The validator reports bad shapes.

## packages/hud/src/data/variables/hud-data-scope.ts

`slotCount` is the size of the slot map the caller already holds, passed in so this file adds no plumbing. `countdown` is optional: a caller without one (the pause menu's copy of the map) reads it idle, and an idle countdown reads 0 on all three names.

## packages/hud/src/data/variables/suggest-variable-name.ts

Backs the "did you mean" hint on an unknown variable error. It only offers a name within a small edit distance; otherwise it suggests nothing.

## packages/hud/src/data/variables/variables-table.constants.ts

The one flat table every HUD expression evaluates against, so the editor's variable picker lists itself from this file. Names follow `<thing>_current` / `<thing>_max`, and each maps to a field the HUD already reads. A layout observes the game and never changes it. `index`, `count` and `item` are not table entries: they only have a value inside a `repeat`.

## packages/hud/src/data/variables/variables.type.ts

`HudVitalsSource` names the fields of the renderer's `HudVitalsContent` structurally, because `packages/` is the dependency leaf and cannot import from `apps/desktop/src`. A real `HudVitalsContent` satisfies it with no adapter, and `tsc` catches any drift.

## packages/hud/src/engine/bake-values/bake-gate.ts

A bare gate expression (`animation[].when`, `transition.when`) is evaluated now against the repeat instance's own scope and replaced with the string "1" or "0", so it still means the same thing when read later against the global scope.

## packages/hud/src/engine/bake-values/bake-node.ts

Baking a repeat instance's fields here, once, is a smaller change than teaching every downstream reader (resolve-box, measure, place-flow, place-grid, the renderer's style resolution) to look up a scope per node. Resolving now against the scope that `measure` and `place` would use later in the same frame gives the identical number. Only `Value` and `Extent` fields are touched. `margin` and `padding` are plain numbers and never bindable.

## packages/hud/src/engine/engine.type.ts

- `MeasureContext` carries the facts only the runtime knows, so the engine stays pure and one function serves the live HUD and the editor preview. Anything the engine has to ask for belongs here; anything it can work out belongs in the document.
- `hearts` is the number of heart containers owned; the life block adds a row per ten. Absent means the full twenty, the size the layout reserves.
- `filledSlots` lists slots that hold an assignment. An absent slot still draws, dimmed and empty.
- `scope` is the data table every bound value resolves against. Absent reads as an empty table: literals still resolve and expressions fold to their default.
- `PlacedNode` lists containers beside leaves because the editor selects and drags them; parents come before children. `rect` is in SNES px, absolute in the view, and for an element it is the contained content box. `scale` is SNES px per intrinsic px for an element, and the factor its children are laid out at for a container. `opacity` and `dimmed` are inherited from every ancestor.

## packages/hud/src/engine/expand.ts

Turns the dynamic tree into a static one once per frame, before measuring. `measure` and `place` never see `repeat` or `switch`.

- A repeat vanishes: its N copies are spliced into the parent's children at the repeat's position, so the parent row's own wrap and gap apply across the copies.
- Ids stay unique: a switch keeps the winning branch's id, and each repeat copy suffixes `#<index>` onto its root id.
- A dynamic node's own box properties (scale, margin, style) are dropped, because neither kind draws a box of its own.
- Inside a repeat every bound field is baked to a literal (`bake-values`), because `index`, `count` and `item` only exist in the per pass scope, never in the document's global scope. Outside a repeat nothing is baked.
- The budget is hard: one repeat is capped at `MAX_REPEAT_COUNT`, and a running total stops at `MAX_EXPANDED_NODES`, on top of the static load time check in `validate-expand-budget.ts`.
- The screen is a container by construction, and a container always expands to exactly one container, so `expand` takes and returns one.

## packages/hud/src/engine/flow/flow-gaps.ts

A container has two gaps. `x` is always horizontal and `y` always vertical, so a row separates items by `x` and wrapped lines by `y`, and a column does the reverse. Items are spaced by the main gap, lines are stacked by the cross gap.

## packages/hud/src/engine/flow/to-lines.ts

The flow is shared by both passes: `measure` asks for the lines of an unbounded container, `place` for the lines of the real box, so the size a parent reserved and the arrangement a child drew cannot disagree. Everything is main and cross axis; a column is a row turned ninety degrees. Without `wrap` there is exactly one line however long it is, so an overflowing row stays visible. `EPSILON` is rounding slack so a child that fits exactly is never wrapped by a float error.

## packages/hud/src/engine/grid-cells/assign-cells.ts

- Cell assignment never depends on how much room the grid was given, so the unbounded measure pass and the placement pass agree on which child goes where.
- An explicit cell is never refused for being taken. Every overlay is a grid whose children name the same cell, so the occupied set is one way: explicit placements write it, and only auto flow reads it.
- `place.column` and `place.row` must be given together; a partial placement auto flows.

## packages/hud/src/engine/grid-cells/in-order.ts

`order`, then document order. One rule for both engines: it is the auto flow visiting order and the paint order of co placed children (the item sprite over the glyph it sits on).

## packages/hud/src/engine/grid-cells/natural-per-track.ts

An `auto` track is sized to the largest outer size (box plus margins, negatives included) among the span 1 items that start in it. Spanning items do not contribute; CSS Grid's spanning distribution is not implemented. Margins count because a cell must hold them, and a negative margin is how a sprite hangs outside its group without widening it.

## packages/hud/src/engine/grid-cells/size-tracks.ts

`fill` tracks share what is left after every fixed and `auto` track and every gap. In the unbounded measure pass a `fill` track measures 0, the same reading a `fill` child gets in the flex engine.

## packages/hud/src/engine/grid-cells/tracks-of.ts

When `container.rows` is omitted, rows are implicit: as many `auto` tracks as the assignment needs.

## packages/hud/src/engine/intrinsic-size/aspect-of.ts

Aspect is derived from the intrinsic size and never stored. A size with no height (a spacer) answers 1.

## packages/hud/src/engine/intrinsic-size/intrinsic-size.ts

- Every size is measured off what the renderer's compound draws, never off the sprite the element is named after.
- `TILE` (16) is the tile pair glyphs and item sprites are drawn from.
- A heart shape draws at 8 by 8 SNES px whatever its fill (`HudHeart.constants.ts`).
- A sprite's explicit `box` is a stored document's override; without it the sprite manifest's declared box wins over the 16 by 16 fallback.
- A countdown always measures the full pie; one that is not running is invisible and never measured (`resolve-box`).
- `repeat` and `switch` never reach this switch after `expand`, but they answer an empty size so measuring a raw document does not throw.

## packages/hud/src/engine/layout/layout-hud-bands.ts

The document has one tree: the old nine anchored regions became the screen's direct children (a 3 by 3 grid). The screen's rectangle is the view. A screen whose `visible` is false hides the whole HUD. Bands exist because the pause menu re-pins whichever band holds the button map. Bands are read off `place`'s output (parents first, depth first): a band starts at one of the expanded screen's child ids. A grid child cannot be placed on its own because its cell is sized against its siblings. The function is pure: same document, view and context give the same pixels in the HUD and the editor.

## packages/hud/src/engine/measure/measure-box.ts

Pass one, bottom up. An element wants its intrinsic size, a container wants its children plus padding, both times the node's `scale`. An explicit pixel size overrides that. `pct` and `fill` need a parent and resolve in `place` or `place-grid`; until then the node measures at its natural size. The result is in the parent's coordinates and clamped by `min` and `max`. Nothing here reads a view, so the same subtree measures the same wherever it ends up.

## packages/hud/src/engine/motion-easing/easing-fn.ts

Easing is evaluated in JS because `motion` samples a keyframe value at an arbitrary instant. The four named curves use the CSS spec's `cubic-bezier` control points, solved by bisection on X then evaluated on Y, the way a browser does. Bisection is enough because every named curve is monotonic in X; 20 steps is far finer than a pixel. `steps(n)` is jump end, the CSS default: held at 0 through the first 1/n, landing on 1 only at t = 1. An unknown name reads as linear.

## packages/hud/src/engine/motion/cycle-position.ts

`none` clamps at the end, `loop` wraps, `ping-pong` reflects. Before the delay has elapsed the position is 0 (the rest pose), so an animation whose gate just turned true does not flash to a mid track value.

## packages/hud/src/engine/motion/sample-animation.ts

Motion is a pure function of a clock the caller owns (`HudNodeMotion` in the renderer). `elapsedMs` is one shared clock since the surface mounted; each animation reads its own position through `delay`, which is the whole staggering mechanism. Gating with `when` never resets an animation; it samples wherever the shared clock is. `undefined` means the gate is false and the caller draws the unanimated value.

## packages/hud/src/engine/motion/sample-keyframes.ts

`t` is a fraction of the track, not wall time. Values clamp at the ends and are eased per span; a keyframe's own easing overrides the animation default for that span only.

## packages/hud/src/engine/place-flow.ts

- Works in the container's own authored units and converts to view pixels once through `unit`, so a subtree can be drawn at another size with no number in it changing.
- `fill` resolves before wrapping. The main axis fill placeholder stays unclamped until `shareRemaining` writes the real share and clamps it; the cross axis is clamped immediately.
- Leftover main axis space is shared equally among fill children, each share clamped to its own `min` and `max`.
- `stretch` reads as `start` in a flex line; nothing stretches a flex child.
- `between` puts free space only between pairs, `around` gives each child free/n split half on each side, `evenly` makes n+1 equal gaps. A single child falls back to `start` under all three. An overflowing line keeps a negative free space and is drawn overflowing.
- A zero width or zero height child leaves the flow with no gap held open. The magic bar relies on this: at `magic_current == 0` its bound width is 0 and the bar is gone.

## packages/hud/src/engine/place-grid/child-boxes-grid.ts

- `alignSelf` overrides both `justifyItems` and `alignItems` for one child, and `justifySelf` takes the inline axis back on its own (the screen's top centre child is `center` across and `start` down). Unset resolves to `stretch`, the one place that word has meaning.
- Children are placed in `order` then document order, which is the paint order of co-placed children.
- A zero sized child is dropped, the same rule as the flex engine.

## packages/hud/src/engine/place-grid/grid-cell-rects.ts

The drop indicator geometry comes from the solved tracks, so an empty column still has a rectangle. `implicit` marks the one extra row past the last declared one: a grid grows rows and never columns, so that row is a drop target and a new column never is.

## packages/hud/src/engine/place-grid/solve-grid.ts

One solve feeds both the child boxes and the editor's drop indicator cells, so the cell an author aims at is the cell a child lands in. Cell assignment and track sizing do not depend on whether the pass is bounded.

## packages/hud/src/engine/place/is-dimmed.ts

A node is dimmed when it names slots in `dimWhenEmpty` and none of them is filled. A node that names none is only dimmed by an ancestor.

## packages/hud/src/engine/place/place.ts

Pass two, top down. A node gets the box its parent gave it and returns itself and everything under it, parents first. An element is contained, never stretched: its intrinsic aspect is fitted in the box and centred, which is why `HudElement.fit` has one legal value. Dimming and opacity both descend the tree. `unit` is view pixels per authored pixel in the parent, the product of every ancestor's scale.

## packages/hud/src/engine/resolve-box/clamp-to-box.ts

`min` and `max` clamp a resolved size however it was reached (fixed, `pct`, `auto` or `fill`). An unset bound means no floor or ceiling, never zero.

## packages/hud/src/engine/resolve-box/resolve-gap.ts

One gap resolver serves both engines: `x` is horizontal and `y` vertical, and `flowGaps` turns them into main and cross for a flex row or column.

## packages/hud/src/engine/resolve-box/resolve-opacity.ts

Opacity is clamped to 0..1 at runtime because a bound expression is not statically checked the way a literal is (`validate-box.ts`).

## packages/hud/src/engine/resolve-box/resolve-visible.ts

A countdown with nothing counting (`countdown_active` is 0) is treated like `visible: false`: it leaves the flow under both engines. A bound `visible` is truthy when non-zero.

## packages/hud/src/engine/resolve-extent.ts

Shared by the flex flow, grid tracks and a region's root. `fill` survives as a marker because it can only be answered once every fixed sibling is known. A bare expression extent is `px` shorthand.

## packages/hud/src/engine/resolve-text/snap-game-font-size.ts

The ALttP Dialogue face has a 16 px em box (`--game-cell-h` in `game-text.css`) and only looks right at whole multiples of it.

## packages/hud/src/engine/resolve-text/stem-for-sprite-char.ts

The digit set has no letters, matching `HudNumber`.

## packages/hud/src/engine/resolve-text/text-intrinsic-size.ts

The text size is an estimate: there is no DOM or canvas here. It is shared with the renderer's `HudText` compound so the string and per character geometry never drift. A sprite face uses one 8 px tile per character (the `HudNumber` digit tile and `PauseText`'s glyph size), and `&` spans two tiles in the pause letters set. Real fonts use a 0.6 advance and 1.2 line height ratio; "contain, centred" absorbs the mismatch.

## packages/hud/src/hud-countdown-track/

- Follows the game's HUD countdown across frames. The game exports the seconds left and the frames left inside the current second, never the countdown's length, so the first value seen when a countdown starts stands for the whole of it.
- The game spends 62 frames on one counted second.
- The game counts down on the overworld only; indoors the value is stale.
- framesLeftOf counts frames until the seconds reach zero, which is when the game acts on the countdown.
- A zero with no countdown before it is a cleared value, which the game turns off a frame later.
- A countdown starts when the value comes on, or when it rises while one is running.
- CountdownTrack: `total` is the seconds it started from, `totalFrames` the frames it had to run at the start, `remaining` the whole seconds left, `fractionLeft` the share still to run (1 down to 0).

## packages/hud/src/layouts/built-in-layouts/built-in-layouts.constants.ts

The shipped arrangements are JSON documents read through the same `loadLayout` a player's layout uses, so "built in" is a label and not a second authoring path. Each is validated as the module loads, so a broken built-in fails the build at first import. They are the only copy of the shipped arrangements.

## packages/hud/src/layouts/chrome-reserve.constants.ts

The numbers both the HUD layout and the enhanced pause menu chrome answer to. The two layers draw over the same play field and cannot see each other's rectangles, so anything they must agree on lives here. The pause tab strip once sat against a vitals block measured by hand; when the block grew a row the strip stayed put and the consumable counts printed across the screen names.

- `HUD_EDGE_INSET` (8) is what a fixed element or strip keeps clear of the play field border.
- `PAUSE_LEGEND_HEIGHT` (16) is the legend strip along the bottom, the height `PauseNavLegend` draws at. In 224 line mode the menu panels reach y 200 and the strip starts at 208, leaving 8 px that no 16 px element fits in. So a bottom left element sits in the strip, on its plate, flush with the bottom edge. Measured from the bottom this holds at 224 and 240 lines alike.
- `PAUSE_LEGEND_LEFT_RESERVE` is what the legend keeps clear at its left end so the wallet and the strip share a row. The measured collision was 36 px of x overlap and 6 of y between the wallet and the leftmost legend glyph. Wallet at 8 inset plus 48 wide covers x 8..56; the reserve is 8 + 48 + 8 = 64; on the narrowest 398 px field (16:9 at 224 lines) the strip gets 334 px for its centred pairs. 48 is the four digit wallet (16 px icon plus four 8 px digits); at three digits it is 40. The widest legend is 326 px (five pairs at their longest words on a pad with a four glyph d-pad), which puts its leftmost glyph at 68, twelve px clear of the wallet.

## packages/hud/src/layouts/convert-engine.ts

Switching a container between flex and grid as a patch. The editor applies edits through `patchNode`, which shallow merges, so a freshly built flex container laid over a grid left `columns`, `rows`, `justifyItems` and `alignItems` behind (unsaveable) and once left a grid's `gap: { x, y }` where flex read a single value, crashing the editor. The patch names every key the other engine owns as `undefined`, which is how `patchNode` drops a key. Since §57 `gap` and `guide` are shared by both engines and pass straight through. Children are left alone: `place` and `justifySelf` are legal on any box and unread under flex, so a flip and back restores the arrangement. The shape survives where it cheaply can: a one column grid becomes a flex column, a flex row of N children becomes N columns, and columns are never fewer than the furthest cell a child names. A switch to the current engine returns `null` so a click on the lit button writes nothing.

## packages/hud/src/layouts/device-layout.constants.ts

Which shipped layout a freshly dropped device starts wearing. A control scheme names its HUD layout (`ModernBindings.layoutId`), and a scheme just prefilled from a device has to name something. It is only a prefill: the controls screen's picker and the editor's "save a copy" change it, and nothing re-derives it. Both device kinds start on the same layout because the shipped set differs by screen position, not by device. The table exists so a device specific layout only changes this file.

## packages/hud/src/layouts/element-sizes/element-sizes.constants.ts

Natural (unscaled) sizes in SNES pixels, measured off what the renderer's compound draws, never off the sprite the element is named after. These are the data behind `packages/hud/src/engine/intrinsic-size`.

- The life block is hearts only. It used to include 9 px for the console's LIFE caption; the enhanced style has no caption, `HudLife` draws it only for the vanilla top bar and the pause status panel, and neither is placed from here.
- `LIFE_SIZE` reserves two heart rows, the usual twenty containers and the tallest the block gets. `lifeSize` gives one row per ten containers.
- `MAGIC_SIZE` is 80 by 16: a 5:1 bar in a 1 px frame, exactly as wide as a full heart row so the two share a left edge. It is the meter at full, not a function of current magic, so neighbouring elements never shuffle when a spell is cast. `HudMagicBar` draws a shorter bar inside the same box.
- `CONSUMABLES_SIZE` is three icon plus digits rows: a 12 px icon gutter, a 2 px gap and two digit tiles across, three 8 px rows down. The key row is reserved even when the game hides the counter.
- `COUNTDOWN_SIZE` is 44 by 44, the pixel pie's own grid (`HudPixelPie` `GRID_SIZE`), one cell per game pixel. The smooth pie draws about 44.4 (`countdownSize(1)`); the renderer centres it across this box and keeps its top edge so both discs share a centre and bottom line. `apps/desktop/tests/hud/hud-countdown-node.keep.test.ts` pins the two numbers against each other because `packages/` cannot import them.
- What life, magic and consumables occupy together is derived in `vitals-reserve`, never written down here.

## packages/hud/src/layouts/geometry.type.ts

`Size` and `Rect` are in SNES pixels. The renderer multiplies by its own display scale; this layer never does.

## packages/hud/src/layouts/grid-track-edits/child-after.ts

A `place` drops every `undefined` key after an edit, because `{ colSpan: undefined }` is not what a document says when a span is gone and a validator walking keys would see it.

## packages/hud/src/layouts/grid-track-edits/edit-grid-tracks.ts

A track edit is a document rule (§50): adding, inserting, removing or moving a track changes what every child's `place` means, so the remap lives beside the document types. Nothing is refused because a child is in the way; the children follow:

- Remove: later children shift one toward it; a child whose origin was in it lands on the track before (or after when there is none); a span covering it shrinks by one.
- Insert: children at or after the point shift away; a span straddling the point grows by one.
- Move: the origin rides with its track, and the displaced neighbour shifts; it is the track list's own permutation read backwards.
- `append` and `size` never change an address, so children are returned untouched. `size` writes one extent over a selected range.
- The result is always in range: `place.column`/`place.row` is at least 1 and no span reaches past the last track. `validateLayout` and `place-grid` rely on this. `columns` never empties; a `remove` that would empty it is a no op.

## packages/hud/src/layouts/grid-track-edits/tracks-on.ts

`rows` may be omitted (implicit `auto` rows), so the axis is materialised out to what the children already reach before an edit, which makes an implicit row seen in the lattice a real track.

## packages/hud/src/layouts/load-layout/load-layout.type.ts

`warnings` carries the non blocking reflow notes from `validate-motion-warnings` and only rides along on success.

## packages/hud/src/layouts/load-layout/try-load-layout.ts

One reader for built-in and custom layouts; nothing downstream can tell them apart except the `builtIn` label. The value goes straight to validation. `loadLayout` throws; `tryLoadLayout` returns the errors for the two callers that can do better (the editor shows them, the profile store falls back to the default).

## packages/hud/src/layouts/validate-box/extent-at.ts

A bare expression object is `px` shorthand (`packages/hud/src/types/hud-node`). A bare number is not offered the same shorthand, so the check looks for the expression shape specifically.

## packages/hud/src/layouts/validate-box/validate-box.constants.ts

`$comment` is the one key reserved for documentation inside a document; every other unknown key is treated as a typo.

## packages/hud/src/layouts/validate-box/validate-box.ts

Layout documents are hand editable files (the player's and the built-ins), so a bad value is reported and the document refused; a layout that draws four of five elements is worse than one that names the wrong line. Every checker takes its path so messages name the exact field. Bindable fields (`scale`, `opacity`, `size`, `min`, `max`) go through `validateValue`: a literal passes, an expression is parsed and its variables checked. Negative margins and padding are legal; that is how art overhangs. `insideRepeat` is forwarded to every value check so fields under a repeat may name `index`, `count` and `item`.

## packages/hud/src/layouts/validate-button-node.ts

`idle` is the only required button state; others fall back to it at render time (`HudButton`). The glyph position rule duplicates `validate-node`'s instead of importing it because `validate-node` imports this file.

## packages/hud/src/layouts/validate-container/container-common.ts

A gap axis is a `Value` and never negative. `x` is always horizontal and `y` always vertical, so a document never has to say which engine it was authored for.

## packages/hud/src/layouts/validate-container/validate-flex-container.ts

There are two flex directions, not three: a container is `row` or `column`, and `stack` does not exist. `gap` and `guide` belong to any container: both engines take `gap: { x?, y? }` and both take a `guide` because the editor draws either engine's arrangement over the preview.

## packages/hud/src/layouts/validate-countdown-node.ts

`countdown` has one optional field, the pie variant. Absent means the profile's own setting (`packages/hud/src/types/hud-countdown`). `COUNTDOWN_VARIANTS` lists `setting` first, then the setting's two ids in its own order.

## packages/hud/src/layouts/validate-dynamic-node/expr-at.ts

`when` and `item` are bare expression strings. They are wrapped as `{ from: 'data', expr }` and passed to `validateValue` to reuse its parse and variable check; only the issues matter.

## packages/hud/src/layouts/validate-dynamic-node/repeat-spec.ts

`repeat` and `switch` validators take `validateNode` as a parameter because `validate-node` imports them, so importing back would cycle. A repeat's `count` is checked in the scope the repeat sits in; `item` and `child` are checked with `insideRepeat` forced true because they read the repeat's own per pass scope.

## packages/hud/src/layouts/validate-expand-budget.ts

A static worst case node count, priced at the least favourable answer at every dynamic point: a repeat at `MAX_REPEAT_COUNT` (a literal count is priced exactly, clamped like the runtime floor) and a switch at its most expensive branch. It never resolves an expression or reads a save, so a document that could draw an unbounded tree is refused before it is saved.

## packages/hud/src/layouts/validate-layout.ts

A bad document fails loudly and never half draws: every problem is collected with its path, and the result is rebuilt from understood values only. The screen is always exactly the view, so `SCREEN_LOCKED` keys (size, min, max, margin, scale, place, order, alignSelf, justifySelf, dimWhenEmpty) are refused by name. Its engine is not locked: since §42 `layout`, `direction`, `columns` and `rows` are the author's to set. The worst case node count is priced across the whole document, matching the single runtime counter in `expand`, because two subtrees each near the limit still add up past what a frame should draw. Warnings do not block a load.

## packages/hud/src/layouts/validate-motion-warnings/collect-reflow-warnings.ts

The reflow rule as data a panel can render: an animated `width` or `height` inside a flow container may reflow siblings, so the validator emits a non blocking warning. It is a static walk of the pre expansion tree, correct because a container's `direction` and `layout` are fixed at author time, and `repeat` and `switch` are transparent: their instances inherit the parent of the dynamic node.

## packages/hud/src/layouts/validate-motion-warnings/is-overlay.ts

An overlay reflows nobody: every child sits in one cell. It used to be `direction: 'stack'` and is now recognised by shape (a grid whose children all name the same cell), so a hand authored overlay in any cell gets the same reading.

## packages/hud/src/layouts/validate-motion/gate-at.ts

A bare `when` is an expression string, the same shape a switch case's `when` is, checked by wrapping it for `validateValue`. `extraNames` lets `transition.when`'s `delta` pass.

## packages/hud/src/layouts/validate-motion/validate-motion.constants.ts

`steps(n)` requires n of 1 or more; `steps(0)` has nothing to step between.

## packages/hud/src/layouts/validate-motion/validate-transition.ts

An empty `properties` list is allowed on a transition (not on enter or exit): `transition` holds value transitions and arrive or leave motion, so an enter only transition (a fade in when a repeat produces the node) is legitimate. Phase 10 of the inspector review made that authorable. An object holding nothing at all is still refused.

## packages/hud/src/layouts/validate-node.ts

- A node is rebuilt, not cast: only understood keys survive, so nothing can be smuggled into the engine. An unknown key is an error because in a hand edited file `gapp: 4` is a typo.
- A glyph names a position or a slot, never both. `position` draws one control whatever is bound to it; `DPAD` is the synthetic name for the shared cross because no device reports the whole d-pad. `slot` draws the glyph of whatever slot N is bound to.
- A container picks its engine by `layout`: absent or `flex` goes to the flex validator, `grid` to the grid validator.
- `insideRepeat` threads down every call and flips to true only under a repeat's `child`.
- A sprite's `box` is a plain `{ w, h }`, not a value pair, because it names the asset's shape.
- A slot bound button derives its `dimWhenEmpty` from `bind.index` instead of having one authored. A verb bound button is a core control and never counts as empty.

## packages/hud/src/layouts/validate-placement/place-at.ts

`place` is a grid cell reference. It is not checked against a flex parent; whether it applies is `place-grid`'s question.

## packages/hud/src/layouts/validate-style/paint-at.ts

`Paint` is checked here because every colour shaped field is a style property. `required` is set by border, shadow, outline and tint (a colour is mandatory there); `background` is the only caller that lets it be absent. A gradient's `angle` is its one bindable number.

## packages/hud/src/layouts/validate-value.ts

A `Value` is a finite number or `{ from: 'data', expr }` whose expression parses and names only known variables (plus `index`, `count`, `item` inside a repeat). Failures carry the field path, the parse column when expr-eval reports one, and a "did you mean" for a near miss. `undefined` means not authored and is not an issue, so callers can pass optional fields unconditionally.

## packages/hud/src/layouts/validate-value.type.ts

`extraNames` lists names known only at one call site: `transition.when`'s `delta`, which means nothing anywhere else and so is neither a table entry nor a scope extra.

## packages/hud/src/layouts/vitals-reserve/shipped-vitals.constants.ts

The shipped block is `{ x: 8, y: 6, w: 116, h: 38 }`: life 8..88 x 6..22, magic 8..88 x 28..44, counts beside them at 94..124 x 6..30. The pause menu panels start at y 56, so the bottom edge at 44 leaves twelve px clear. That is why the counts sit in a second column: stacked as a third row they would reach y 74, eighteen px past the panels' origin.

## packages/hud/src/layouts/vitals-reserve/vitals-reserve.constants.ts

`REFERENCE_VIEW` is 16:9 at 224 lines (398 by 224), the narrowest display a host drawn style allows. The vitals are top left anchored in every shipped layout, so it only matters if a layout ever anchors them to an edge that moves with the display.

## packages/hud/src/layouts/vitals-reserve/vitals-reserve.ts

The rectangle the shipped vitals occupy, measured by running the same layout pass the renderer runs over `packages/hud/data/layouts/default.json`, so it moves when that document is re-authored. Hand copied literals once disagreed (96x40 in one file, 96x49 in another). The vitals band is found by what it draws (the band holding a heart shape), never by a node id. It is measured at the full heart count, because a reserve taken at the current save's count breaks at the eleventh container. The `hearts` preset's repeat count reads `life_max` from the data scope, so the full block is measured by passing `life_max` = hearts x 8 (eighths per heart).

## packages/hud/src/presets/instantiate-preset.ts

A preset is a starting point, not a component instance. `instantiatePreset` returns a fresh copy with every id rekeyed (the original id plus a short `newId` suffix), so two inserts never collide and editing one copy never reaches another or the template. An unknown id returns `null` so the toolbar never has to trust a stale list.

## packages/hud/src/presets/presets.constants.ts

The eight prebuilt subtrees a HUD document can start from. Each is an ordinary `HudNode` JSON file, validated as the module loads, so a preset that stopped being a valid subtree fails at first import.

## packages/hud/src/presets/presets.type.ts

`icon` is a single glyph, matching the toolbar's icon only convention.

## packages/hud/src/types/hud-button/hud-button.type.ts

- `button` draws a control's face, with a face per state. It replaces the old `glyph` element as a control's picture. `{ type: 'slot', index }` (the item sprite a slot holds) is a separate object placed wherever the author likes; binding both by the same numbered slot is what makes that free.
- A bind names which control, not which device. `verb` is one of the six core actions every scheme has; `slot` is whatever slot N fires, and N is never capped or checked against a real device (a keyboard has 107 glyphs, and a layout may name a slot nothing is plugged into).
- A face is a picture the author chose, not an auto resolved binding. `image` is the author's art; `glyph` names a pack and a position the way the `glyph` element does, picked visually from the same grid. The glyph is a plain string (an SDL position or `DPAD`, as `HudGlyphPosition`) so this file never imports the recursive node union back; the validator checks it against the same set.
- `idle` is the only state every button must have. A missing state falls back to `idle`. `unassigned` (drawn when the bound slot fires nothing right now) supersedes the old `dimWhenEmpty` flag for a button: it can be a different picture, not only a dimmer one.

## packages/hud/src/types/hud-countdown/hud-countdown.type.ts

- `countdown` is the HUD timer the digging game and the Super Bomb share: a pie that loses a slice per share of the time, with the seconds drawn on it. The renderer reuses the `HudCountdown` compound the Original style draws (`HudView`'s `HudCountdownSlot`); this leaf only says where it goes (section 62).
- It draws only while the game counts down. While `countdown_active` reads 0 the node is not visible, exactly as `visible: false` is, so it leaves the flow and takes no space (`packages/hud/src/engine/resolve-box::resolveVisible`). That is the kind's own rule, not something an author binds.
- `variant` picks the pie. Absent or `setting` follows the profile's `hudCountdownStyle`; one of the setting's own ids pins the node to that pie. Variant ids are named exactly as the setting names them.

## packages/hud/src/types/hud-layout/hud-layout.type.ts

- The layout document is what a built in JSON file holds and what the editor saves; only the `builtIn` flag tells them apart.
- A layout is one tree hanging off the screen. It used to be two positioning systems: a `screen` container and a `regions[]` array of nine named anchors, which were a 3x3 grid wearing nine words (`top-left` is cell (1,1) hugging start and start, `center` is (2,2), `bottom-right` is (3,3) hugging end and end). Section 42 folded them in: the screen is a grid and a former region is an ordinary child with a `place`. A child of a grid can be in any cell of any template, can span, and can share a cell. Moving the wallet is picking a cell.
- Anchoring happens once, at the screen, and everything below is in the flow, so a layout never grows an absolute escape hatch halfway down. The numbers inside it are distances and relationships, not screen coordinates, which is what lets one document lay out the same at 16:9, 21:9 and in 240 line mode.
- `HudScreenRoot` is the document's one root and the only node whose size is not a question. It is an ordinary `HudContainer` with the same decoration and choice of engine, held apart only because its rectangle is not authored: it is always exactly the view. So `size`, `min`, `max`, `margin`, `scale` and the child placement fields are refused on it by `validate-layout.ts`. Locking that in the validator and not in the type is deliberate: a hand edited file gets the same named error as any other bad field, not a silently ignored key.
- The screen's engine, columns and rows are the author's (section 42, reversing section 38.4). The default template is `[auto, fill, auto]` each way, the middle track eating the free space so the outer bands hug the edges, which is exactly the nine anchors. Its `padding` is the one inset every child sits inside, so a safe area margin is one number in one place.
- `HudClusterReveal` says when the button map is on screen during play. It is a property of the whole map, since showing only while something has just changed is a statement about a group of controls over time, which no single box can make.
- `glyphPack` and `inGameplay` are the two display fields that outlived the old `HudButtonsOptions`. `shape`, `rowOrder` and `spriteOffset` were cluster geometry that the tree now authors directly.
- `basedOn` is the layout this one was forked from, for the editor's start from list.
- `glyphPack` is which pack every glyph in the layout draws from, or `auto` to follow the device family (default `auto`); a glyph element's own `pack` wins over it. It cannot live only on nodes because the pause menu's nav legend draws glyphs that belong to no node, from the same pack the button map uses.
- `inGameplay` defaults to `always`.
- `screen` is required: a layout with no screen has nowhere to draw.

## packages/hud/src/types/hud-motion/hud-motion.type.ts

- `animation` and `transition` are two property sections any node may carry (phase 6 of the HUD data binding plan).
- An animation runs on its own clock. Gated by an expression (`when`, absent means always, evaluated truthy when non zero like a switch case and never parsed as a `Value`), it samples a `keyframes` track over `duration` and `delay` in ms, repeating per `loop`. `steps(n)` turns a `property: 'x'` animation over a clipped box into a frame exact sprite sheet flipbook, which unlike a GIF can be paused with the game, staggered per repeat index (`delay: 'index * 80'`, see `apps/desktop/tests/hud/hud-motion`), or driven by data.
- A transition fires when a bound value changes, a different clock. Picking up an arrow eases the counter's own properties. `enter` and `exit` apply the same idea to a node appearing or disappearing (a repeat gaining or losing an instance), since a changed value has no meaning for a node that did not exist a frame ago.
- The reflow rule (see `REFLOW_PROPERTIES` in `packages/hud/src/engine/motion` and `packages/hud/src/layouts/validate-motion-warnings`): `scale`, `opacity`, `x`, `y`, `rotate` and `tint` are drawn after placement and cannot move a sibling, because the renderer applies them as a transform, filter or opacity overlay on the node's own placed box. `width` and `height` are allowed but flagged inside a flow container (flex or grid), since a pulsing width that shoves the magic bar every frame makes a HUD that will not sit still.
- `HudEasing` is one of five named curves or `steps(n)` for an integer n of 1 or more. The exact shape is checked at validation (`packages/hud/src/layouts/validate-motion`); the type does not pretend a template literal can check an author typed string.
- A keyframe's `at` is a 0 to 1 fraction of the animation's `duration`, never wall clock time. A keyframe's `easing` overrides the animation's easing for the span leading into that keyframe only.
- An animation needs at least two keyframes.
- Enter and exit properties are narrower than value transition properties: a node arriving or leaving reads only as a fade, a scale, or a small position settle, never a colour swap.
- `HudTransition.when` has one extra name available: `delta`, the signed change in whichever property changed (see `transitionDelta` in packages/hud/src/engine/motion). Only ease increases is `delta > 0`.

## packages/hud/src/types/hud-node/hud-box.type.ts

- The recursive HUD document model has one node type with two shapes. A container has children and lays them out; an element draws one thing and has an intrinsic size. Both carry the same box properties, so a container can be sized, moved and scaled like a leaf and the editor needs one inspector.
- The aspect ratio is load bearing. An element is never stretched: `contain` is the only fit, so a larger box letterboxes the content and a smaller one scales it down. No engine code path writes a width and a height independently.
- Two ways to change a size. `scale` multiplies a node's own coordinate system (content, padding, gaps, everything below) by one factor; it is how a subtree grows or shrinks (the compact preset is the baseline at 0.75) and what a ratio locked resize handle writes. `size` sets the box: for an element the content is contained inside it; for a container it is the field its children flow in, so spare main axis space feeds `justify` and `fill`, and spare cross axis space feeds `align`. Children are never stretched to fill it, because flex has no stretch alignment; a grid's `alignItems` is the one place stretch is real, since a grid cell is a real box with no content to letterbox against.
- Bindable boxes (phase 2 of the HUD data binding plan): `size`, `scale`, `opacity`, either axis of a container's `gap`, and `visible` take a `Value`. The engine resolves each before measuring (`packages/hud/src/engine/measure`, `packages/hud/src/engine/place`), so a document with no bound values measures as it always has. `visible` keeps its boolean shorthand and gains the `Value` form, truthy when non zero.
- Numbers are SNES pixels in the coordinate system of the node's parent. The renderer multiplies by its own display scale; nothing in this model knows about screen pixels.
- `Extent`: `auto` is intrinsic; `fill` takes the remaining main axis space (in a grid, the remaining track space); `pct` is measured against the parent's content box on the same axis. A bare expression is `px` shorthand: `{ from: 'data', expr }` alone means `{ px: { from: 'data', expr } }`. A bare number is not offered that shorthand (`{ w: 40 }` stays refused, see validate-box.ts's test), because it cannot be told apart from forgetting the `px` wrapper.
- `Edges` may be negative: that is how a sprite hangs outside the box it belongs to, which is what the cluster's radial item offsets are.
- `HudPlace` is where a grid parent places the child. It is ignored under a flex parent but still round trips, so a node moved between flex and grid parents keeps it. It is 1-based; absent means auto placed in document order. Two children may name the same cell: that is how every overlay is written (section 42), so an explicit place is never refused for being taken, and only auto flow skips an occupied cell. Co-placed children paint in `order`, then document order.
- `HudAlignSelf` overrides the parent's item alignment for one child: a flex line's cross axis, or both grid axes at once. `justifySelf` (grid only) overrides the inline axis on its own and wins over `alignSelf` there, which a cell whose two bands disagree needs (the screen's top centre band is `center` across and `start` down). Under flex it is ignored, since the main axis is the container's to distribute.
- `HudBox.id` is stable, editor assigned and unique within the document.
- `min` and `max` are a floor and a ceiling on the resolved size, whatever `size` says, for every extent kind. They keep a `fill` child from collapsing to nothing or growing without bound.
- `scale` defaults to 1. `opacity` is 0.2 to 1, multiplied down the subtree.
- `visible` defaults to true. An invisible node leaves the flow entirely: a hole where an element used to be was a defect of the flat model. The `Value` form resolves truthy when non zero, so hiding the arrow counter while there are none is `{ from: 'data', expr: 'arrow_current > 0' }`.
- `dimWhenEmpty` draws the node dimmed while none of the listed slots holds an assignment. One number for a face button; all four for the d-pad's shared cross. The engine only resolves the flag; the renderer decides what dimmed looks like.
- `order` is the paint order tiebreak within the parent, default 0. Higher draws later (on top) and is visited later by a grid's auto flow.
- `style` is CSS grade decoration (see hud-style). `animation` is self clocked motion gated per entry; `transition` eases the node's own bound properties when they change, plus its own enter and exit (see hud-motion).

## packages/hud/src/types/hud-node/hud-container.type.ts

- Every container has two gaps. `x` is always horizontal and `y` always vertical, whatever the engine or direction (CSS `column-gap` and `row-gap`), which is why the panel can label them with arrows. A flex row separates items by `x` and wrapped lines by `y`; a flex column does the reverse. A grid separates columns by `x` and rows by `y`. The flow engine used to spend one number on both (section 57), which is why a flex `gap: n` migrates to `{ x: n, y: n }` and lays out the same.
- `HudGuide` is a container's own overlay colour, editor only and never drawn by the game, so the editor can tell nested containers apart. `show` is written so stored documents stay valid and is read by nothing (section 55).
- `HudContainerBase` is what is true of any container whichever engine it picks: it holds children, separates them on two axes, and the editor may draw it.
- Flex `direction` is two values, not three: an overlay is a grid whose children share one cell (section 42), which is what `direction: 'stack'` used to pretend not to be.
- Flex `justify` has three positions and three distributions. `between` puts free space only between children, `around` gives each child an equal share with half of it at either end, `evenly` makes every gap equal including the two ends. All three degrade to `start` on a line holding one child.
- Flex `align` has no `stretch`. An element is never stretched under this engine, so a cross axis stretch would do nothing; `place-flow.ts` reads a stray one as `start`.
- `HudFlexContainer` is the flow engine that ships today. `layout` is optional and defaults to it, so existing documents need no key.
- `HudGridContainer` is the second placement engine: two axes, position driven. `columns` needs at least one track; each may be `auto` (sized to its widest or tallest cell), `fill` (shares remaining track space), `{ px }` or `{ pct }`. Omitted `rows` means as many implicit `auto` rows as the auto flow needs.

## packages/hud/src/types/hud-node/hud-element.type.ts

- `DPAD` is a synthetic glyph position. A pack is keyed by SDL position, and the whole d-pad is not a position any device reports, so `DPAD` names the one cross that stands for all four directions. It resolves to the group artwork, as `apps/desktop/src/hud-layout-editing/glyph-art` does.
- A glyph names either a fixed `position` (a picture of one control, whatever is bound to it) or a `slot` (the glyph of whatever slot N is bound to right now, the binding first rule a chip follows). Never both.
- `repeat` draws its one child N times, handing each pass a scoped `index` (0 to count minus 1), `count` (the repeat's resolved count) and `item`, the number from the parent, such as how full one heart is. `item` is a bare expression, not a `Value`, since it has no meaning outside the child. There is no second repeat mode: a repeat of a `sprite` is what used to be repeat sprite, and a repeat of a `switch` is repeat dynamic object.
- `switch` draws the `node` of the first case whose `when` evaluates truthy (non zero), or `otherwise` when none do, or nothing. The order of cases is the logic, which is why it is an array and not a map.
- A sprite's `box` is an explicit override of its natural size in SNES px, a stored document's escape hatch. The real default lives in the sprite manifest (`boxForExtract` in packages/game-data/src/data/sprite-manifest/sprite-box, keyed by `file` in `SPRITE_BOX_BY_FILE`), derived from the extraction recipe: a strip extracted HUD icon (bomb and arrow counters) is 16x8, a single tile one (key counter) is 8x8, and 16x16 is the fallback. `intrinsic-size.ts` reads `box ?? SPRITE_BOX_BY_FILE[file] ?? 16x16`.
- `HudElement.fit` has one mode, `contain`, named so the JSON says it.

## packages/hud/src/types/hud-shape/hud-shape.type.ts

- `shape` is a small vector picture with a fractional fill, added in phase 5 of the HUD data binding plan. The shipped enhanced HUD draws a heart as a curved SVG silhouette (`HudHeart`), clipped at an arbitrary fraction of its width and tinted on its rim, highlight and shaded flank by the armour tier. `HudBoxStyle.tint` cannot produce this, because a CSS or SVG filter tints a raster image's pixels and here the picture is the curve itself.
- `HudMeter` (the magic bar) is a rounded bar whose length is the value, split into banded sheens for the half magic upgrade. The plain one band case is reproducible in the style system, but the two band split is a second, separately lit region, which `shape` draws.
- There are two named pictures, not a general vector facility, the same restraint hud-text uses for its two faces. Both keep the artwork, palette and thresholds of the compounds they replace; see `HudShape` for the drawing.
- `fill` is 0 to 1. A heart's fill quantises at render time when the heart mode setting is `original`; a magic bar reads it continuously, as `HudMagicBar` did.
- `armor` (heart only) is the armour tier 0 to 2, tinting rim, highlight and shaded flank as `HudHeart`'s tint tiers do. Absent reads 0.
- `bands` (magic bar only) is 1 (default, plain) or 2 for the half magic upgrade's two stacked bands, each with its own sheen.

## packages/hud/src/types/hud-style/hud-style.type.ts

- Every CSS grade decoration a node's box may carry (phase 4 of the HUD data binding plan). Every numeric field is a `Value`, so a border width or a shadow blur reads from the data scope like `size` or `opacity`. Colour fields are `Paint`.
- An outline is not a border. A border traces the box; `outline` traces the ink of whatever the node draws, a ring around a transparent sprite's silhouette, which a CSS border cannot do because it does not know where the alpha is. It is drawn as stacked filters and its width is capped (see the renderer).
- `guide` is not part of the style: it lives on `HudContainerBase` (section 57) because it is editor only metadata about a container's overlay colour that the game never draws.
- `HudBorder.sides` absent means every side.
- `HudRadius` is one value for all four corners, or one per corner in the CSS `border-radius` order: top left, top right, bottom right, bottom left.
- `HudTint.mode` defaults to `multiply`. `amount` is 0 to 1, how much of the tint lands, default 1.
- `HudBoxStyle.clip` defaults to false and clips the node's children to its box.

## packages/hud/src/types/hud-text/hud-text.type.ts

- `text` is a string or a number, drawn in the game's extracted glyph sprites or a real font. A counter is this with a numeric `value`; the toolbar's Counter button inserts one already set to digits and zero padding.
- Two faces. `sprite` draws the HUD's extracted glyph sets (`fonts` sprite category), pixel exact and limited to the characters the game has. `font` draws a real face: the bundled pixel recreation (`game`, `--font-game` in `game-font.css`) or the app's UI sans or mono. There is no library of other fonts.
- `format` is meaningful only when `value` resolves to a number; a bare string value ignores it.
- Sprite sets: `hud-digits` is the HUD's own digits (`font-digit-N`, no letters), `pause-letters` is the pause menu's alphanumeric set (letters, digits, space, `&`). Never both, because they are two different extracted sheets.
- The `game` family (ALttP Dialogue) is a pixel face that only looks right at a whole multiple of its 16px design size (`--game-cell-h` in `game-text.css`), so the renderer snaps `size` for it (see `packages/hud/src/engine/resolve-text`).
- The `.game-text` rule (white fill, blue edge, shadow ring) is the default when a `game` font face carries no `stroke`.
- `tracking` is extra letter spacing in SNES px. The sprite face ignores it, since fixed width tiles have no tracking to add.

## packages/hud/src/types/hud-value/hud-value.type.ts

- `Value` is what every bindable number in the HUD document becomes: a plain literal (the common case, a bare number in JSON), or an expression read from the live variable table (`packages/hud/src/data/variables`) through `packages/hud/src/data/resolve-value/resolve-value.ts`. The property panel writes the expression form the moment a variable or formula is picked.
- `Paint` is a fill: a flat colour, a gradient, or a tiled or stretched image. The styling phase (hud-style) is its only consumer. Both types are pure data shapes; nothing here parses or resolves.
- A `GradientStop` is a position 0 to 1 and the colour at it.

<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/hud-layout-editing

Facts about `apps/desktop/src/hud-layout-editing/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/hud-layout-editing/action-keys/

A key press is looked up by the cap label the legend draws, such as `←`, `Del` or `Esc`.
Both manipulation components draw the same legend from the same kind of table, so both use this.
Because the pressed key becomes the cap label and is matched against the action rows, the shortcut always does what the legend says.
A row claims a press only when its caps are exactly that one key.
A cursor row that names four arrow caps claims none of them.

## apps/desktop/src/hud-layout-editing/align-options/

The alignment values each engine supports, one row of tiles per axis.
A 3x3 pad could not show distribution: nine cells cross two positions, so `between` and `stretch` had no cell.
One row per axis has room for six values and a diagram large enough to read.
Only values the engine supports get a tile.
A grid's `justifyItems` and `alignItems` take start, center, end and stretch, because a grid cell is a real box.
A flex `justify` on the main axis takes start, center, end, between, around and evenly; the last two live in `place-flow.ts`.
A flex `align` on the cross axis takes start, center and end, with no stretch, because the flow engine never stretches and reads a stray `stretch` as `start`.
Rows are named by what they move.
A grid's axes are fixed and drawn as `↔` and `↕`.
A flex container's rows are `main` and `cross`, and the diagrams turn with `direction`.
`CSS_POSITION` is what each tile's own CSS is set to, so the diagram is the value.
`stretch` falls back to `flex-start`, and the bars grow instead.
`justify` runs along `direction` and `align` crosses it, so a row aligns down and a column aligns across.

## apps/desktop/src/hud-layout-editing/appearance-summary/

What a collapsed group says about itself; the part of `SubsectionGroup` that is not a component.
A closed group must still state its value, such as `2px solid #c8a84e`, or the author has to open every group to find the active one.
Summaries are one line at 188px, so they are terse.
A border reads as width and style, and its colour is the swatch beside it.
A formula reads as a formula, such as `= gap_base`, because `value-text` owns that spelling.
`swatchOf` paints a flat colour as is, draws a gradient, and reduces an image to a hatch.
`paintText` gives the hex itself for a flat colour, since for a background or tint the colour is the whole value.
A shadow summary uses the CSS shorthand order, so it matches the rendered shadow.
`spread` appears only when it is not zero.
The list summary shows the count so it is readable with every card shut.

## apps/desktop/src/hud-layout-editing/bound-values/

Every data bound `Value` on one node, in one place.
It is the reason the Data section exists, and it feeds the bound count badge on every other section's collapsed header.
It walks the whole node object and finds a bound value by its shape, `{ from: 'data', expr }`.
A new bindable field is found the moment it exists, with no second list to update.
It does not descend into a nested node (`child`, `node`, `otherwise`, `children`), because each is a different node with its own Data section.
A path is classed by its first segment, since each section's fields share one: `style.*` is Appearance and `element.*` is Content.
The counts per section drive the small `● n` badge.

## apps/desktop/src/hud-layout-editing/case-match/

Which case of a `switch` is winning for the data the stage previews.
In a `switch` the order is the logic, and the reader cannot see it run, so this answers it next to the list of cases.
It uses the engine's own reading: `gateTruthy` from `packages/hud/src/engine/motion` is the rule `packages/hud/src/engine/expand.ts` picks a winner with.
A `when` that does not compile resolves to 0 and does not match, as in expansion.
`OTHERWISE` (`-1`) stands for the fallback branch.
Inside a repeat there is no single answer, so the report is a count of instances each case wins, such as `matches 6 of 20`.
`matches now` is kept for a single scope.
An empty scope list means nothing is known, such as no provider or a repeat of 0, and nothing is marked.

## apps/desktop/src/hud-layout-editing/check-expr.ts

Says whether an expression can be written as it stands, and what the author needs to hear if not.
The field, the menu and the error line share this one entry point, so they never disagree.
It restates the name rule of `validate-value.ts` on purpose, because that file formats its findings for a file report.
The suites in `apps/desktop/tests/hud/hud-inspector-value-input` check that the two agree over a table of expressions.
`extraNames` carries `delta`, which is valid only in `transition.when`.
`reads` is empty while the formula does not compile, because a half parsed name list is a guess.

## apps/desktop/src/hud-layout-editing/drop-ghost/

What the drag ghost says: three lines in a fixed order, computed from one intent and nothing else.
Line 1 states what kind of container the node is dropping into, which the maintainer asked for.
The rest is needed because a gesture that can work three levels deeper than expected owes a readout of the level it chose.
The kind, not the name, leads, because the boxes on screen do not show which engine will place the node.
It speaks only the layout vocabulary: `row`, `column`, `grid 3×2`, `overlap`, `screen`. There is no `stack`.
`overlap` is a UI word and never a document kind.
It is a grid whose children all name one cell, found by shape with `isOverlay`, the same predicate `packages/hud/src/layouts/validate-motion-warnings` reads.
It needs two children, because `isOverlay` is trivially true of a grid with one placed child, and a 3x2 grid holding one node is still a grid.
The grid size uses the same two functions the engine sizes tracks with, so the card matches the layout.
A refused drop names both nodes, and the whole card turns colour so the state reads in peripheral vision.
`refusalText` gives a sentence the author can act on.
It is a pure function of the document and one intent, so every sentence on the card can be tested.
The path runs from the root to the target, so a refused drop shows how far out to move.
The repeat warning says the target draws N times, so the dropped node will too.
In `position 2 of 3` the count leaves out the node when it already sits in that parent, which is the index rule `moveNode` uses.
`with` separates an empty cell from a co placed one, which is how an overlay is authored.
The nudge state was removed along with the stage's drop surface.
`announcementFor` flattens the card into the sentence the outline's `aria-live` region reads.
It takes the model, not the intent, so it cannot drift from the card.
A refusal reads `can't move X.` plus the reason, which already names both nodes.
The card sits below and right of the cursor; anything closer than about 10px covers the line it describes.
It flips to the other side within 150px of the viewport edge, the same reflex `usePickerPopover` has.
The flip is a translation, so the card never needs a layout pass, which would make it lag the cursor by a frame.

## apps/desktop/src/hud-layout-editing/drop-intent/

What a drop would do, never how the pointer said it.
The outline speaks in rows and zones and the keyboard in directions; both produce a `DropIntent`, and one function consumes it.
The `grid` intent no longer has a producer since the stage stopped being a drop surface, but `applyDrop` still writes it.
Its `move-all.ts` is the only file that makes the move write.
A grid drop is two edits, `moveNode` and `patchNode`, applied as one entry.
`hud-drop-intent.keep.test.ts` checks that no other editor file calls `moveNode`; the one exception it allows is `move-all.ts`.
Validity is checked after the target is chosen and never retargets, so every refusal names both nodes.
`ids` is an array from the start and takes one entry; a multi drop keeps document order and lands contiguously.
The outline can insert at the front of a container.
The screen's child order is the paint order, so putting a backdrop behind everything is a front insertion.
The middle band of a row splits at its midline into `inside-start` and `inside-end`.
A leaf has no inside, so its middle counts as `after`; the screen has no siblings, so its whole row is its interior.
The refusal reasons are: `self`, `descendant`, `not-a-container`, `source-locked` (screen root, repeat child or switch case), `target-locked` (a repeat or switch element), `grid-column` (past the last declared column; rows grow, columns do not) and `budget` (past `MAX_EXPANDED_NODES`).
The screen, a repeat's child and a switch's case have no parent array to splice from.
A repeat or switch element can be dragged but never dropped into, because its child is set in Content.
The budget is measured on the document the drop would produce.
Re measuring every frame is cheap: a pure walk over a few hundred nodes.
A `place` that no longer means anything is deleted on a reparenting drop; a node that only moved inside its own parent keeps its cell.
Entering a container without a cell writes no `place`, so it flows in document order.
The refusal text names nodes by id, because `labelOf` gives the kind and would read `row is already inside row`.

## apps/desktop/src/hud-layout-editing/easing-curves/

The easings an author may pick, derived from the engine.
`packages/hud/src/engine/motion-easing` decides what a curve does and `packages/hud/src/layouts/validate-motion` decides what a document may hold; this offers their overlap: five named curves plus `steps(n)`.
Each thumbnail is drawn by sampling `easingFn`, so it cannot drift from the curve it names.
`NAMED_EASINGS` lists no curve, then the one sided curves, then both, the same list the validator accepts.
`CURVE_BOX` is square, so a linear curve reads as 45 degrees.
`CURVE_SAMPLES` is enough for flat step tops and smooth curves at 16px, and short enough for a DOM attribute.
`steps(0)` cannot be produced here: the validator refuses it and `parseSteps` reads it as null, so `stepsName` clamps `n` to 1 or more.
A non finite or fractional `n`, such as a half typed spinner, falls back to the default.
`stepsCountOf` uses the engine's reading, so picker and sampler agree on what a steps curve is.
The path flips y, because SVG y grows down and an easing's output grows up.
An unknown name draws as linear, as it does at render time.
`easingLabel` shows `default` when the field is unset and the animation's own easing applies.

## apps/desktop/src/hud-layout-editing/editor-step/

The editor's step, carried to every number in the panel.
`ValueInput` has taken a `step` for a long time, so a context lets the step reach about 25 fields without threading it through.
`ValueField` uses it as a default; a field that passes its own `step` still wins, so `opacity` steps by 0.05.
The default is 1, so a field rendered outside the provider, such as a measurement rig, steps by one.
The View is the only provider, and the only reader of `hud-editor-view-store`.

## apps/desktop/src/hud-layout-editing/expr-errors/

Parse errors from expr-eval, turned into sentences an author can act on.
Every message matched here was probed against the shipped parser, with assignment, function definitions, `in`, arrays and concatenation turned off.
Seven shapes are translated; anything else passes the parser's own words through.
`x in y` and `life_current 8` both report `Expected EOF`, so the source is read to tell them apart.
`in` is disabled on purpose, and the message says so.
A `fix` is a whole replacement expression, so a one click correction cannot half apply.
`column` is 1 based, from the parser's `[1:n]`.
A missing operator between two values is nearly always multiplication, so the fix offers `*`.
An unclosed paren names its call, such as `ceil(`, because that helps in a formula with several parens.
`raw` is the parser's message as `compileExpr` returns it, never the file report wrapper from `validate-value.ts`.
An unknown name is the one error that is not the parser's.

## apps/desktop/src/hud-layout-editing/extent-text.ts

What the middle of the box model reads: the authored size, not the resolved rectangle.
The panel does not have the placed rectangle, the stage does, and a number labelled resolved that was not would be worse than none.

## apps/desktop/src/hud-layout-editing/flex-slots/

Where a flex container's children landed; it is to the flex editor what `grid-solve` is to the lattice.
The strip draws the stage's own placement, read from `usePlacedLayout`, so a panel cell has the shape of the cell on the stage.
A flex container has no lattice to solve, so where its children were placed is the arrangement.
It is a context, not a prop, because it is a fact about the preview, not about the selected node.
A prop would pass through `NodeInspector`, `LayoutSection` and `FlexEditor` without being read.
An empty list means the container is not on the stage right now, such as a repeat template or a test mount.
The strip then falls back to equal shares.
A repeat's copies share one authored id, so matching on it takes the first instance, as `grid-solve-lookup.ts` does.
A slot's size is in game pixels and unit free, so the strip may draw it at any size.
`useFlexSlots` never returns null, so no caller has to branch.

## apps/desktop/src/hud-layout-editing/formula-catalog/

What the formula menu offers.
A name that exists only in some places is listed, disabled, with its reason.
Leaving `index` out silently looks broken, and offering it outside a repeat makes a formula that resolves to 0 at runtime with no warning.
`and`, `or` and `not` are the logical operators.
`&&` is a parse error, and `||` used to concatenate into a silent wrong number, so neither spelling appears in any group.
The maths functions are the parser's real set after assignment, function definitions, arrays, `in` and concatenation are turned off.
Trigonometry is left out because a HUD is axis aligned.
The list functions (`length`, `join`, `map`, `filter`, `fold`, `indexOf`, `fac`, `gamma`) are left out because each fails at evaluation time.
`random()` is refused by `compile-expr.ts`.
Groups show what the field can read first, then what it can do with it.

## apps/desktop/src/hud-layout-editing/formula-scope/

A formula inside a `repeat` produces `count` values, not one.
`InstanceStrip` needs the whole set, so it needs the enclosing repeat's count and `item`.
It is carried as a context because `insideRepeat` is already threaded through about thirty call sites as a boolean.
The inspector answers once at the root of the panel, and the field reads it where needed.
The default is nothing known, not outside a repeat.
A field outside the provider still says it is in a repeat when its own prop says so; it just cannot draw the strip.
The count is floored and never negative, matching the clamp in `packages/hud/src/engine/expand.ts`; the strip caps its own drawing separately.

## apps/desktop/src/hud-layout-editing/formula-starters/

The corpus is ten formulas: across the three built in layouts and six presets there are 44 bound expressions and 10 distinct ones.
24 of them are a bare variable name and the rest are four shapes.
They are offered as sentences, with the formula as the subtitle, so each is readable before it is chosen.
The fraction pairs are generated from the `<thing>_current` and `<thing>_max` convention in `packages/hud/src/data/variables`, so a new resource gets its fraction for free.
`select` is the part left selected after inserting, so the next keystroke replaces what the author still has to decide.
`CONTAINER_SIZE` is 8 because one heart is eight eighths, so a capacity of 160 is 20 containers.
A `count` is never offered a comparison and a `when` is never offered a fraction, which is why starters beat a flat palette.

## apps/desktop/src/hud-layout-editing/glyph-art/

Which picture a glyph position draws, resolved like the live HUD: this pack, then its fallback, then generic.
It moved out of `GlyphPickerGrid` so `ReferenceField` and `SlotRefField` can show the artwork at rest.
The D pad cross is one picture for every pack, because DPAD is not a real SDL position.
A null pack means Auto, which is whatever generic draws.
`undefined` is a real answer for a position nothing draws, and `Thumbnail` shows its placeholder.

## apps/desktop/src/hud-layout-editing/grid-solve-lookup.ts

The lookup behind `GridSolveContext`: every grid on the stage, solved once, keyed by container id.
`solveGrid` gets the container's real placed rectangle and the same `MeasureContext` that `StageGridEcho` and `ContainerOverlay` read, so panel and stage cells match by construction.
The solve's unit is the container's own placed scale, so a grid inside a scaled subtree solves against the area it has; the compact layout runs at 0.75.
Track sizes come back in authored pixels, so the panel can draw them as `fr` weights and the stage at the display scale.
A repeat's copies share one id, and the first one is taken.

## apps/desktop/src/hud-layout-editing/grid-solve/

The panel's lattice and the stage read one solve.
An `auto` track's size is its widest child and a `fill` track's is what was left, so only `solveGrid` against a real box can answer.
The View solves once for every grid and hands the answer down as a context.
A prop would pass through `NodeInspector`, `LayoutSection`, `GridTemplateEditor` and `GridEditor` without being read.
`null` means the grid is not on the stage right now, and the lattice falls back to equal shares.
Solved sizes are in game pixels, so the panel can draw them at any scale.
`useGridSolve` never returns null.

## apps/desktop/src/hud-layout-editing/index-selection/

Picking items out of a strip; the grid's track headers and the flex editor's child cells share this rule.
A plain press picks one, `Shift` takes the run from the anchor, the primary modifier toggles one in or out, and an empty set is no selection.
`isPrimaryModifier` is the only modifier test, so `Cmd` works on a Mac and the legend's cap, from `primaryModifierLabel`, matches.
It writes nothing: selection is context for a toolbar and an echo, never an edit.
Modifiers are taken as a plain shape so a test can press a key without a DOM.
`held` is the current run only when the press lands on the same strip; a `Shift` across strips has no anchor, so the caller decides.
`null` means nothing is selected, because the modifier removed the last member.

## apps/desktop/src/hud-layout-editing/insert-site.ts

Where an insert lands.
With a container selected it goes into that container.
With an element selected it goes beside it, in its parent, right after it.
With nothing selected it goes into the screen, so the toolbar is never inert.

## apps/desktop/src/hud-layout-editing/keyframe-track/

The arithmetic behind `KeyframeTrack`, kept out of the component so its two rules can be tested without a browser.
Keys cannot cross: `sampleKeyframes` sorts by `at` on every sample, so a swap would make the dragged diamond edit a different point.
A drag is clamped against its neighbours in track order, at least `MIN_GAP` apart, since a zero width span cannot be authored on purpose.
A crowded track collapses to the upper bound and does not jump past it.
Adding a key samples the curve where it lands, so the shape is unchanged until the value row is touched.
A click within `MIN_GAP` of an existing key selects it instead of stacking a second key.
`at` is rounded to 2 decimals, because a pointer on a 200px rail resolves finer and long floats in a saved document are noise.
Track order relies on a stable sort, which `Array.prototype.sort` has been since ES2019.
`moveKey` keeps the authored order, because the selected index points into that list.
An unmeasured rail reads as 0, not `NaN`, so nothing bad reaches the document.
A key can be removed only while more than two remain, the validator's minimum, so the button and the handler agree.

## apps/desktop/src/hud-layout-editing/layout-sides/

The one place the two engines are translated into the shapes the sections take, so no section branches on the engine.
Both engines store `gap: { x, y }`, so `gapCellsOf` gives the same two cells for both, and pressing Type leaves section one's shape alone.
`x` is horizontal and `y` vertical whichever way children flow, so `↔` and `↕` mean the same thing everywhere.
The cap is what the field shows in its row; the label is what a screen reader says.
Alignment is the one thing still per engine.
A grid places items in cells on two fixed axes (`justifyItems`, `alignItems`, both `stretch` by default in `packages/hud/src/engine/place-grid`).
A flex container distributes along its flow (`justify`, six values) and positions across it (`align`, three values).
Flex rows are named `main` and `cross`, and `main` points wherever `direction` points.

## apps/desktop/src/hud-layout-editing/motion-preview/

The editor's own transport (scrub, play, pause) for the stage's motion clock, so an author sees a heart pulse without reasoning about keyframes.
It overrides a clock and does not add one.
`HudNodeRenderer` already runs `useMotionClock` for any surface with an animation, so this hook produces one number, `nowMs`, that the stage passes in place of its free running clock.
`null` means do not override, and the stage runs as it always has.
It is a context because the View creates the transport and one control four levels down reads it.
Reduced motion disables it.
Under `prefers-reduced-motion: reduce` every animation is silenced at the source, in the first branch of `resolveNodeAnimationStyle`, so a play button would move nothing.
Transitions and enter and exit keep running under reduced motion, as in the game, and none of them are driven from here.
`DEFAULT_SPAN_MS` is one pass of a 1000ms animation, longer than every duration in the shipped documents.
The scrub is in milliseconds, not cycles, because `delay` puts two animations on one node at different points.
Scrubbing pauses first, since scrubbing while playing would fight over the same number.
The state hook is called once, by the View, and its animation frame loop runs only while playing.
The clock wraps at the span, so play repeats one cycle and the scrub head stays meaningful.
`useMotionPreview` returns null outside a provider, such as a test fixture with no stage.

## apps/desktop/src/hud-layout-editing/new-node/

Everything the toolbar can insert, built here and nowhere else.
Each factory makes a node that is valid on its own: a fresh id and the minimum a validator accepts.
Nothing sets a size, margin or scale; a new element takes its intrinsic size and its place in the flow.
The label is the outline's, not the document's, so renaming a kind never touches a saved file.
Ids are short and stable because they show in the outline.
A new grid has two `auto` tracks each way, because a 1x1 grid draws nothing recognisable in the template editor's miniature.
A grid was not insertable until phase 7 of `plans/hud-inspector-ux-review.html`; before that the only path was switching a flex container's engine.
An overlay is a one cell grid whose children all name that cell, which is what `direction: 'stack'` became.
Children dropped into it still need their cell, which `GridEditor` writes.
A placeholder child is the minimum a `repeat` or `switch` branch needs; the outline is where it is replaced.
A new countdown has no `variant`, so it follows the profile's own pie until Content pins one.
`labelOf` shows a container's direction and an element's kind, with the number or button that tells it apart.
`slotsOf` lists every slot number a node names; it flags an out of range slot in the outline, and the stage selection uses it.

## apps/desktop/src/hud-layout-editing/node-art/

What a reference to another node shows: its picture where the editor owns one, a human name, and its kind.
A switch case and a repeat's child are references to whole subtrees, and used to print an id the author never chose.
The editor owns artwork for `sprite`, `glyph` and a `button`'s idle face, so those draw it; every other kind gets a one character stand in and its name.
The id is not dropped, it is demoted: `ReferenceField` shows the kind as the dim half of the label.
`src` is `undefined` when a kind has no artwork, and `placeholder` is what `Thumbnail` draws instead of a broken image.
Each placeholder is a stand in with a shape, never `?`.

## apps/desktop/src/hud-layout-editing/node-edits.type.ts

Editing the tree, as pure functions over a whole document.
Each operation returns a new layout and mutates nothing, so the draft can be a memento: one value to compare against and one to reset to.
The outline's drag, the toolbar's insert and the inspector's edit all use these functions.
There is one tree and one root; the nine anchored regions became ordinary children of the screen.
The screen is the only node with no parent and the only one `moveNode` refuses.
A move is a remove then an insert, with the index resolved after the removal; the other order lands one place short when a node moves down among its siblings.
A repeat's `child` and a switch's case and `otherwise` nodes are reachable too, and their `parent` is null.
They can be selected and patched but never moved or dropped into by the outline.
Removing a case node removes the whole case, since a case with no face means nothing.
Removing a repeat's only child is refused, because a repeat needs one.
Both fold back to the original through `mapTree` instead of producing an invalid document.
A switch never drops to zero cases; it falls back to the original list.
The walk is depth first, parents before children, which is document order; the screen is always the first row.
The screen cannot be deleted: a map that drops it, or returns something that is not a container, keeps the original.
`patchNode` shallow merges a patch; a key set to `undefined` is removed, which is how a box property is cleared.
`insertNode` appends when `at` is not given.
`moveNode` refuses the screen, a target that is not a container, and a target inside the moved node, returning the document untouched.

## apps/desktop/src/hud-layout-editing/offset/

A node's position is its `margin.left` and `margin.top`, and this is the only place that says so.
The model has no `offset` property on purpose; a displacement already is a margin, which is how the button cluster's radial offsets are authored.
A second property would give every node two ways to move and a merge rule to explain.
`OffsetField` is the only writer left since the stage drag was removed.
A test forbids a hand written `margin.left =` anywhere else in the editor, so a second writer cannot appear unnoticed.
Zero is absent: an offset of 0 means wherever the parent put it, so committing it deletes the key.
`EdgesInput` follows the same rule, so a box that was only looked at does not grow four margins.
An edge set with nothing left in it becomes `undefined`, so a node moved back leaves the document as it was.

## apps/desktop/src/hud-layout-editing/outline-rows.ts

Flattens the tree into outline rows; a collapsed row's descendants are not walked, so this is also the filter.
A row has a subtree when it is a container with children, a repeat, or a switch.
A direct child of the screen carries a badge naming its cell in the screen's grid; a child with no `place` flows automatically and has no single cell.
A repeat's child and a switch's cases are locked rows: selectable and editable, but not draggable, since they sit in no container's `children` array.

## apps/desktop/src/hud-layout-editing/repeat-move.ts

Re-emits the pointer's last position so the gesture re-resolves while the pointer is still.
Auto scroll needs it: rows slide under a still cursor, and a hit test that only runs on `pointermove` keeps naming the old row.

## apps/desktop/src/hud-layout-editing/row-under.ts

The row under the pointer, looked up, not received: pointer capture makes every move report on the source row, which is also what lets the drag survive leaving the rail.
A locked row is not a target.

## apps/desktop/src/hud-layout-editing/sample-state.type.ts

A plausible save to arrange a HUD against when no game is running.
The editor is reached from settings, where the game is least likely to be up, and an empty save would draw no hearts and no chips.
So the elements get something to draw: a hurt life bar wide enough to wrap, half a magic meter, two and three digit counts, a four figure rupee count, and a pad with six controls, four holding something.
The UI labels this as sample data, and it is never written anywhere.
Health is in eighths of a heart: 14 of 20 containers. Magic runs from 0 to 128.
The countdown is always caught part way, 18 of the digging game's 30 seconds, because a real one runs for 30 seconds at most and would rarely show.
Almost every item is owned, because placeholders get a random item and a silhouette says nothing about density.
Two inventory cells stay empty on purpose, so the dimmed state shows somewhere.
Eight sample slots draw the face group and the D pad; eight is the widest the two crosses get side by side, not a ceiling.
The sample binds none of them, because the preview is about size, not about what fires.
Item ids are the core's new style hud item ids.
The item pool holds ids whose art is distinct enough that a row reads as different things.
Every slot gets an item so density can be judged, as the maintainer asked.
The choice is fixed per slot number, not random, so a placeholder does not change on every keystroke and two people see the same picture.
The second and fourth slots always hold the sword and the contextual action, because a layout must be judged with both and neither wears an item sprite.
It never touches the player's own assignments.

`live` is false when nothing is running and the values are made up.
`filledSlots` lists slot numbers that fire something, for the layout pass's dim rule.
`hearts` counts heart containers; the life block grows a row per ten.
`dataScope` is what every bound value, repeat and switch in the preview reads, built from the same vitals.
An empty `slots` argument falls back to a plausible eight.

## apps/desktop/src/hud-layout-editing/scaled-rect.ts

The one display scale conversion both stage drawings share.

## apps/desktop/src/hud-layout-editing/selection-bands.type.ts

One action table shape for every manipulation component. The grid editor invented it and the flex editor needs the same, so it lives here instead of being copied.
The toolbar, legend and keyboard all read one table, so a legend cannot promise a shortcut no button runs.
`button` draws in the toolbar and `gesture` exists only in the legend. Both come from the same table per selection.
`EditorShortcut` is what the legend prints and the keyboard looks up: caps for the keys and an optional lit mouse. `{mod}` is replaced with `primaryModifierLabel(os)`, so a cap matches the key.
`icon` is a Lucide icon through `@iconify/react`, for `button` only.
Toolbar rows are grouped by separators; a change of `group` draws one.
`disabled` draws the action in place but inert: no `run`, no key, no legend row. A button that vanished let the next one slide under the cursor, so pressing "later" twice on the second to last child pressed "earlier" the second time.

## apps/desktop/src/hud-layout-editing/slot-scheme/

The slot list the preview is drawn for, reachable from a field.
A slot number is never validated against a device.
The scheme gives a preview: the field shows what a number currently draws, and a number past the list is still legal and previews as empty with a note.
It is a context because the scheme is a fact about the editor session, not the selected node.
The default is an empty list, which means nothing is previewed, not that no slots exist; consumers draw the number they were given either way.
`slotInScheme` only claims something about the preview, not the HUD.

## apps/desktop/src/hud-layout-editing/stage-cells.ts

A placed grid's cells in display pixels; the one door the stage's grid drawings use.
`gridCellRects(container, box, unit, ctx)` is easy to break: `box` and its result share one coordinate space, and `unit` is that space's pixels per authored pixel.
The stage drawings once passed the game pixel rect with the display scale as `unit`.
Fixed tracks looked right, but `fill` tracks stayed in game pixels, so the grid drew at `1 / displayScale` of its size: selecting all nine screen cells lit 72% of the stage at a 1.39 scale.
So the solve runs in game pixels at the container's own placed scale, then multiplies by the display scale, and a caller never sees either half.
`hud-stage-cells.keep.test.ts` checks that no other editor file calls `gridCellRects`.

## apps/desktop/src/hud-layout-editing/stage-slot-rects.ts

A flex container's slots: the box each child was placed in, so the space between them reads as a gap.
There is nothing to solve: a flex child either took part in the flow or left it (`collapsed` in `place-flow.ts`), so where children landed is the arrangement.
Placed ids are unique after `expand.ts` suffixes repeat copies with `#i`, so matching by id cannot pick up another instance.

## apps/desktop/src/hud-layout-editing/step-intent/

The keyboard producer: it turns a node and one of four directions into the same `DropIntent` the pointer makes.
Reparenting is the main structural edit in this editor, and it was pointer only until this existed.
It is not a hit test: the intent comes from the tree and goes through the same `applyDrop`, so the keyboard cannot reach a state the pointer could not, and a refusal reads the same sentence.
Up and down reorder; left and right promote and demote, as in every outline editor (Word's outline view, OmniOutliner, Blender's outliner, Markdown lists).
`null` and a refused intent differ.
`null` means there is nowhere to go, such as already first or last, and the row shakes, because the list already shows it.
A refused intent means there is a target and it is illegal, which is a sentence and is announced.
The screen, a repeat's child and a switch's case have no array to splice, so they have no step.
`out` moves into the grandparent, just after the old parent; `in` appends to the previous sibling when it is a container.
The menu rows follow the wireframe's order.
A dimmed item that names its precondition teaches the rule, so `Move out of hud` keeps the parent's name even when dead, and `Move into...` stays an ellipsis until there is a sibling to name.
`STEP_KEYS` is the one map the row handler and the menu's shortcut column read, so a hint never names a key that does something else.

## apps/desktop/src/hud-layout-editing/toolbar-menus/

Everything the toolbar's list style buttons can insert or start from.
Sprite and Glyph are picked by eye in `SpritePicker` and `GlyphPickerGrid`, and Slot has its own panel (`SlotPickerPanel`), so they are not built here.
What remains is a plain list: containers, the spacer, the dynamic objects, the subtree presets, and the start from layout list.
A new element kind needs a way in here or it cannot be inserted.
The four vitals (`life`, `magic`, `consumables`, `wallet`) no longer exist in `HudElementSpec`; hearts, the magic bar and the wallet are ordinary subtrees in the Preset menu now.
Every row carries an icon in the same column, so a menu reads as a column of pictures.
The icons are Lucide through `@iconify/react`, one stroke weight at 16px; Unicode characters drew in whatever font the OS picked.
Row and column take the icon that draws what they do: a flex row puts children side by side, which Lucide calls `columns`, and a column stacks them, which is `rows`.
Overlay is a grid preset, a 1x1 grid whose children share the cell, so the common case is one click.
The Grid entry made grids authorable from the toolbar; before it the only way was to insert a Row and switch its engine.
The dynamic objects each insert the minimum a validator accepts, ready for the inspector to tune; the countdown sits beside them because it draws live data and has nothing to pick by eye.
Each preset insert is a fresh copy from `instantiatePreset` with every id rekeyed, so nothing points back at the preset.
The start from list is the same list `PresetBar` shows.
`GLYPH_POSITIONS` is every position a pack is keyed by, plus the synthetic whole D pad cross.

## apps/desktop/src/hud-layout-editing/track-extents/

A grid's track list, as list edits.
They live outside the component because a track list is the one thing in this section a document can get structurally wrong (`columns` may never be empty), and the edits are testable without rendering.
`trackWeight` is a gauge, not geometry: the lattice takes its proportions from the engine's solve (`HudLayoutEditor/sub-components/GridLattice/behavior`), so this weight sizes nothing a pointer aims at.
`fill` draws wider than `auto`, and the measured modes scale off typed numbers: 16 game pixels and 25% both land on 1.
The four extent modes live here, because both `ExtentField` and the selected track's header (`TrackHead`) offer them.
A bare expression is `px` shorthand, as `packages/hud/src/types/hud-node` notes.
A bound extent has no literal to carry across a mode change, so it reads as 0; `ValueField` is where an expression gets a real editor.
A data bound track's chip shows `ƒx`, the same mark `ValueInput` uses for a formula.
A range edit applies to every track the header selection named, not just the anchor.
A new track lands after the one it was added from, where the strip's `+` sits.
A move out of range is refused, not clamped, so a button that should be disabled cannot swap without notice.

## apps/desktop/src/hud-layout-editing/transition-edits/

`node.transition` holds two unrelated ideas: value transitions (a bound number changed, ease toward it) and enter and exit.
Two subsections of Motion write that one field, so the merge lives here, owned by neither.
Unchecking the last property must not drop an enter, and clearing an exit must not drop the properties.
The object becomes `undefined` only when nothing is left: no properties, no enter, no exit.
Which properties something drives is an annotation, not a filter; every property is offered.
`position` counts as driven only inside a `repeat`, the one case where placement moves without a bound field naming it.
An explicit `undefined` in the patch means clear the key, so such keys are removed and no `"easing": undefined` reaches the saved JSON.
The six properties follow the order of `packages/hud/src/types/hud-motion`.

## apps/desktop/src/hud-layout-editing/tree-context/

Questions the inspector's sections ask about where the selected node sits, which `siteOf` alone cannot answer now that repeat and switch nodes are reachable.
`realParentOf` finds the real container a node's box is placed under, walking through repeat and switch ancestors as `packages/hud/src/layouts/validate-motion-warnings` does, since they draw no box of their own.
The Placement section's cell fields and the Layout section's engine both key off it.
`isInsideRepeat` says whether `index`, `count` and `item` are valid names for `validateValue`.
`enclosingRepeatOf` gives the nearest repeat's spec, so the editor knows how many values a formula produces and what each `item` reads, the same names `packages/hud/src/engine/expand.ts` uses.
`breadcrumbOf` gives root to node labels for Identity.
`ancestorIdsOf` gives the ids between the root and the node, which the outline must expand before it can scroll to a row selected on the stage.
`rootsOf` stays a function so every walk reads where the document starts from one place; it was a list while regions hung beside the screen.

## apps/desktop/src/hud-layout-editing/use-drag-autoscroll/

The outline's drag reaches past the fold with a ramped animation frame pan on its scroller.
Only the outline pans, because only it takes a drop; the stage column lost its drop surface, and a scroller that pans under a drag it can never accept moves for no reason.
Depth in the band is speed: `RATE` ramps linearly across `HOT`, because a constant rate either overshoots or crawls.
That is why the band is drawn (`.is-autoscroll`).
`HOT` is one outline row plus a margin: deep enough to enter on purpose, shallow enough that the last row can still take a drop.
`RATE` is pixels per frame at the very edge, and 0 at the inner lip.
`rateFor` is exported so a test can pin the ramp without a DOM.
It pans only while the pointer is inside the scroller's rect, so a drag that wandered off the rail does not drag the list along.
Each frame that moved the scroller re-emits the pointer's last position, so the target keeps resolving as rows slide under a still cursor.
It uses animation frames, never `setInterval`, so it runs on the same clock as the ghost.
The loop stops four independent ways: `active` going false (a drop or `Escape`), `pointerup`, `pointercancel` or `blur`, and the effect teardown.
Not scheduling the next frame is itself the stop, when the band was left or nothing is left to scroll.
Reduced motion halves the rate and never disables it, because disabling makes a target unreachable; the keyboard path is the real answer for anyone who cannot drag.
The setting is read once per drag, because `window.matchMedia` does not exist in every host.
`scrollerFor` walks up to the nearest ancestor that can scroll, because which element scrolls is a CSS decision; `.hud-outline__rows` was not a scroller at first.

## apps/desktop/src/hud-layout-editing/useDragGesture.ts

The outline's drop gesture, now its only caller since the stage nudge was removed.
It uses pointer events, not the HTML5 drag API.
That API's drag image is a snapshot taken once at `dragstart`, which fights the ghost card, and hiding it is a per platform hack.
`dragover` is coarse and throttled, and the zone arithmetic needs a real point every frame.
It keeps `useResize`'s discipline: pointer capture, a slop threshold, a preview on every move, and one commit on release.
The drag never touches the document: `resolve` is pure and `commit` runs once on `pointerup`.
So cancel is free, and the tree is not re solved under the pointer mid drag.
The old stage nudge wrote the document on every `pointermove`; one drag is now one edit, counted in `apps/desktop/tests/hud/hud-drag-gesture.keep.test.ts`.
Capture is taken at the threshold, not the press, so a wobbling click is still a click.
Once the gesture is real, the trailing `click` is swallowed in the capture phase, because a press and release on different rows still synthesise a click on their common ancestor.
`Escape` cancels the drag and nothing else; it sits at the `drag` level of the dismiss stack, above `popover`.
It registers only while a drag is live, so a press that never moved owns no key.
`SLOP` is 2: below it a press is a click that wobbled.

## apps/desktop/src/hud-layout-editing/useEditorSchemes.ts

The control scheme running right now, a quiet background fact and never a control set in this editor.
Slot numbers are never validated against a device, so this exists for two things only.
It sizes the preview's slot list realistically, so a pad layout previews with pad shaped content and a keyboard layout with keyboard shaped content.
It writes the scheme's half of the layout and scheme link on save, so a saved copy still points at a scheme that wears it.
The list comes from the profile's input profiles through the same migration every reader uses, so old slot lists show their real numbers.
Only schemes with a modern block are offered, because a classic profile has no slots.
The scheme in force is found in three steps, because none is always right.
The live settings come first, when a profile is loaded for play.
Then the profile's own recorded choice, which outranks the input manager, because the manager is seeded with the keyboard preset at boot.
The manager is used only when there is no stored choice.
A change is written to disk and to the running session; re-pushing the active profile rebuilds the bindings, and both the HUD layout store and the control scheme store follow them, so the game sees it at once.

## apps/desktop/src/hud-layout-editing/useGlyphPacks.ts

Every glyph pack the editor can offer, and the operations on the player's own packs.
Custom packs are loaded with the shipped ones and passed to the glyph chain as one list, so a custom pack is consulted first and falls through to the pack it names and then the device family.
Images are primed into the object URL cache as soon as packs are read, because rendering needs that lookup to be synchronous.
`version` bumps whenever an image is added or removed, because a re-import keeps the same file key and the pack object alone cannot say so.
`packs` lists shipped packs first, then the player's own, as one stable array so the preview's memo holds.

## apps/desktop/src/hud-layout-editing/useHudLayoutEditor.ts

The editor view's data: the draft, edits, glyph packs, schemes, sample state and the placed layout.
The open layout is captured once, so a save that forks does not reopen the editor on the layout it just left.
A save points the edited scheme at what was saved, because a fork nothing wears would be a copy made for no reason.
One solve feeds both the panel's lattice and the stage's overlay and echo, so a panel cell has the stage cell's shape.
One placement feeds the flex strip, so each cell is drawn at the size its child was given.
Deleting the selected glyph pack falls back to Auto, because a deleted pack left selected would silently fall through to the device family.
The whole document's validator blocks Save: any invalid expression makes `errors` non empty, and `warnings` are the reflow notes from `packages/hud/src/layouts/validate-motion-warnings`, shown on the node's Motion section.

## apps/desktop/src/hud-layout-editing/useLayoutDraft.ts

The working layout, kept as a memento.
The editor copies the layout in force when it opens (`origin`, never written), edits `draft`, and only Save reaches storage and the layout store.
Closing the editor leaves the HUD as it was, and Reset returns to the memento without an undo log.
`dirty` is a comparison against the memento, not a flag, so an edit that restores the original reports nothing to save.
A built in layout is a file in the repository, so saving one always forks it; "Save as..." makes that explicit.
`apply` takes a pure transform over the whole layout and is the only way anything changes the draft.
The toolbar's insert, the outline's drag and the inspector's fields all arrive through it.
Start from keeps the draft's own identity when it has one, so it restyles the open layout instead of switching layouts.
The start from list holds the shipped layouts, then the custom ones.

## apps/desktop/src/hud-layout-editing/useNodeEdits.ts

Selection, and the things that can be done to the selected node.
The selection is an id, not a node, because every edit rebuilds the tree and a held node would be stale one keystroke later.
`drop` is the one door both surfaces' `DropIntent` comes through; `apps/desktop/src/hud-layout-editing/drop-intent/move-all.ts` is the only module that calls `moveNode`, and a test checks it.
The newly inserted node becomes the selection, because the next step is usually to size or move it.

## apps/desktop/src/hud-layout-editing/useOutlineKeys.ts

The outline's keyboard path: four shortcuts on a focused row, and the sentence they announce.
The modifier is `isPrimaryModifier`, not literal `Ctrl`: `metaKey` alone on macOS and iOS, `ctrlKey` alone elsewhere, either where the host cannot say.
The keys were checked to be free: the global map binds Alt+Enter, Ctrl+Shift+D, the primary modifier with K and `Escape` (the shell's global shortcut map); the search palette owns bare arrows and Enter only while focused; `KeyRail` owns bare Left and Right on a keyframe.
Shift and Alt are excluded so a Ctrl+Shift+Arrow text selection is never swallowed.
It is bound on the row, not on `document`, so there is no second global listener to order.
One `aria-live` region, written only here, reads `announcementFor`, the ghost's lines flattened, so the announcement and the card share their phrasing.
Nowhere to go is not a refusal: the row shakes 2px for `SHAKE_MS`, long enough to see and short enough that a held key still repeats.

## apps/desktop/src/hud-layout-editing/useOutlineScroll.ts

Scrolls the outline to the selected row only when the selection came from outside the outline.
`onSelect` is shared by the stage, the inspector and the outline's rows, so the origin is found by comparing with the last id the outline's own rows selected (`markSelf`).
Scrolling the list under the cursor right after a click in it is the jumpiness this avoids.
Collapsed ancestors are expanded whatever the origin, because a hidden row must exist before it can be scrolled to.
`lastHandled` is separate from `lastSelf`, so an unrelated re-render cannot scroll again for an unchanged selection.
The scroll waits one frame for the expanded row to exist.

## apps/desktop/src/hud-layout-editing/usePanelResize.ts

The outline and inspector rails' resize wiring, kept out of the editor's view.
Width comes from the view store, `useResize` drives the drag, and `onPreview` writes each rail's inline style so state only changes on release.
The inspector's handle is on its own left edge, so `invert` flips the delta.

## apps/desktop/src/hud-layout-editing/useSampleState.ts

What the editor's preview draws against.
The vitals prefer the running game, and the slots never do.
The vitals decide size, so a player who alt tabs out of a save arranges against their own numbers; with nothing running, a plausible save exercises the same size questions.
The countdown is always sample, drawn in the profile's own pie, so a countdown node is always visible on the stage.
The slots are always sample, with an item dealt to every placeholder, because a live save with two things assigned says nothing about density.
The slot list comes from the scheme being edited for, not the device in hand, so a pad layout draws pad glyphs and a keyboard layout draws key caps.
The content has the same shape the live HUD passes the renderer, built by the same `buildSlotContent`, so the preview cannot disagree with the game.
A save with no heart containers has never been loaded, which is the whole liveness test.
Bow tier 3 and up is the silver art, as the live HUD reads it, and health is stored in eighths of a heart.

## apps/desktop/src/hud-layout-editing/useSpringLoad.ts

Hovering a collapsed row during a drag opens it after 500ms, like Finder and Explorer, at the low end of their 500 to 600ms range.
Collapse state is `collapsedNodeIds` in the view store, because folding a row is a fact about how someone is looking at the tree.
It is for aiming past a row, not reaching it: a collapsed row is already a target (`inside` appends), and spring load reaches its descendants.
A spring opened row closes again on drop unless the drop landed in it or below it.
A drag should not leave the view changed, but closing the row that just received the node would read as a failed drop.
A cancel closes every sprung row, since nothing landed.
The timer resets on leaving the row, and `pending` drives the caret's wait, the only animation in the design.

## apps/desktop/src/hud-layout-editing/useTextValue.ts

The draft and commit half of `TextValueField`, applying `useValueInput`'s rules to a string.
There is no mode switch: one field, one string, and a leading `=` is the only thing that means formula.
The old `text | ƒx` switch destroyed the formula on a round trip.
A literal commits on change, so the stage follows typing; a formula commits on blur or Enter, so a half typed one never reaches the document.
Escape abandons the draft and marks the key handled.
A blur with nothing uncommitted writes nothing, so a click that changed nothing does not mark the draft dirty.
The `=` chip appears on focus and does what typing `=` does, keeping the text already there.
`dirty` is an edit that has not reached the document, which is why a result is withheld.

## apps/desktop/src/hud-layout-editing/value-text/

The one rule that replaced the `123 | ƒx` switch: what a person types, and what the document keeps.
The leading `=` is the only thing that marks a formula, and it is never stored.
Text with no `=` that parses as a finite numeral is a number; text with a leading `=` is always `{ from: 'data', expr }`, even when a bare numeral follows.
So `=24` and `24` are both legal and both round trip.
`compile-expr` never sees the `=`, and every shipped layout reads back as, for example, `= ceil(life_max / 8)`.
`==` escapes one literal `=`, as in a spreadsheet; it matters only on a text field.
The stepper is a predicate, not a mode: the arrows, spinner and wheel work while the current text is a bare numeral, checked on every keystroke.
`NUMERAL` is stricter than `Number()`: an empty string, a space, `Infinity` and `0x10` are not numerals, or clearing a field would commit a number.
A stored expression is always shown with its marker back on.
`undefined` is the empty field, for optional properties such as a min or max limit.
An unparseable literal on a numeric field is an error the caller reports, not a value it stores.
A `text` element's `value` is the one property that is `Value | string`, and the one place the `==` escape is used.
`TextContent` once had an outer `text | ƒx` switch that threw the expression away; there is no switch now, so nothing is lost.
A stored string that starts with `=` is shown escaped, so what reads back is what was stored.
A text value never fails to parse: anything not a formula and not a numeral is a string.
A bare numeral stays a number, because `format.digits` and `format.pad` only apply to numbers (`packages/hud/src/types/hud-text`).
Typing `=` before `24` keeps the digits as the start of the formula, and deleting the `=` leaves text the field reads back as a numeral if it can.

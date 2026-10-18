<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/HudLayoutEditor

Facts about `apps/desktop/src/views/HudLayoutEditor/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/HudLayoutEditor/HudLayoutEditor.constants.ts

The editor's static choices.
`SNES_LINES` is the console's line count; every ratio keeps that height and changes only the width, because the HUD is authored in SNES pixels.
The ratios are the displays a layout must survive: 16:9 is the tightest a host drawn style runs at, 21:9 is where a corner group drifts furthest, and 4:3 is narrower than a host drawn style allows, on purpose, so single ratio layouts show while authoring.
The grounds come from the extraction definitions, not a second list, and from the definitions instead of `SPRITE_MANIFEST`, which is empty in a checkout with no vault records.
`GROUND_TILE` is one ground block in game pixels.
`COUNT_STEP`, `ANGLE_STEP` and `MS_STEP` are steps that belong to the property, not the session: a count is whole children, an angle is degrees, and a duration is milliseconds, where a step of 8 would nudge a 200ms fade by 4% at a time.

## apps/desktop/src/views/HudLayoutEditor/HudLayoutEditor.css

The editor is a full page reached from the Advanced menu, so it fills its layer.
The toolbar runs across the top with the outline, stage and inspector columns below; rails are fixed and the stage takes the rest, so the stage being judged does not jump when a panel grows.
The outline and the inspector are Tessera SidePanels: sunken, resizable, folding to a rail, each keeping its width and fold under its own `storageKey`.
`scrollbar-gutter: stable` reserves the scrollbar's width, so content does not shift as a panel's height changes.
The stage column scrolls, because the stage keeps its aspect and can be taller than a short window; otherwise an element past the fold could not be clicked, which once stranded the wallet.
The global settings strip sits under the preview, pinned to the column's bottom with `margin-top: auto`, as the maintainer asked.
It is separated by a rule, not a card, the same reasoning as `.hud-subsec`.
The segmented track there is intrinsically sized so the label does not stretch away from it.

## apps/desktop/src/views/HudLayoutEditor/HudLayoutEditor.tsx

The editor arranges the app drawn HUD and shows it on the surface it will be drawn over.
It has four parts.
A toolbar across the top is the only way anything is added; it also holds what the preview is judged against: the display ratio and the ground.
An outline on the left is the document as a tree, with drag to reparent and reorder, since a stage position cannot express a node's place among its siblings.
The stage in the middle is the play field at true scale, drawn by the game's own renderer over the game's own ground.
An inspector on the right is the selected node's box, plus what a container does with its children.
A slot number is never validated against a device; the running scheme only sizes the preview's slot list and notes, never blocks, a slot past its range.
Nothing is written until Save; the draft is a memento, so walking away leaves the live HUD as it was.
This view is the only tier that touches data: the layout store, saved layouts, input profiles and glyph packs. Everything below takes props.
Both panels keep their width and fold in the browser's storage under their `storageKey`, never the document, because a panel width is a fact about the editor.
The editor's step is read here and provided as a context, which keeps stepped inputs reusable and measurable.
The motion transport is created here, the only tier allowed to own state the whole editor reads, and passed as a context; under reduced motion it reports itself disabled.
The step strip sits under the preview because it changes how the panel behaves, not what the document says.
The slot scheme, grid solve and flex slot contexts are provided around the inspector, because they are facts about the session.

## apps/desktop/src/views/HudLayoutEditor/HudLayoutEditor.type.ts

`layoutId` is omitted from the Advanced menu, where the editor opens whatever the active scheme wears, read from the layout store.
`onCommitted` fires after a successful save, once the live HUD and the edited scheme already point at the saved layout.

## apps/desktop/src/views/HudLayoutEditor/sub-components/AlignmentTiles.tsx

One labelled row of tiles per axis, and each tile draws its own answer.
The diagram is the value: a tile's outline uses the very CSS it writes, a two cell grid with the literal `justify-items` and `align-items`, or a flex box with the literal `justify-content` and `align-items`.
So `space-around` can only draw as `space-around`, and if the engine ever drifts from the browser, a screenshot shows it.
The old 3x3 pad crossed two positions, so `between` and `stretch` became orphan toggles and `around` and `evenly` could not be added; its previews were 18px squares.
Flex diagrams turn with `direction`, because a flex container's axes do; a grid's rows are `↔` and `↕` and always draw across.
Every tile is the same size, set by the widest row, because rows sized separately drew the same control at two sizes.
A row longer than four folds in half, so six main axis tiles split into positions (start, center, end) over distributions (between, around, evenly).
On one line they were about 26px wide at the 232px rail, and the three distributions differed by about a pixel.
The fold keeps start, center and end lined up down the whole component, and every line is full.
A grid tile has two bars, one per cell; a flex tile has three, enough to show a gap at each end and one in the middle.
A bar lies across the axis it moves along, so it reads as a child and not an arrow.
`stretch` changes the bar instead of moving it: the fixed size goes `auto` so the grid's own stretch fills the cell.
A row's `key` is the document key it writes, and also the tile's `data-align` prefix that tests press.
The cap is printed in front of the row; `label` is the group's accessible name.

## apps/desktop/src/views/HudLayoutEditor/sub-components/AnimationSection.tsx

The first block of Motion: the animations. Each is a clock the document drives for its own sake, gated by an expression.
Each animation is a `SubsectionGroup`: the property names it, a one line summary such as `300ms · loop · gated` says what it does while closed, and delete is the header's action.
The reflow warning lands on the card that animates the property named in it (`packages/hud/src/layouts/validate-motion-warnings` writes the property into the string), under that card's property control.
The generic "width and height can reflow siblings" note covers an animation just switched to `width` that is not saved yet, which the document walk cannot see.
There is one transport, not one per card, because every animation samples one shared clock; that shared clock is the staggering mechanism.
`openIndex` and `onOpen` belong to `MotionSection`, so one card is open at a time.
`warnings` holds this node's reflow lines, already filtered by id.
Deleting the last animation clears the field instead of leaving `[]`. The renderer reads both the same, but only an absent key keeps the saved document clean.

## apps/desktop/src/views/HudLayoutEditor/sub-components/AppearanceSection.tsx

Opacity, visible, background, border, radius, shadow, outline, tint, clip and dim when empty: how a box is painted, never its geometry, which belongs to Size and Box.
Background, Border, Outline, Tint and each Shadow are `SubsectionGroup`s: one header row with the enable box, a swatch and the value in words, closed by default.
Visible, opacity, radius, clip and dim when empty stay as plain rows, since they are not sub editors.
One group is open at a time, and this file owns that set. `openKey` spans the shadow cards too, which is why `ShadowListEditor` takes it.
So the section's height with everything on is one screen plus the single open group.
Enabling a group opens it.
`MAX_OUTLINE_PX` is 2 because an outline is drawn as stacked filters, cheap at one or two pixels and expensive past that (see `packages/features/src/hud-style`).
`CORNERS` follows the CSS `border-radius` order as initials: at the 188px rail each label gets about 88px, and `BOTTOM RIGHT` does not fit on one line once `Field` uppercases it.

## apps/desktop/src/views/HudLayoutEditor/sub-components/BoundedValueField.tsx

A scalar with a known range, drawn as its range: `fill (0-1)`, `armor (0-2)`, `bands (1 or 2)`.
The slider is the second half of the field, not the field: `ValueInput` stays, because a bounded scalar is just as bindable and `= item` is the most common thing written into `fill`.
The slider shows only while the value is a literal number; a formula has no handle, so there is no track.
Out of range is still not an error: a stored `fill: 4` loads, draws and reads back as 4, and only the slider's handle is clamped to the track.

## apps/desktop/src/views/HudLayoutEditor/sub-components/BoxModelField.tsx

The box model, drawn: padding nests inside margin, with an editable number on every edge and the box's size in the middle.
Every browser inspector since Firebug in 2006, Figma, Webflow, Unity's RectTransform and Blender's N panel draw it this way, because the nesting says which side is which.
The old four spinners in a row had 3px of typing surface at the 188px rail.
Margin left and top are dimmed and read only, because Placement edits them as the node's offset (`apps/desktop/src/hud-layout-editing/offset`); two editors for one pair of keys would compete.
Only padding gets the link toggle: two of the margin's four edges belong to another section, so linking them would write keys this control does not own.
The screen root has no margin, because its rectangle is the view.
`centre` is the authored size shown in the middle cell, such as `80 x auto`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ButtonContent.tsx

`button` passes straight through to `ButtonStatesEditor`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ButtonStateRow.tsx

One button state's face: an image from the same sprite grid as the toolbar's Sprite insert, or a glyph picked by sight from `GlyphPickerGrid`, never typed by name.
An absent optional state falls back to `idle`, the one state that is never empty.
Both faces are `ReferenceField`s, so neither can be typed into; a typo in the old sprite slug box made a face that silently drew nothing.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ButtonStatesEditor.tsx

A `button`'s whole Content: which control it binds to, then a face per state.
It binds by verb or by slot number; slot numbers are 1 based and uncapped, since a keyboard alone reaches 107 glyphs, and never validated against a device.
The slot half is `SlotRefField`, which shows the glyph the number currently draws instead of repeating the "any number" policy.

## apps/desktop/src/views/HudLayoutEditor/sub-components/CaseListEditor.tsx

A `switch`'s cases. They reorder, because the order is the logic: the first match wins, top to bottom.
It also has an `otherwise` row and "+ add case".
A case's `node` is a whole subtree, so this edits only `when` and the case's place in the list.
Its content is tuned like any other node: select it in the outline, which lists it, and the rest of the panel takes over.
The case node is a `ReferenceField` whose button jumps the selection there.
Which branch is winning is drawn, not deduced: `apps/desktop/src/hud-layout-editing/case-match` asks the engine's own predicate, so the marker matches the stage.
Inside a repeat a switch runs once per instance, so the previewed data is the whole set and the marker shows a count, such as `matches 6 of 20`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/CellPicker/behavior/span-place.ts

The `place` covering two corner cells, with `colSpan` and `rowSpan` written only when larger than 1.

## apps/desktop/src/views/HudLayoutEditor/sub-components/CellPicker/behavior/useCellPick.ts

The child's own gesture, and the only place in the panel where clicking a cell writes anything.
A plain press sets `place`; Shift press or a drag sets the span.
A press can write here, unlike in the grid editor, because this control's whole subject is one child under that child's Placement heading.
A plain placement clears the spans, since moving is moving. The drag rectangle is how to move and resize at once.
A drag commits once, on release. Travel only moves the cursor, the same discipline as `useDragGesture`.
`place` is the child's own `place` as the document has it.

## apps/desktop/src/views/HudLayoutEditor/sub-components/CellPicker/CellPicker.css

The picker shares the lattice sheet and its drawing, and owns only its frame and its legend.
A second copy of the lattice rules would let the two controls drift into looking like different grids.

## apps/desktop/src/views/HudLayoutEditor/sub-components/CellPicker/CellPicker.tsx

The child's own cell picker: the same lattice as `GridEditor`, with the opposite meaning.
The grid editor no longer touches children, so a grid child gets its placement control here.
It shows the parent's grid with its tracks, proportions and every other occupant, and writes only this child's `place`.
Click a cell to set it; Shift click or drag a rectangle to set the span.
There is no track editing here: no header selects, no insert, no remove, no toolbar. The parent's template belongs to the parent's Layout section.
Each of the two look alike controls states in its own heading what it writes, which guards against confusing them.
`container` is the parent, shown whole and never changed.
Selected means this child stands on the cell, so the selection and the child's footprint are the same rectangle.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ColorField.tsx

One colour row: a swatch that opens the real picker, and the hex beside it.
Appearance's background, border, outline, tint, text colour, text stroke and every gradient stop use this row.
The swatch is the control; the hex is a readout you may also type into.
`ColorPickerPopover` owns the floating half: it portals onto the `popover` layer, flips when there is no room below, and sits on the shared dismiss stack, so `Escape` closes the picker and not the whole editor.
The grid's guide colour does not use this row: `LayoutSettings` anchors the popover to a bare `ColorSwatch`, because the hex box was the widest thing on that line.
Appearance keeps the hex, because a gradient is read by its numbers as much as by its squares.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ContainerOverlay.tsx

The selected container's own arrangement, drawn over the preview in its own `guide.color`, only while the grid view toggle is on, and never in the game.
It reads `useHudEditorViewStore` directly, as `EditorToolbar` does for this view only flag.
It works for either engine.
A grid draws its cell boundaries from the engine's own solve (`stageCellRects`), so an empty column still has lines.
A flex container draws its children's slots from where they were placed (`stageSlotRects`); the space between them shows as the gap it is.
It is purely visual: no click targets, no writes, `pointer-events: none` and `aria-hidden`.
The lattice lists every cell edge once.
`OverlayFlexSlots` insets each slot by a pixel and dashes it, so a first child's slot never sits exactly under the gold selection outline and reads as one box.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ContentSection.tsx

Dispatches to the one editor that knows this element's shape.
A container has no Content section: `NodeInspector` renders it only for an `element`. A `spacer` needs nothing beyond its box.

## apps/desktop/src/views/HudLayoutEditor/sub-components/CountdownContent.tsx

`countdown` has one choice: which pie it draws.
`profile` follows the player's Countdown Timer setting; `pixel` and `smooth` pin this node to one pie.
Pressing a segment changes only the lit segment, because the hint below is the same sentence for all three.
`setting` is written back as an absent key, so a node that follows the profile reads the same whether it was inserted or reset.

## apps/desktop/src/views/HudLayoutEditor/sub-components/DataSection.tsx

Every bound property on this node in one place, with its expression and live value. It answers what makes this move.
It is read only. Each expression is edited in the section that owns its field, such as Size and Box for `scale` or Appearance for `style.tint.amount`.
The empty state is the one place the binding feature is announced. `ValueInput` has no resting chip or switch, so this section tells the author once that typing `=` drives a number.

## apps/desktop/src/views/HudLayoutEditor/sub-components/DirectionControl.tsx

Two arrows instead of a text `Select`: which way a flex container's children flow.
There used to be a third answer, `stack`, until overlay went back to the grid it always was; "Overlay" is now a grid preset in the Container menu.
The arrows are Lucide icons, and the "direction" label is gone in the `bare` variant, because an arrow already says direction.
Each option's label is its accessible name and tooltip: a word plus what it does.

## apps/desktop/src/views/HudLayoutEditor/sub-components/DisabledReason.tsx

A group that cannot be edited yet, with the cause on it.
The fields stay visible, because a property that vanishes when a switch flips is one you stop trusting.
The reason sits on the surface, and the one control that would lift the lock is offered as an action.
It is `DisabledOverlay`, which already handles `inert` on the covered subtree (out of the tab order and the accessibility tree), the scrim and the action; this adds the inspector's density.
It is always `contained`, because every caller sits in the scrolling inspector rail, where the default overhang would be clipped.
`actionLabel` is omitted for a lock nothing here can undo, such as the screen root, whose rectangle is the view.

## apps/desktop/src/views/HudLayoutEditor/sub-components/DragGhost/

The card that follows the cursor while an outline drag is live, in three lines.
What it says comes from `apps/desktop/src/hud-layout-editing/drop-ghost`; this is only the drawing, so the wording is testable without a DOM and the outline's `aria-live` region reads the same words.
It tracks the cursor itself, because the gesture skips re-renders when two frames resolve to the same drop, and the card must move every frame.
It renders through `Portal` at the `tooltip` layer, so neither the stage's `overflow: hidden` nor a rail's scroller clips it, and an open picker never draws over it.
It does not animate, because an eased ghost reads as latency.
The first frame after the slop threshold has no point yet, so it is skipped.
`GhostCard` is separate from the portal and tracking so the drawing can be server rendered and measured in the headless harness.

## apps/desktop/src/views/HudLayoutEditor/sub-components/EasingPicker.tsx

The easing curve, drawn, as every motion tool does (After Effects, Framer, Webflow, the devtools cubic bezier editor), instead of five names in a `Select`.
It offers the engine's own set: five named curves plus `steps(n)`, each thumbnail sampled from `easingFn`, so a tile cannot show a shape the renderer would not draw.
`steps(0)` is unreachable because the count floors at 1, the same `[1-9]\d*` the validator enforces.
A tile is a toggle: six small tiles wrap inside the 188px content floor and each shows its answer at rest.
The `auto` tile appears only where the field may be unset, such as a keyframe's span override that inherits the animation's easing.
`unsetHint` says what no choice means at each call site: a keyframe inherits its animation's easing, a transition falls back to the renderer's `ease-out`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/EdgesField.tsx

Which sides a border draws on, as `HudBorderSides` (`packages/features/src/hud-style`).
Absent means every side, so an author who never opens it gets a border on all four.
It edits four booleans, unlike `EdgesInput`, which edits four numbers, so it stays its own component.
The first uncheck seeds the other three as explicitly on, and when all four are on again the value becomes absent.

## apps/desktop/src/views/HudLayoutEditor/sub-components/EditorStage.tsx

The stage is the play field at true scale over a real ground.
Its aspect is the ratio being judged, one game pixel is one stage unit, and every element is drawn by the same `HudNodeRenderer` that draws it in game, over the same solved tree.
The ground is tiled behind it because two defects in one week were invisible against the background they were drawn on.
The grid is one tile of 8 game pixels, the game's own unit.
Picking and selection are a layer of their own, so the art is untouched by the editor.
Nothing is dragged here; the margin nudge and corner scale handle are gone, so what the engine placed is drawn as is.
The overlay targets the selected node when it is a container of either engine, or its real parent when a child is selected, so a child is seen in the arrangement that placed it.
The motion transport's `nowMs` overrides the stage clock only once the author takes hold of it.

## apps/desktop/src/views/HudLayoutEditor/sub-components/EditorStepStrip.tsx

The editor's global settings strip, under the preview in the centre column, where the maintainer put it.
It holds one setting and is built to hold more: `STEP 1 · 2 · 4 · 8`, how far one `−` or `+` in the inspector moves a number.
8 is there because the game's grid is 8px, and 4 and 8 are the gaps people type most.
It lives in the centre column because a setting that changes every stepped field cannot sit inside one section without reading as that section's property.
It is view only: the View reads `hud-editor-view-store` and passes the value and setter.

## apps/desktop/src/views/HudLayoutEditor/sub-components/EditorToolbar.tsx

The bar across the top: everything that can be added, and everything the preview is judged against.
It is icon only, grouped by what a button makes, with separators between groups; tooltips carry the names.
Sprite and Glyph open picker grids, because you recognise them by picture, never by filename.
The display ratio and the ground sit on the right; both are session only and never written to the document.
The glyph pack is written to the document and is edited only in the inspector's `GlyphPackPicker`, so this toolbar does not repeat it.
One menu is open at a time, closed by choosing, by Escape, or by pressing anywhere outside a menu.
A press outside the bar and any open panel closes it; panels may be portalled, so they are checked too.
The bar, not each menu, registers at the `menu` dismiss level; a picker it opens registers at `popover` and wins, so Escape over the sprite grid closes only the grid.
The grid view toggle moved to `LayoutSettings`, beside the guide colour it draws, and is not mirrored here.
Snapping stays, because it is about the stage and belongs to no rail section.
The icons are Lucide, from one table in `apps/desktop/src/hud-layout-editing/toolbar-menus`.
`slotNumbers` are a shortcut in the Slot panel, never a cap on what can be typed.
`targetLabel` names the container where the next insert lands.

## apps/desktop/src/views/HudLayoutEditor/sub-components/EngineToggle.tsx

Which engine arranges this container: two icon buttons and nothing else.
It replaced a full width `SegmentedControl` under an "engine" label, which cost about 40px in a section whose problem was height.
It is defined once and mounted in two places, in the grid toolbar and at the head of the flex bar, so neither copy can drift.
It is deliberately simple: `onChange` is the caller's engine swap, which reshapes the node in `LayoutSection`.
The icons show the arrangement: three bars spread along a line for flex, a lattice for grid, the same icon as the toolbar's Grid row.

## apps/desktop/src/views/HudLayoutEditor/sub-components/EnterExitEditor.tsx

Motion's third block: what happens when the node itself arrives or leaves, such as a `repeat` gaining or losing a child.
"A bound value changed" cannot describe something that did not exist a frame ago.
It renders whatever is bound; the old Transitions section hid enter and exit when nothing was bound, which gated an unrelated control.
Outside a repeat it is annotated, not disabled, because authors often build the child first and wrap it in the repeat later.
Each row is one `ToggleGroup`, because `properties` is a multi select: a fade and a scale is an ordinary enter.
`position` is the small settle that `useEnterExit`'s pre enter transform draws, not a free offset.
The validator refuses empty `properties`, so clearing the last one clears the whole enter or exit.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ExpressionInput.tsx

A bare expression string, wherever the document stores one instead of a `Value`: a switch case's `when`, a repeat's `item`, an animation or transition gate.
It is the same field, adapted at the type boundary only; the leading `=` is typed, never stored.
`role="gate"` offers comparisons and `and` as starters, never fractions.
The old `+ var` select appended names at the end only, and the `? syntax` link opened expr-eval's README, which describes features this grammar refuses; `FormulaMenu` replaces both.
`extraNames` carries a name valid only at one call site, such as `delta` in `transition.when`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ExtentField.tsx

One axis of a box's size as one field: a number whose unit is the mode.
The old `ExtentInput` used two rows, with `auto` and `fill` leaving an empty disabled spinner; Figma and Webflow use one field whose suffix names the unit.
There is no spinner: a `NumberInput`'s spinner column is 29px, more than half of a half width field at the 188px rail.
`NumberCell` keeps the arrow keys, so the field is wider than the two row control it replaced.
The suffix opens a four item menu instead of cycling, so every mode is one click and visible.
It is a `DropdownMenu`: portalled, and on the dismiss stack at `menu`, so one `Escape` closes only the menu.
`bare` is for the grid toolbar's slot, which reserves a fixed height; the label becomes the group's `aria-label`.
A bound extent has no literal to show, so it reads as blank; `ValueField` is where an expression is edited.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/behavior/flex-actions.ts

One table, and every row is an action on the selection, the grid's rule kept. The toolbar, legend and keyboard all read these rows, so the legend never promises a shortcut the toolbar lacks.
Four buttons, always, in reading order: start, earlier, later, end. A move that cannot apply is disabled in place, never removed. When they were dropped, a second press on the same spot undid the first, because the buttons shifted.
`run` is left off a move that cannot apply, which also keeps its key from firing, since `runnerFor` answers only rows that can run.
Moves need one picked child. A multi pick still names itself in the chip and echoes on the stage, but a run has no single place to land, so it refuses in the legend with `MANY`. The selection is a run from day one, for the same reason the `ids` of `drop-intent` is an array.
The arrows follow the flow: a row's earlier is the left arrow and a column's is the up arrow, from the grid's `EARLIER_ICON` and `EARLIER_KEY` pair keyed by axis (`axisOf`). The two end moves use the arrow into a wall icons so they differ from one step moves.
`GESTURES` are the three pointer gestures shown under every state. They write nothing.
`moveRun` writes the multi pick refusal once instead of four times.
`gestureActions` holds legend only rows. `clear` lives there because Escape has no button.
`chipOf` returns two or three words, uppercased by the sheet, so a screen reader hears "item 2". `null` is nothing selected, and the toolbar prints its own hint.
`statusOf` is the one line under the strip: what is picked and its name. It stays short enough for the 232px rail, since the legend truncates instead of wrapping.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/behavior/useFlexSelection.ts

The flex strip's selection. A press writes nothing, the lattice's rule: click, `{mod}` click and Shift click change what the toolbar offers and what the stage echoes, never the document.
The pick rule is `apps/desktop/src/hud-layout-editing/index-selection`, the same function the grid's track headers call, so the two strips share one Shift behaviour.
Escape registers on the dismiss stack at `popover`, so it clears the selection and leaves the editor layer standing.
The selection is dropped when the child count changes, not remapped. A move keeps indices meaningful, but a child arriving or leaving through the outline would re point every index.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/behavior/weights-of.ts

Equal shares when nothing has a size yet, which says no proportions are known instead of guessing. The lattice makes the same fallback.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/FlexEditor.tsx

Section four under a flex container is Flex manipulation.
The grid's manipulation section edits the grid's structure, its tracks, and the children follow. A flex container's structure is the order of its children: each child is its own track along `direction`.
So this is the same control one dimension down, with the same three bands.
`SelectionToolbar` holds actions on the selection only. It is sticky, one row, with the same reserved height when nothing is picked, and it is the same component the lattice mounts.
`FlexStrip` is the drawing: one cell per child, sized by the child's real placed size (`apps/desktop/src/hud-layout-editing/flex-slots`), drawn along the container's direction and wrapping as it wraps.
`SelectionLegend` shows what is selected and what can be pressed now, drawn with `KeyCap` and `MouseGlyph`.
A press writes nothing: click, `{mod}` click and Shift click all leave the document byte identical, and only choose what the toolbar and the stage echo read.
The one write goes through the one route. A reorder is a `moveNode`, and `apps/desktop/src/hud-layout-editing/drop-intent/move-all.ts` is the only module that calls one, which a grep test checks. This component hands a `DropIntent` up and never touches the tree.
`moveNode` removes and then inserts, so its index is into the list without this child, which is exactly the destination slot in both directions. An earlier `+1` for the forward case sent "move later" to the end.
The stage echoes what is picked, visually and never as an edit, keyed by the children's ids.
`onDrop` is the editor's single `applyDrop` route. A harness without the view leaves it out and the strip is a read only drawing.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/FlexEditor.type.ts

A flex container's structure is the order of its children, which is why this type is much smaller than the grid's.
Each child is a track laid end to end along `direction`, so the actions are those a line of tracks has: earlier, later, to the start, to the end.
There is no insert and no remove: a child is added by the toolbar and deleted from the outline. There is no property editing: a child's size, place and alignment are its own sections.
A selection is context, not an edit. Nothing in `FlexSelection` is ever written.
`FlexSelection` holds 0 based indices into `container.children`. `none` is the resting state, for which the toolbar prints its hint.
`FlexEditorEdits` has one write, `move`, because a reorder is a `moveNode` and `applyDrop` is its only caller. `refuse` says in the legend why an action was refused.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/sub-components/FlexStrip.css

The flex manipulation drawing. The toolbar and legend bands are `SelectionBands`, shared with the grid; only the drawing is here.
`flex-direction` follows the container's `direction` and `flex-wrap` its `wrap`, so a column's children stack in the panel as on the stage.
It borrows the lattice's look on purpose: dashed idle cell, gold selected fill, monospace ellipsised label.
The strip is flat like the lattice: no well, padding or border of its own.
A row draws across, one band tall; a column draws down and each cell keeps the band height.
A column's cells share the strip's width and take their weight in height.
The cell weight is the child's real placed size in `flex-grow`, over a floor big enough to press and read a few characters. Past that the strip overflows, as the lattice does.
The keyboard cursor is a rim, not a fill, so it shows inside a selection, and only while the strip has focus.
The label is its own block with the ellipsis rule, centred. As an anonymous flex item a long name clipped at both ends.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlexEditor/sub-components/FlexStrip.tsx

The drawing: one cell per child, in flow order, at the proportions the engine gave them.
Each cell's `flex-grow` is its child's real placed size along the flow, the same way the lattice enters its track weights, over a minimum so a zero sized child can still be pressed.
It is drawn the way the container is drawn: `flex-direction` and `flex-wrap` follow the container's `direction` and `wrap`.
One tab stop, with the cursor as `aria-activedescendant`. A button per child would put six tab stops before the legend; the strip takes focus and the arrows move inside it, as in the lattice.
A press writes nothing: everything is `onPointerDown` into a selection hook.
A cell's `weight` is the child's placed size along the flow in game pixels, `0` for a child not on stage now, which draws at an equal share.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FlowSettings.tsx

Section two is Flow, its own section for one reason.
`direction` and `wrap` once sat above the alignment tiles in the same section, and since flex tiles turn with `direction`, pressing `column` rotated tiles two rows below in that section.
The maintainer's rule is that nothing in a section may change when another option in the same section is clicked.
The tiles still turn, but now a later section reacts to an earlier one, which the rule allows.
Two icon options on one row, about 86px, fit every rail width from 220 to 320.

## apps/desktop/src/views/HudLayoutEditor/sub-components/FontPicker.tsx

Real faces only: ALttP Dialogue, the bundled pixel recreation, and the app's UI sans and mono. There is no library of others.
The game face only looks right at whole multiples of its 16px design size, so its size snaps to one.
`FONT_VARS` are the same variables `HudText` draws with, so the specimen is the face the stage uses.
The specimen shows the face at the chosen size and weight, because a name in a `Select` says nothing about how it looks.
Weight is a slider: CSS defines nine weights and both UI faces are variable across all of them.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GlyphContent.tsx

A `glyph` element shows a fixed position, or whatever slot N is bound to now, never both.
It is picked by sight from the toolbar's Glyph grid, never typed by an SDL name.
The resting field shows the picture through `apps/desktop/src/hud-layout-editing/glyph-art`, the same as the picker, instead of the SDL token.
The slot branch uses `SlotRefField`, which draws the glyph the slot is bound to instead of describing it.
The two options are single words, because longer phrases overflowed a 188px rail by 32px in the width harness.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GlyphPackPicker.tsx

Which artwork the chips wear.
"Auto" is the default and follows the pad in hand, so a player who never opens this sees their own controller.
A chosen pack overrides the device; a custom pack overrides only the positions it has images for and inherits the rest, so importing one button is quick.
Only positions the current cluster draws are offered, because a glyph for a control the pad does not report is invisible work.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GlyphPickerGrid.tsx

The Glyph insert, picked by eye: tabs are the packs and tiles are the artwork.
It replaced a nested menu that asked players to recognise a control by its SDL name, such as `LEFT_SHOULDER`.
Each tile resolves through the live HUD's fallback chain (pack, its fallback, generic), so a position shows the picture it would get in game.
A position nothing draws is left out.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GradientRamp.tsx

The ramp is what is being edited, so the ramp is drawn, as in Figma, Photoshop, devtools and Blender's colour ramp.
It replaced one row per stop with nothing rendering the gradient.
Only the selected stop takes rows, so any number of stops costs one ramp and two rows.
Click selects, drag moves, and double click on the ramp adds a stop there.
Arrow keys nudge the focused stop by 1%, or 10% with Shift, and `at` is also a number field, because dragging is for feel and typing is for exact values.
Stops are sorted on every write and the selection follows the moved stop, so dragging past another stop does not start editing its neighbour.
`at` is a bare number in `packages/hud/src/types/hud-value`, not a `Value`, so it uses `NumberInput`; a stop position cannot be bound.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/cell-state-of.ts

What a cell looks like and the one rectangle the stage echoes.
Two facts, four states: is the cell in the selection, and is a child standing in it. Occupancy is drawn so a track edit's blast radius shows before the button is pressed.
`selectionBounds` is contiguous by construction for a track and the hull of the picked cells otherwise. `StageGridEcho` washes this rectangle.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions.constants.ts

`GESTURES` are the four pointer gestures shown under every state with a lattice. They write nothing: a click, modifier click, Shift click and drag leave the document byte identical.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions.ts

The one table: every row is an action on the selection, and the toolbar, legend and keyboard read the same rows.
There is no persistent group of grid properties in the toolbar. Properties in an action table are a category error, so they live in the Layout sections.
`contextualActions` is what can be done to the selection, `[]` when there is none, and the toolbar then prints a hint in the same reserved height.
`gestureActions` is legend only: what the pointer and the arrows do. `clear` lives there because Escape has no button.
Add column and add row are not here; they are always available and live on the lattice.
Its vocabulary is the grid only: columns and rows (insert, remove, move, size). Placing, spanning and self alignment of a child are done in that child's Placement section.
An action that cannot apply is absent for cells; a track move is disabled in place, see `grid-track-actions`.
`gridActions` is the whole table in render order, toolbar rows first, then legend rows. `grid-keys` looks a press up across all of it.
This file re-exports `contextualActions` and `gestureActions` because the HUD tests import them from this path.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-icons.constants.ts

The grid toolbar's icons. Unicode glyphs were drawn by whatever font the OS picked, unrelated to the icons around them; the project uses Lucide through `@iconify/react`, one stroke weight at 16px.
Add column and add row use a plain plus on the lattice, so they are not here.
The inserts are drawn here in Lucide's grammar, a track and a plus on the side the new one lands, in a 24px box with a 2px round `currentColor` stroke (`drawn`). The pinned Lucide has no `between-horizontal` family, and the arrow to line stand in collided with the flex strip's "move to the start".
`EARLIER_ICON` and `LATER_ICON` are the arrows the legend prints, since reordering is a direction.
`START_ICON` and `END_ICON` are arrows into a wall, because "move to the edge" needs a different picture from "move one along"; the flex strip once drew both as the same arrow.
`EARLIER_KEY` and `LATER_KEY` are the caps the legend prints for the same moves, one source for both bands.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-keys.constants.ts

The keyboard looks its action up by the cap the legend draws, through `apps/desktop/src/hud-layout-editing/action-keys`, shared with the flex editor.
What is left here is the lattice's own cursor motion over two axes, grouped in the legend as one arrows row, which writes nothing.
The primary modifier with an arrow jumps to the edge; Shift extends a cell selection from its anchor.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-status.constants.ts

The one line saying what is selected, plus the words the toolbar's leading chip wears.
The chip names what the toolbar acts on: `COLUMN 2`, `ROW 1`, `3 CELLS`. It comes from the same selection as the status line, so they never disagree.
The status names what a track holds, so a person sees what the next press will move. Children follow a track edit automatically.
On a 3 by 3 grid it also names the anchor, such as bottom left, since the nine anchor dropdown was removed when the screen became a grid.
The chip is lowercase in the string and uppercased by the sheet, so a screen reader hears "column 2". `null` is nothing selected, and the toolbar prints its own hint.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-track-actions.constants.ts

What a selected column or row can have done to it, which is all this editor does beside the container's gap, alignment, guide colour and engine.
There is no "a child is in the way" refusal: children are kept valid automatically and `editGridTracks` moves them with the edit. The one refusal left is that `columns` may never be empty, `packages/hud/src/layouts/validate-container`'s floor.
Every row is an action on the selected track, so all live in the sticky strip and none survives a clear.
Size is not a row: the selected header's label is the menu (`TrackHead`).
Every track edit goes through `packages/hud/src/layouts/grid-track-edits`, which returns the container with the new track list and the children's remapped `place` together, so the panel never writes one without the other.
`applyTrackEdit` takes a container, not a selection, so callers that never see a selection can use it. `applyEdit` is the same route reached through a `GridActionContext`.
`trackExtentOf` returns the declared extent, so an implicit row's size menu opens on `auto` instead of the solved size.
`removeRun` removes the range back to front, so the indices still name the same tracks after the first goes.
A move that cannot apply is disabled in place, never absent, because a vanished button slides the next one under the cursor.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/useGridSelection.ts

The lattice's selection and the one drag in the editor.
A click writes nothing. A plain click once committed an armed placement and moved a child; there is no commit here now.
The drag selects and never moves. The release only ends the rectangle.
Every modifier goes through `isPrimaryModifier`, never a literal `ctrlKey`, so Cmd works on a Mac and the legend matches the key.
Escape registers on the dismiss stack at `popover`, so it clears the selection and leaves the editor layer standing.
The track pick rule is shared with the flex editor's cells through `apps/desktop/src/hud-layout-editing/index-selection`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.css

What is left of the grid editor's own chrome once the bands moved to `SelectionBands`. The lattice has its own sheet beside `GridLattice`, since two controls stand on that drawing.
`.hud-grid` is a bare column of three bands on the panel background. Its card, border, radius, title and settings well were removed to avoid boxes inside boxes.
`.hud-cellpick__title` keeps its own rules, since the cell picker is the same drawing with the opposite meaning and the title tells them apart.
`.hud-grid-echo` is visual only and takes no pointer, on purpose; its colour comes inline from the container's `guide.color` so the echo and guide lines read as one.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.tsx

Section three is the grid component and nothing else.
It has no settings and no box around it: engine, guide, tracks, gap and item alignment are sections one and two, and the section's gold rule says what this is.
Three bands on one subject, the lattice: `SelectionToolbar` with actions on the selection only, `GridLattice` as the drawing and the tracks' own controls, and `SelectionLegend` with what is selected and what can be pressed.
The track controls sit on the drawing. The two plus buttons are the lattice's last header cells, beside the strip they extend.
The selected track's size is its header's label, which is the menu button, so the toolbar fits one row at the 232px rail.
A press writes nothing: clicking, `{mod}` clicking, Shift clicking and dragging across cells leave the document byte identical and only choose what the toolbar and stage echo read.
There is no child manipulation here. A child's cell is set in its own Placement section by `CellPicker`.
`onPatchContainer` is the only way out of this control, and it names the container alone.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type.ts

`GridSelection` is one selection made three ways. There is no occupant kind: the grid editor edits the grid only.
`cells` is a list, not a rectangle, because the primary modifier toggles cells in one at a time. `track` carries the axis so the toolbar knows which extent list it edits.
A selection is context, not an edit. Nothing in the union is written to the document.
The action table shape lives in `apps/desktop/src/hud-layout-editing/selection-bands.type.ts`, shared with the flex section. `GridShortcut`, `GridActionKind` and `GridAction` stay as aliases so this folder reads in the grid's own words.
There is no `control` action kind: a field in the action strip was a property in an action row and made the strip two rows deep at 232px. Size lives on the track header.
`GridEditorEdits` has two writes, both about the grid. `patchContainer` covers tracks, gap, item alignment and the guide colour. `refuse` explains a refused action in the legend.
`occupants` is read only, drawn so a track edit's blast radius is visible.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/behavior/

The lattice's arithmetic: addresses, rectangles, occupancy and proportions.
The cells match the real tracks. Track sizes come from the engine's `solveGrid` as `fr` weights with a `minmax(24px, ...)` floor, so a track keeps its share until that would fall below the target size. The whole drawing is one `grid-template` string, which also lets it be rendered and measured in a headless browser.
An empty `auto` track solves to 0 and is drawn at the floor, marked; `emptyOn` is what the header uses to say so.
Occupancy is the engine's own answer (`assignCells`): pure, needing no `MeasureContext`, and it resolves auto flowed children, so the panel and stage agree. It is read only here.
`CellRef` is 1 based, like `place.column` and `place.row`.
`Occupant` is a child's resolved footprint from `assignCells`.
`CELL_MIN` is the WCAG 2.2 SC 2.5.8 target size on both axes, the one number a proportion never overrides.
`GUTTER` is the row header strip's width and `HEAD` the column header strip's height. The gutter is 42, not 24, because a selected row header shows its size control (`TrackHead`) and needs about 34px of mono; that removed an 81px field from the toolbar so it fits one row at 232px. The toolbar chip names the row while the swap lasts.
`ADD` is the trailing strip on each axis where the plus button lives.
`occupantsOf` skips a countdown, a floating overlay that spans the whole grid only so it sizes no track and is not placed while idle; counting it would mark every cell taken. It is kept when it is the child being edited, so its own picker shows where it stands.
`originsIn` returns the occupants whose origin is inside the rectangle, which is what "this track holds" means.
`rowCountFor` is as many rows as the children reach, never fewer than declared.
`trackTemplate` writes one axis as `fr` weights with the target size floor under each. The floor takes space from the others instead of shrinking any track below 24px; when floors no longer fit, the lattice scrolls with sticky headers.
`PAD` and `GAP` are the lattice's padding and cell gap, needed because the height is computed, not left to the browser.
`ROW_IDEAL` is a comfortable band before the cap; `VIEWPORT` is the cap.
`latticeHeight` gives the body a definite height, or the row `fr`s have nothing to divide and every row collapses onto its floor. It is arithmetic instead of `aspect-ratio` from the grid's shape: the 398 by 224 screen in a 188px rail leaves 96px for three rows that need 72 of floor plus 30 of chrome, so every row would floor. Each axis keeps its own track proportions, and the height is big enough to show them and small enough to keep the legend in view. Past the cap it scrolls.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/behavior/head-title.ts

An empty `auto` track is drawn at the floor, and the header title says so instead of letting 24px pass for its size.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/GridLattice.css

The drawing two controls stand on (`GridEditor` and `CellPicker`), so it has its own sheet.
Past the point where every track clears the 24px floor the body overflows and scrolls instead of shrinking a track, and both header strips stay put so a scrolled cell can be identified. 220px caps a ten row grid.
The lattice is flat on the panel with no sunken well; the dashed cells are the drawing.
`scrollbar-width` alone switches Chromium to the native bar and drops the app's themed scrollbar, so `scrollbar-color` keeps it the panel's own.
The grid template carries the solved sizes as `fr` weights over a 24px floor, and the inline height from `latticeHeight` gives the row weights something to divide.
`min-width` and `min-height` of `min-content` let the body grow past the rail when the floors stop fitting, so nothing is clipped and the sticky column strip spans what it labels.
A `role="row"` line is `display: contents`, giving semantics but no box, so every header, cell and occupant places itself.
The corner is the one cell whose address never changes, so it is placed in the sheet.
A header that selects nothing has a default cursor: `CellPicker` shows the parent's tracks and may not edit them.
An empty `auto` track's header is dashed, because the 24px it occupies is the minimum, not its size.
The selected track's size is its own label, in the same place and width.
The plus is dashed because it is not a track, only the place the next one appears.
Four cell states, four paints, from two facts crossed. They are asserted as four distinct computed paints in Chromium.
Selected and occupied keeps the selection fill under a hatch, so a track edit's effect stays visible while picked.
The keyboard cursor is a rim, not a fill, so it shows inside a selection, and only while the keyboard is in the grid; drawn always, it showed a selection that was not one.
The occupant label is drawn once across its span and never takes the pointer. It is a block centred by the grid, because as a flex item its text clipped at both ends instead of ending in an ellipsis.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/GridLattice.tsx

The drawing, and the track controls that stand on it.
Two controls mount it with opposite meanings: `GridEditor` edits the grid, `CellPicker` edits one child's cell. Neither owns it: it takes what a cell looks like and what a press means as props, and writes nothing itself.
A mount that passes no `onAddTrack` or `onSizeTrack` gets a pure drawing, which is what `CellPicker` needs.
The plus button is the last header on both strips, so the template grows one 22px column and one 22px row for them. A plus beside the strip it extends says where the new track lands.
The cells match the real tracks: column widths and row heights are the engine's own solve, as `fr` weights over a `minmax(24px, ...)` floor, inside a body whose height is definite (`latticeHeight`) so the row weights have something to divide.
Past the point where every track clears 24px the body scrolls, with both header strips sticky as frozen panes, since the strips are what identify a cell.
Occupancy is drawn, never touched: a child's label sits over its cells with `pointer-events: none`, so a track edit's effect is visible but the child cannot be edited here.
One tab stop: the body takes focus and the cursor is `aria-activedescendant`. A button per cell would make a 6 by 4 grid 24 tab stops. The two plus buttons and a selected track's size button are the exception, each a thing a keyboard has no other route to.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/GridLattice.type.ts

`LatticeCellState` is four states from two facts: is the cell selected, and is a child standing in it.
`rows` is short or absent when the grid's rows are implicit. `colSizes` and `rowSizes` are the engine's solved sizes in game pixels; empty means nothing is solved yet and every track draws at an equal share.
`occupants` are drawn faintly and read only, so a person can see what a track edit will affect.
`activeChildId` is the child the mount is about, drawn brighter than its siblings.
`label` is the spoken name for the whole lattice.
`onTrackDown` is omitted by `CellPicker`, since a child's own picker may not select a track.
`onAddTrack`, `onSizeTrack` and `extentOf` are optional together. Given, the strips grow a trailing plus and a selected header's label becomes its size menu. Omitted, the lattice is a pure drawing.
`extentOf` returns the declared extent, which the size menu opens on, not the solved one.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/sub-components/AddTrackButton.tsx

The plus at the end of a header strip: just the icon, and where it sits says what it does.
It is a header cell placed in the lattice's own template one past the last track, so it moves, scrolls and sticks with the strip it extends.
It is never part of a selection. It carries no `data-on`, stops its `pointerdown` from reaching the lattice's drag, and appends through the same document rule as every track edit (`packages/hud/src/layouts/grid-track-edits` remaps every child's `place`).
`at` is the 1 based grid line it sits on, one past the last track's header.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GridLattice/sub-components/TrackHead.tsx

One track's header and its size control.
The size is on the header because the header already printed `auto`, `fill` or `24px`. A second size field in the toolbar said the same fact and cost 81px, forcing two rows at 232px. Selecting the track turns its label into the button that opens the four item menu.
A row header prints its number and swaps it for its size while selected. It has 42px, and the toolbar chip names the row for as long as the swap lasts.
The menu is `DropdownMenu`: portalled, since the lattice scrolls and would clip an inline menu, and registered on the dismiss stack at `menu`, so one Escape closes only the menu.
`index` is 0 based, like the extent lists. `text` is what the header prints when not selected. `empty` means the track solved to nothing and is drawn at the 24px floor.

## apps/desktop/src/views/HudLayoutEditor/sub-components/GroundPicker.tsx

Which surface the HUD is arranged over: five flat grounds cut from the game (turf, an indoor floor, sand, and water at two depths), tiled behind the stage.
Two defects in one week were invisible against the background they were drawn on: a black silhouette on black, and a dimmed chip lost over grass.
Each swatch is the tile itself, so a ground is chosen by recognising it.

## apps/desktop/src/views/HudLayoutEditor/sub-components/IdentitySection.tsx

The node's id and nothing else. Kind, path and a standing uniqueness note were removed, since the header already names the kind.
The id rule is shown where it is broken: the field keeps a draft, checks it on every keystroke and names the problem under itself.
It commits only a valid id, on blur or Enter, so a rename never passes through a duplicate on the way to a fine name.
The two rules are the validator's own: `validate-box.ts` needs a non empty id and `validate-node.ts` refuses one used twice.
`otherIds` holds every other node's id, the set a duplicate is measured against.
Selecting another node resets the draft, so the field never shows the previous node's id.
Escape calls `preventDefault`, which tells the dismiss stack the key was used here, so an abandoned rename does not also close the editor.
The breadcrumb shows only for a node deep inside a switch or repeat.

## apps/desktop/src/views/HudLayoutEditor/sub-components/KeyframeTrack/KeyframeTrack.tsx

One animation's keyframes, as a track with a selected key.
The old row put `at`, the value, an easing `Select` and a delete button on one flex line per key. `at` and the `Select` declare `width: 100%`, a 100% basis on a flex item, so the value had no room to grow at any rail width.
The fix is that one key is edited at a time and its three fields are three full width rows.
`at` is a `Slider`: a bounded 0 to 1 with no units, dragged more often than typed, and the same number the diamond above moves.
The label belongs to the `Field`, not the `Slider`, because `Slider` puts its label beside the track and an `input[type=range]` will not shrink below about 129px; the pair overflowed the rail by 14px at 232 and 36px at 188.
Labels above the control are also the row grammar the rest of the panel uses.
A key can be deleted from under the selection, or the animation replaced by a preset, so the index is clamped on read instead of repaired in an effect that runs a render late.
`easing` is the animation's default easing, read by a new key's sampled value and by a span that does not override it.
`endLabel` is the ruler's right end: the resolved duration or the formula. `head` is the transport's position, 0 to 1 of this animation's cycle, or `null`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/KeyframeTrack/sub-components/KeyRail.tsx

The track: a time ruler, one draggable diamond per keyframe, a playhead, and click anywhere to add.
Every diamond is a button, so the track works without a pointer: Tab moves between keys, the arrow keys nudge the focused key by `NUDGE` (0.01, Shift for `NUDGE_COARSE`, 0.1), Enter or Space selects it.
The pointer is captured on the rail, not the diamond. A capture on the 11px diamond stops once the pointer leaves it; on the rail the drag survives travel past either end, and `clampAt` keeps the result between the neighbours.
`onAdd` runs for a click on empty track and adds a key there holding the curve's own value.
`head` is `null` when the transport is idle or reduced motion has silenced it.

## apps/desktop/src/views/HudLayoutEditor/sub-components/LayoutSection.tsx

Four sections, each one concern, so nothing in a section changes when another option in that same section is pressed.
Layout holds type, gap on both axes and the overlay, the same for every container, since both engines store `gap: { x, y }` and any container has a `guide`.
Flow is direction and wrap, flex only. It is its own section because direction turns the alignment diagrams, so the tiles are a later section reacting to an earlier one.
Alignment is the tiles: pressing one writes one key and lights one tile.
Grid manipulation or Flex manipulation is the container's structure: a grid's tracks, or a flex container's child order.
This file translates the two engines into one shape: the alignment rows and which manipulation component to mount (`apps/desktop/src/hud-layout-editing/layout-sides`).
It reads the view store for the overlay flag, which is editor state, not document state.
Switching engine is a conversion through `engineSwitchPatch`; a fresh container through a merging patch left the other engine's keys behind and crashed the layout pass.
A gap cell writes one axis and leaves the other alone, the same rule a tile follows.
`onPatch` writes this container only. A child's cell belongs to that child's Placement section.
`onDrop` is the one route a reorder takes, since moving a node is `applyDrop`'s job, and a grep test enforces it. A harness without the view leaves it out and the strip is read only.

## apps/desktop/src/views/HudLayoutEditor/sub-components/LayoutSettings.tsx

Section one: the type, and what is true of every container.
It keeps the maintainer's rule that options go by concern and nothing in a section changes when another option in the same section is clicked.
An earlier version grew a second gap field and an overlay piece when the type changed; both engines now store `gap: { x, y }`, any container has a `guide`, and the overlay draws a flex container's slots.
Type is `flex | grid`; pressing it only lights the other button, and everything else it does happens in later sections.
Gap is `↔` and `↕`, two `ValueField`s under both engines; `x` is always horizontal and `y` always vertical.
Overlay is the toggle and the guide swatch under both engines; a grid draws cell boundaries and a flex container its children's slots, in the container's own `guide.color`.
Labels sit beside each control, because the row is 26px tall and a word costs about 30px of width where a label line would cost about 14px of height three times.
The two gap cells share a host box (`.hud-layout-set__gaps`), so a formula typed in one floats over the other instead of pushing it to a new row.
It is titled `Container`, because the accordion around it is already called Layout and `LAYOUT / LAYOUT` read as a stutter.

## apps/desktop/src/views/HudLayoutEditor/sub-components/LayoutSettings.type.ts

The section's props name no engine anywhere, so pressing Type changes only which button is lit.
A gap cell's `cap` is the glyph in front of the field, always horizontal for `↔` and vertical for `↕`; `label` is its accessible name, such as `gap x`.
The overlay's flag belongs to the editor (the view store) and its colour to the container.

## apps/desktop/src/views/HudLayoutEditor/sub-components/LayoutSettingsPiece.tsx

A labelled piece of section one: a word, then the control, on one line.

## apps/desktop/src/views/HudLayoutEditor/sub-components/MinMaxField.tsx

A lower and an upper limit on each axis, as two optional ranges in two rows.
It replaced separate `min` and `max` groups with four checkboxes and four sentences; a checkbox in front of a field says what the field can already say.
A limit is cleared by emptying the field, through `ValueInput`'s `onClear`.
An emptied limit deletes its key instead of zeroing it, because `min.w = 0` is a real constraint that pins a `fill` child open at nothing.
An emptied limit leaves the document identical to one that never had it; emptying both axes deletes `min` or `max` itself.
`{ w: undefined, h: 4 }` and `{ h: 4 }` are different documents on disk, since the first keeps a `w` key through JSON, so a cleared axis is deleted.
A limit may still be a formula, typed with `=`.
A limit is a size in HUD pixels, so it moves by the editor's step.

## apps/desktop/src/views/HudLayoutEditor/sub-components/MotionSection.tsx

One section for animations, transitions and enter and exit, three shapes of how a node moves that were hard to find apart.
An animation runs on its own clock, a transition fires when a bound value changes, and enter and exit cover a repeat gaining or losing a child.
Three subsections, one open at a time, each header stating its own count.
The open animation card lives here, so switching subsections keeps the card selection.
`warnings` holds `packages/hud/src/layouts/validate-motion-warnings`'s lines for this node, already filtered.

## apps/desktop/src/views/HudLayoutEditor/sub-components/MotionTransport.tsx

Play and scrub against the real stage, so an animation can be seen without saving and watching the game.
It drives the stage's one clock, the one `HudNodeRenderer` samples every animation against, so what moves is the real HUD; a separate mini preview would be a second implementation of motion.
Play loops over one span, the longest `delay + duration` on the node, so a stagger in a repeat plays from the first instance's start to the last one's finish.
Under reduced motion it is disabled and says so, because every animation is silenced then and a dead button would look broken.
A running preview is the innermost surface, so `Escape` stops it and leaves the editor open; it registers at the `dialog` level, only while playing.
Outside the editor's provider, such as a test fixture, there is no stage, so nothing is drawn.

## apps/desktop/src/views/HudLayoutEditor/sub-components/NodeInspector.tsx

The selected node's properties in eight collapsible sections, in order: Identity, Placement, Layout, Size & Box, Appearance, Content, Data, Motion.
Only sections that apply render: Layout only for a container, Content only for an element.
Each collapsed header carries a `● n` bound count badge, so the panel can be scanned without opening anything.
Animation and Transitions became one Motion section with three subsections; its badge adds the two old counts.
At most `MAX_OPEN` sections are open; opening another closes the oldest, which is how eight sections fit in 232px.
Selecting a different node resets to a default pair of open sections.
The screen has no parent and no size to argue about, so Placement is hidden for it and Size & Box is locked.
`otherIds` is every id except this node's, which the id field checks duplicates against.
A formula in a repeat's subtree produces `count` values; the instance scopes are computed once here and passed through `FormulaScopeContext`.
`onDrop` is the editor's one reorder door: Layout's flex strip moves a child, and only `applyDrop` may call `moveNode`, so the intent travels up.
`reflowWarnings` are the reflow warnings from `packages/hud/src/layouts/validate-motion-warnings` for the whole document, filtered here to this node.

## apps/desktop/src/views/HudLayoutEditor/sub-components/NumberCell.tsx

A number in a narrow cell, such as a box model edge or an extent beside its unit.
It is a `TextInput`, not a `NumberInput`, because a spinner column takes 29px, which is the whole edge cell; four spinners in a row left 3px of typing surface at the 188px rail.
The arrow keys still nudge, by the editor's step, since every number here is in HUD pixels.
It keeps a draft, because `-` and `-1` are on the way to `-12`; what parses commits and what does not waits.
Empty clears the edge, so a box that was only looked at does not grow four zeroes.
`readOnly` marks a number another section owns, with the reason in `title`; `placeholder` states what blank means, `0` for an edge and `auto` for an extent.

## apps/desktop/src/views/HudLayoutEditor/sub-components/OffsetField.tsx

Where a node is and how to move it: two numbers, negatives allowed, wired to `margin.left` and `margin.top` through `apps/desktop/src/hud-layout-editing/offset`.
Under a flex or grid parent they displace the node from where the flow put it.
`PositionInput` is the primitive, with its shell, caps and draft rules (a half typed `-` survives, a commit never emits NaN); this adds only the meaning.
The label is "offset" with the reference frame in the hint, because "offset" alone would read as an absolute screen position.
`PositionInput` gets no `label`, so it does not draw a second caption; each axis is named by its own cap.

## apps/desktop/src/views/HudLayoutEditor/sub-components/OutlinePanel.tsx

The document as a tree, screen root, band, container, element, with drag to reparent and reorder.
It replaced "five handles": a tree cannot be edited by dragging boxes on a stage, because what moves is a node's place among its siblings and its parent.
The drop is resolved in `apps/desktop/src/hud-layout-editing/drop-intent`, not here; this file only says which row the pointer is over, the one question only the DOM can answer.
The screen is always the first row, at depth 0, and the only root; it is never dragged or removed. Everything below it drags, including the former regions.
Every row with a subtree can collapse on its own, expanded by default; collapse state lives in the view store, never the document.
The row list is the scroller, so the label and hint stay put and the two 24px pan bands are sticky children of the list, drawn instead of discovered.
It is reachable without a pointer: four shortcuts on a focused row, a context menu that teaches them, and one `aria-live` region reading the ghost's words, written here and nowhere else.
The spring load is settled from `commit` through a ref, before the drop, so rows the drag opened close again except the one it landed in.
A refused drop has no row highlight; the ghost card turns and names both nodes instead.

## apps/desktop/src/views/HudLayoutEditor/sub-components/OutlineRow.tsx

One line of the outline: what the node is, and every handle the gesture needs.
The whole row is both the drag source and the drop target, so the tree is edited with one gesture.
The drop it promises is a class on the row, not a separate indicator, so the line the pointer shows is where the drop lands.
It binds one pointer handler: it arms the drag and names its id in `data-outline-row`, which the panel hit tests once capture is taken.
A slot number past the previewed scheme is a note, never an error; the node still draws, just empty.
A row with a subtree gets its own disclosure triangle outside the name button, since a button cannot nest a button; the parent owns collapse state.
The triangle is an SVG path, because `▸` and `▾` font glyphs read as dots at this row height; one shape rotates when open.
The two inside halves reuse the before and after edge lines instead of a third mark.
The context menu opens from right click and from the platform's keyboard gestures, the `ContextMenu` key and Shift+F10.
`cell` is a badge naming the root grid cell; the cell is edited in Placement.
A locked row (a repeat's child or a switch case) neither drags nor takes a drop; removing it removes its whole case.
The screen is never a drag source but stays a valid drop target.
`springing` turns the caret over the spring load wait; `shaking` marks a keyboard move with nowhere to go.

## apps/desktop/src/views/HudLayoutEditor/sub-components/OutlineRowMenu.tsx

The row's context menu is the only place the four move operations are spelled in words, so it is where the shortcuts are learned.
Each item prints its key with `primaryModifierLabel`, so the label always matches the key that works on this platform.
A dimmed item that names its precondition teaches the rule, such as `Move into hearts` going grey or becoming `Move into...`.
It needs no key handling: `DropdownMenu` registers at the `menu` dismiss level, below a popover opened from it and a live drag, above the editor layer.
`removable` matches the row's own remove button: a repeat's child and the screen cannot be removed.

## apps/desktop/src/views/HudLayoutEditor/sub-components/PaintField.tsx

A `Paint`: a flat colour, a gradient, or a tiled or stretched image.
The old row spent 75% of its width on a kind `Select` and left the hex field 13.9px, so colours clipped to `#f(`; the colour half is now `ColorField` and only the kind switch remains, as three icons.
The kind switch is opt in: borders, outlines, tints and shadows are flat colours in every shipped document, so only the background passes `kinds`.
A document that already holds a gradient where a colour is usual gets the switch back automatically, so its value is never silently flattened.
So every flat colour in Appearance is one `ColorField`: background, border, outline, tint, every shadow, and every gradient stop through `GradientRamp`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/PlacementSection.tsx

Answers where this node is and how to move it.
Offset comes first, as in other inspectors. It writes `margin.left` and `margin.top` (`apps/desktop/src/hud-layout-editing/offset`).
There is no `order` field: the outline's drag reorders siblings.
There is no nine anchor dropdown; a former region is a child of the screen's grid, so moving it is picking a cell.
`CellPicker` shows the parent's grid and writes only this child's `place`. It cannot edit a track, and the grid editor cannot edit a child.
The self alignment pair lives here because where inside the cell is the child's own property.
Under a grid parent both axes apply; under flex there is one cross axis and `justifySelf` is ignored.
`parent` is the real container after any repeat or switch ancestor expands, `null` only for the screen.
`onSelectNode` selects the parent, which is how its Layout is opened.
A flex parent has no lattice, so `FLEX_STANDIN` is drawn behind the scrim to show what the control would be.
`engineOf` names the cause shown on the scrim. A grid parent never reaches it.

## apps/desktop/src/views/HudLayoutEditor/sub-components/PresetBar.tsx

Where a layout comes from, and where it goes.
"Start from" restyles the draft and keeps its identity, so browsing cannot lose a named, saved layout; nothing writes until Save.
A shipped preset is code, not data, so Save on one forks it, and the button says so.
An invalid expression anywhere blocks Save: the caller runs `validateLayout` on the whole document, both Save buttons disable, and the first problem is named.

## apps/desktop/src/views/HudLayoutEditor/sub-components/RatioPicker.tsx

Which display the layout is judged on.
The stage re-runs the same layout pass at the chosen aspect, with no scaling or letterboxing, so a group that only fits at 21:9 or a wallet that falls off at 4:3 shows while authoring.
It is a row of chips, because the point is to flick between them and watch what moves.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ReferenceField.tsx

One shape for every reference to something else: the thing itself, its human name, and a caret; the whole row is the trigger.
It generalises what the sprite field already did; four other places printed identifiers such as `DPAD` or `generic · A` although the editor owns the picture.
A picture referent draws through `src`, falling back per image; a typeface has no picture, so `specimen` renders sample text in that face.
There are two actions: `pick` opens a picker for a sprite, glyph or button face; `go` selects a subtree (a switch case or a repeat's child), which is edited in place.
It owns no picker: the caller mounts it as `children`, anchored to the ref, so this file knows nothing about manifests, packs or schemes.
`kind` is the dim half of the label, the kind or id.
`compact` fits the reference on one line inside a card.

## apps/desktop/src/views/HudLayoutEditor/sub-components/RepeatContent.tsx

`repeat` edits its `count`, the `item` expression each pass gets, and its one `child`.
The child is a whole subtree, edited by selecting it in the outline, so this only jumps there through a `ReferenceField` with the `go` caret.
`count` is read in the repeat node's own ambient scope (`packages/hud/src/layouts/validate-dynamic-node`: a repeat's child is inside the repeat, its count is not).
`item` is always checked as inside the repeat, since it is read per pass.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SectionAccordion.tsx

One collapsible section of the inspector; these keep a panel of about thirty properties scannable at 232px.
The header carries a `● n` bound count badge, so an active section shows without opening; it is never shown as `● 0`.
Open state belongs to the parent, `NodeInspector`, which closes the oldest section when too many open.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SelectionLegend/behavior/cap-label.ts

`{mod}` is the platform's own word. The command glyph reads as a cap and `Cmd` reads as text, so the Mac label is the glyph and everything else keeps the word.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SelectionLegend/behavior/legend-entries.ts

Every shortcut the table declares, as data, so a test can assert the legend is a property of the table, not a second copy of its strings.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SelectionLegend/SelectionLegend.tsx

Band 3: one or two short lines under the drawing saying what is selected and what can be pressed now.
It is drawn, not spelled: keys are `KeyCap`s and the pointer is a `MouseGlyph` with the relevant part lit, so the strip is scanned, not parsed.
The modifier cap says the Mac command glyph on a Mac and `Ctrl` elsewhere, from `primaryModifierLabel(os)`, the same answer `isPrimaryModifier` gives the key handler.
Every entry is an action table row with a shortcut.
A refusal shows here, the only place in the control that says no, as `role="status"` so a screen reader hears it without the focus moving.
It is a fixed height strip: the status truncates with its full sentence on `title`, so the legend swaps its text instead of reflowing the band below.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SelectionToolbar/SelectionToolbar.constants.ts

`NO_SELECTION` is the grid's wording, kept as the default because every existing test presses it and it is what the lattice means.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SelectionToolbar/SelectionToolbar.tsx

The contextual toolbar is one row with one subject and only buttons in it: insert, move and remove, the things that act on what is picked.
Engine, guide, gap and item alignment are sections one and two; add column and add row are the lattice's trailing plus buttons.
It is one row at every rail. A track's size control now sits on its own header (`TrackHead`), since an 81px extent field here pushed five buttons onto a second line at 232px.
The leading chip names what it acts on: `COLUMN 2`, `ROW 1`, `3 CELLS` under a grid, `ITEM 2`, `3 ITEMS` under flex. With nothing selected the chip is `null` and one muted hint shows in the same reserved height, so the drawing below never moves.
The hint is the caller's words. The grid's wording told flex users to pick a column in a control with none.
It is `aria-live="polite"`, so a screen reader hears it fill in after a press elsewhere.
It reuses `.hud-toolbar`, `.hud-toolbar__button` and `.hud-toolbar__sep` from the screen toolbar, so the two stay the same kind of toolbar.
`chip` is what the actions act on. `actions` holds actions on the selection only, empty when there is none. `hint` is what to say when nothing is picked, in the mounting control's own nouns.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SelectionToolbar/sub-components/ActionButtons.tsx

The toolbar's buttons, with a separator wherever an action's `group` changes, so grouping is a property of the action table.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ShadowListEditor.tsx

`HudBoxStyle.shadow` is a list, because a box may stack several, such as a sheen and a drop.
`+ add shadow` once sat under `radius` and read as part of it, and each shadow was five bare rows; each shadow is now a collapsed `SubsectionGroup` showing its values and a colour chip.
The open group belongs to the section: `AppearanceSection` holds one `openKey` across Background, Border, Outline, Tint and every shadow, so only one is open at a time.
`shadow-<i>` is this list's key namespace.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ShapeContent.tsx

`shape` draws the two named pictures, `heart` and `magic-bar`, that a sprite, switch or tint cannot draw.
`fill`, `armor` and `bands` are bounded scalars drawn as their range.
The ranges are the renderer's real ones: `HudHeart.constants` clamps `armor` to `HEART_TINTS.length - 1`, which is 2, and `HudShape` floors `bands` at 1 for the half magic upgrade's two bands.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SidesField.tsx

Which sides a border draws on, drawn as the box it is about.
It replaced four checkboxes that ran together as one string; the value is a position, and a position is drawn, as in the box model.
Each edge is a real button with `aria-pressed`, so each bar is its own control; the bars are 7px thick because 3px is not a hit target.
Absent means every side (`packages/features/src/hud-style`), so the first uncheck seeds the other three as on, the rule shared with `EdgesField`, whose side list it reuses.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SizeBoxSection.tsx

Size, then limits, then the box, then the transform: `ExtentField` twice on one row, one `MinMaxField`, one `BoxModelField` and `scale`.
Margin left and top are the node's offset and Placement owns them, so they show dimmed in the ring with the reason.
The screen's lock is one `DisabledReason` scrim over size and limits, with the margin ring locked and `scale` read only.
The screen's padding, the one thing it authors, stays live outside the scrim. `inert` on the covered subtree takes it out of the tab order.
`isScreen` marks the whole screen root.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SlotChips.tsx

`dimWhenEmpty` is a list of slot numbers, edited as a list.
It replaced a text box of comma separated numbers that re-parsed on every keystroke and dropped fragments; the value is `number[]` in `packages/hud/src/types/hud-node`.
It is not `TagInput`, which is a string vocabulary with suggestions and validation; only the shape of removable chips with an entry is borrowed.
The entry is always visible, because the number field is the add button.
Duplicates and zero are refused and the list is sorted, because it is a set.
`readOnly` shows chips derived elsewhere that nothing edits.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SlotContent.tsx

A `slot` element draws the item sprite a slot holds, wherever the author places it, with any number.
`SlotRefField` shows what the number draws and speaks only when there is something to say.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SlotPickerPanel.tsx

The Slot insert, never a fixed range: slot numbers are not validated against a device, a keyboard alone reaches 107 glyphs, and slot 40 can be placed with nothing plugged in.
It offers the previewed scheme's numbers as a shortcut, plus a numeric field with no maximum.
The toolbar asks which kind of object to make for a number, so each row has two actions; `SlotRefField` asks only for a number, so `onPickNumber` collapses each row to one click.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SlotRefField.tsx

A slot number, showing what that number currently draws.
Three fields (the `slot` element, a glyph by slot, a button's slot bind) once repeated the same "any number" paragraph; that is a policy, not a hint, and it is gone.
The policy is unchanged: uncapped, 1 based, never checked against a device.
Only a consequence is shown: a number past the previewed scheme says in one line that it draws nothing here and is still legal.
With no scheme previewed there is no claim to make, so no note is drawn.
It previews the glyph, never the item, even for the `slot` element: the glyph is stable for the scheme, while the preview deals random items on purpose.
It is built on `SlotPickerPanel` and takes props with no store, so other slot fields can reuse it.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SpriteContent.tsx

A `sprite` element's file, picked by sight and shown as its thumbnail and label, not a slug in a text box.
This row invented the `ReferenceField` shape, which now serves glyphs, button faces, switch cases and repeat children.
The sprite's natural box is not asked for: `intrinsic-size.ts` reads it from the manifest (`SPRITE_BOX_BY_FILE`), and `spec.box` still round trips for older documents.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SpriteExtractionNotice.tsx

The one place every sprite picker says sprites are not fully extracted for this ROM, with a one click fix, instead of blank tiles.
`SpritePicker` is a design system composite with no store, so this View tier component reads `sprite-availability-store` and runs extraction.
Callers pass it as the picker's `notice`; it renders nothing once sprites exist.
It is the popover sized version of `HudStyleControl`'s notice and extract pattern.

## apps/desktop/src/views/HudLayoutEditor/sub-components/StageFlexEcho.tsx

The same echo for a flex container's picked children.
There is nothing to solve: a child's placed rectangle is what the strip pointed at.
Every expanded copy whose authored id was picked lights up.

## apps/desktop/src/views/HudLayoutEditor/sub-components/StageGridEcho/

The stage's echo of what is selected in the grid editor, for "click a cell, see it in the layout", and nothing else.
`pointer-events: none` on the layer matters: the surface it replaced was clickable, and that was removed on purpose.
Geometry comes from the engine's solve through `stageCellRects`, not from where children landed, so an empty cell still has a rectangle to point at.
A repeat's copies all echo, because one template became N boxes.
`hull` is the bounding box of the selected cells.

## apps/desktop/src/views/HudLayoutEditor/sub-components/StageSelection.tsx

The picking layer over the stage: one hit box per placed node, an outline round the selected one, and a measured `W×H` badge.
It sits over the art and every rectangle comes from the engine, so what is clickable is exactly what was drawn.
The stage only selects; the maintainer asked to select on the stage but not drag, so the margin nudge and the scale handle are gone.
Position is edited in Placement's `OffsetField` and scale in Size & Box, both by keyboard, so nothing is written by accident while picking.
A press selects on the way down, with no slop threshold.
The screen root is an ordinary pick, since selecting writes nothing; it is how the screen's Layout section is reached.
A press that finds a box stops propagation, because the stage's own press clears the selection.
`data-node-id` names each placed rectangle, so the layout options specs in `apps/desktop/tests/e2e/hud-layout-options` can read real positions after a gap or reorder change.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SubSection.tsx

A section is a title, a gold underline, and the content under it, as the maintainer asked.
There is no box: no border, no sunken well, no radius; the content sits on the panel's own background.
An earlier version nested three framed surfaces around one list of fields.
It is the accordion's idiom one step quieter: `--c-gold` instead of `--c-gold-bright`, over a 1px rule, so it belongs to its section.
The title is printed uppercase by the sheet, so pass it in sentence case.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SubsectionGroup.tsx

One level down from `SectionAccordion`, applied inside Appearance, the longest section.
Border, Outline, Tint and each Shadow were sub editors behind a plain `Toggle` that looked just like a boolean.
The header states the value, such as `2px solid` beside a colour swatch, so the active group shows without opening; `apps/desktop/src/hud-layout-editing/appearance-summary` owns the wording.
The enable checkbox is a sibling of the trigger, because a checkbox in a button is invalid and unreachable by keyboard.
Turning a group on opens it in the same gesture; the caller does this, since it enforces one open at a time.
A group that is off cannot be opened, because there is no value behind it; the trigger is disabled and the summary says `off`.
Without an enable box a group is always on, such as a shadow card that exists because it was added.
`action` is the control at the far right, such as removing a shadow, never the expand gesture.

## apps/desktop/src/views/HudLayoutEditor/sub-components/SwitchContent.tsx

`switch` passes straight through to `CaseListEditor`, which owns the case list.
A case's `when` is checked under the switch node's ambient `insideRepeat` (`caseAt` in `packages/hud/src/layouts/validate-dynamic-node`), because a top level switch such as the arrow preset's `silver_arrows` gate has no `index`, `count` or `item`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/TextContent.tsx

A `text` element is a string or a number, drawn in the game's extracted glyphs or a real font.
A counter is a text with a numeric value and zero padding, the toolbar's Counter button, not a separate kind.
The old `text | ƒx` switch destroyed values on a round trip; `TextValueField` is one field where a leading `=` means formula.
Digits and pad apply when the value resolves to a number, a bound expression or a typed numeral, so they are offered only then.
The HUD digits sheet has digits only, and the field now says so.
The content sheet is imported here, because the face specimen uses `.hud-ref-field__specimen`.
Tracking is a number input, not a slider: it is extra letter spacing in SNES pixels with no bound anywhere in the model, validator or renderer.

## apps/desktop/src/views/HudLayoutEditor/sub-components/TextValueField.tsx

A `text` element's value as one field, which also removed a data loss bug.
Two stacked mode switches once wrote `''` or `{ from: 'data', expr: '0' }` over the value, destroying formulas with no warning.
It is the same input as `ValueInput` without assuming a literal is a number: a leading `=` means formula and is never stored, `==` escapes a literal `=`, and anything else is a string (`apps/desktop/src/hud-layout-editing/value-text`).
It is not `ValueInput` itself, because `ValueInput` speaks `Value` and this is the one property typed `Value | string`.
Both share the rule, `readExpr`'s errors, `FormulaFeedback`'s result line and `FormulaProblem`'s follow ups.
The result shows the moment the formula compiles.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ToolbarMenu.tsx

One small icon toolbar button and what it drops: a plain `DropdownMenu` list or a custom panel such as a picker grid.
It is icon only with the label in `title`, so a dozen fit in one row.
Only one menu is open at a time, so open state belongs to the parent.
A custom panel owns its own dismissal. Icons are Lucide through `@iconify/react`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/TransitionsSection.tsx

The second Motion block: value transitions, which ease instead of snapping when a bound value on this node changes.
All six properties are offered; the ones nothing drives are annotated on their row instead of being left out.
The empty state covers this list only, and `EnterExitEditor` is a sibling block that always renders.
`HudTransition` carries one duration and one easing for the whole list, so they are one pair beneath the rows, labelled as shared.
Per property timing would change the type, the validator, `packages/hud/src/engine/bake-values/bake-animation.ts`, `resolve-node-transition.ts` and every saved document.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueField.tsx

One control wherever a number is accepted, now a thin wrapper over `ValueInput`.
The old `123 | ƒx` switch is gone; a leading `=` means formula and the field is always typed.
The prop shape is kept, so about 25 call sites did not change.
Typing `=` before `24` seeds the formula with the digits, and deleting `=` leaves them to read as a number.
A number with no `step` moves by the editor's step from `editor-step`, so gaps, margins, offsets and sizes nudge alike; a field passing its own `step` keeps it, such as `opacity` at 0.05.
Pass a `step` only for numbers that are not pixels: fractions, counts, milliseconds.
`aria-label` names the field when its visible label is a glyph in the caller's row.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/behavior/prefix-at.ts

The identifier the caret sits at the end of, which the completion filters on. It is empty after anything else, so nothing but values is offered right after a `(`.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/behavior/summarise.ts

A gate reads back as 1 or 0, so "true on 3 of 20" is the summary; a measurement reads back as a spread, so its two ends are.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/behavior/usePromoteOverlay.constants.ts

`HOST_SELECTOR` is the box the overlay spans: a pair's `.hud-inspect__row`, or the gap cells' `.hud-layout-set__gaps`. Anything else falls back to the field's parent, never the whole panel.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/behavior/usePromoteOverlay.ts

A formula being edited expands over its siblings and never pushes them.
The field's box is frozen and its control floats: the root keeps its exact height so the row does not change, and `.field__control` is lifted out of flow, spanning the row above its neighbours.
It measures on focus, not on promotion. On promotion the floating class is already on, and the field is already taller because a `=` adds a result line; measuring then reserved 7px the field never had at rest and moved the other half of the pair down.
A field that was already a formula is measured with its result line, since that is its resting look.
One measurement per edit, so the overlay does not chase the result line it grows.
`focused` says when to measure and `formula` when to float. The class and numbers stay empty until the resting geometry is read, so no frame is half promoted.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/behavior/usePromoteOverlay.type.ts

`PromoteBox` holds custom properties for the sheet, so the rule that floats the control lives in CSS and the hook only answers where.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/behavior/useValueInput.ts

The seven states of `ValueInput`, as one draft string and two booleans.
A number commits on change, so dragging the spinner tracks on the stage. A formula commits on blur or Enter, so a half typed one never reaches the document or flashes the stage to zero.
Emptying an optional field commits on change too, since an empty field is not half typed and waiting would leave the stage showing a removed limit.
With the menu open, Escape belongs to the menu on the dismiss stack at `popover`, so this handler leaves it alone. With the menu shut, the field abandons the edit and calls `preventDefault()` so the panel behind does not close too.
Arrows nudge a bare numeral and are left to the completion list in a formula.
`insert` replaces the identifier under the caret or inserts at it, never appending to the end.
`dirty` marks an edit that has not reached the document.
`onClear` is for optional properties only. Without it an empty field is a draft that never commits, with the placeholder saying so.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaFeedback.tsx

Everything under a formula in the order wanted: the result, the instance strip when there is one, the names it reads with their live values, and a warning when the number is legal but unintended.
The result is withheld mid edit, never guessed.
Amber is not red: a formula that parses and names only known variables can still return a number nobody meant. `ceil(life_max / 0)` folds `Infinity` to the safety ceiling in `resolve-value.ts` and returns 1,000,000.
`result` is null while the formula is mid edit or does not compile. `outOfRange` is set outside the field's accepted range.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaMenu.css

The formula menu's sheet. `ValueInput.tsx` imports it, with `InstanceStrip.css`, right after `ValueInput.css`, so the cascade order is the one the single sheet had.
The variable list is a popover with a filter because eighteen names is about 290px, taller than most sections.
A name out of scope is listed and explained, never dropped, so an author who saw `index` yesterday does not think the editor is broken.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaMenu.tsx

The variable menu, the autocomplete and the starting points are one list with two triggers.
It is a popover, not a docked panel: eighteen names is about 290px, taller than most sections at the rail. Typing a letter filters the same list.
It registers at `popover`, so Escape closes the menu and leaves the field and editor alone.
`&&` and `||` appear nowhere; `||` was a silent wrong number bug until `concatenate: false`.
`filter` is the identifier under the caret; empty opens the menu unfiltered.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaProblem.tsx

The three lines after a translated expression error: the one click replacement, the did you mean, and the column.
It is shared by `TextValueField` and `ValueInput` so both report errors the same way.
A fix is a whole replacement expression, never a patch, so it cannot half correct a formula. `onFix` applies `fix.expr` as the whole expression.
`problem` is null when the formula parses and names only known variables.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/sub-components/InstanceStrip.tsx

A formula inside a `repeat` produces one value per instance. The strip shows one cell per instance with a reading beneath, a quick check that a slice formula is right.
It is a strip, not a table, which would not fit a 232px rail; the shape of the run is the answer.
It caps at `MAX_CELLS`, 20, and says so, since a repeat's count can resolve to hundreds.
`previewIndex` is the instance the stage previews, outlined in the strip.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/ValueInput.css

The field mirrors `.number-input`'s geometry: one bordered box with a borderless field and a flush spinner column. It cannot be a `NumberInput`, whose `<input type="number">` cannot hold a formula.
The five `--ctl-*` values are the compact tier's seam from Tessera's TextInput stylesheet, set here because this control is always `sm`.
A formula is a state of the field, shown by a cool border and mono text, as in After Effects, Blender and Unity.
The field selector uses two classes because the field is also a `TextInput` with `.text-input`; one class would tie on specificity and depend on bundle order.
A derived or read only field is dashed and dim but readable.
The spinner exists while the text is a bare numeral, so it comes and goes as `=` is typed and deleted.
The `=` chip is 12px on the focused row only.
Promotion: the root keeps its resting height (`--promote-height`) and the control is lifted out to span the row. Both numbers are measured before the class lands.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/ValueInput.tsx

One always typed field in place of the old number or formula mode switch. `24` stays a number; `= life_current / 8` is a formula. The leading `=` says formula and is never stored (`apps/desktop/src/hud-layout-editing/value-text`).
No chip at rest: there is no switch, chip, border colour or hint until focus. The `=` button appears on the focused row only. A resting chip was 19% of a half width field on about thirty rows.
One `<input>`, never swapped, so focus and caret survive typing `=`. The spinner is drawn here instead of using `NumberInput`, whose `type="number"` cannot hold a formula; the spinner and arrow keys depend on the current text, not on a remembered mode.
A formula being edited in a half width field floats over its row as an overlay with its own box frozen at its resting height, so nothing beside it moves (`apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/behavior/usePromoteOverlay.ts`). Giving the field `flex: 1 0 100%` once pushed the sibling onto a new line.
The spinner buttons are named after the field, from `aria-label` when the visible label is a glyph in the caller's row, such as the gap cells and `MinMaxField`'s limits.
The result shows the moment the formula compiles. A half typed `life_current /` does not compile, so `problem` withholds it.
`rangeNote` warns when a valid result is outside the field's own range.

## apps/desktop/src/views/HudLayoutEditor/sub-components/ValueInput/ValueInput.type.ts

A superset of what `ValueField` and `ExpressionInput` took, so both are thin adapters and their 30 or so call sites are unchanged.
`value` `undefined` renders an empty field, for an optional property with no value; only a caller that passes `onClear` should pass it.
`onClear` makes the field optional: emptying it deletes the key instead of reverting on blur. `Value` has no `undefined`, so the absence lives in the caller's document shape.
`scope` is the sample state's data scope the result previews against. `insideRepeat` says whether `index`, `count` and `item` are names here.
`extraNames` is only for `transition.when`, for its `delta`.
`role` picks which starting points to offer: a `count` is never offered a comparison and a `when` never a fraction.
`min`, `max` and `step` bound the stepper and the out of range warning.
`placeholder` states what leaving it blank means, such as `none`, `auto` or `0`.
`readOnly` is for a value the panel derived or another section owns, and `derivedFrom` says where it comes from.

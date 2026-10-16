<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/theme

Facts about `apps/desktop/src/theme/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/theme/dialogue-editor/lines.css

One paragraph is one line of the box.
Its height is pinned so a taller glyph cannot pull the line away from its gutter row.
Its width is not set, because a set width made a long line wrap and paint over the next one.
The paragraph is a block, not flex.
A flex container has no inline line boxes, so Up and Down moved the caret sideways and a copy put a newline between every letter.
The line height is set on the paragraph because `.game-text` sets a line height of 1.5, which came to 48px against a 32px row.
`white-space: pre` alone is not enough, since an inline atom is a break opportunity of its own.
Setting `white-space-collapse` and `text-wrap-mode` separately turns wrapping off there too and keeps the double spaces dialogue relies on.
The gutter is drawn by the node view inside the same paragraph as the text, so the two cannot misalign.
The caret never enters it.
The meter shows how much of the row's 168px the line has spent.
The pixel figure is what is left before the edge.
The character count uses the caret's own unit.
The line content span is an inline block.
As plain inline content, a decorated option line could break onto a second row inside the fixed height paragraph.
Option lines are dressed as the rows the player will choose between.
The first 8px cell of an option is the engine's cursor column, which the stored text spells with `>` or spaces.
The rule on the left joins the lines of one box and breaks after the line the player stops on.
Its width is left alone, because a thicker border would move the text without moving the ruler.
Line end markers are decorations with no place in the document, so neither the caret nor the widths know about them.
Each marker kind has a fixed slot on every line.
Drawing the wait control only on the caret's line moved the marker beside it by about 14px as the caret moved.
Markers ignore the pointer and selection.
Otherwise `caretRangeFromPoint` returned the icon and select all painted the symbols.
The wait marker is the one marker that is also a control.
Its off state means no wait yet, and it shows only on the caret's line, faintly.

## apps/desktop/src/theme/hud-layout-editor/appearance.css

Styles for Appearance's own controls: the collapsible sub group, the border's box diagram, the gradient ramp and the slot chips.
It is imported by those components, not by the view, so rules arrive with the components that need them.
A sub group's header is the whole design: a checkbox, a name, a swatch, the value in words and a caret.
An open group reads as raised, not as a second border, so a stack of closed groups and one open one scans as one list.
The trigger fills the row, so the whole line is the hit target.
An off group's name goes quiet so it does not compete with the groups that paint something.
The swatch's `background` is set inline because it is the value.
The summary is the only thing allowed to run out of space; it ellipses instead of wrapping, so the header stays one line.
The border sides box uses 7px bars because a 3px target cannot be hit; its dotted centre is the node's ink and not a control.
The ramp's inline background is the gradient being edited.
A stop is taller than the track and centred on its position, so a stop at 0 or 1 can be grabbed at the edge.
The slot chip entry is narrow: three digits cover every slot in the game.

## apps/desktop/src/theme/hud-layout-editor/bands.css

The two bands a manipulation section wears, shared by the grid and flex editors: the contextual strip above the drawing and the legend under it.
The class names keep their `hud-grid__` prefix on purpose. Several measurement tests pin these blocks by name at three rails, among them `hud-grid-strip`, `layout-bands.probe` and `hud-inspector-layout-widths`.
`.hud-toolbar.hud-grid__bar` has the same specificity as a descendant rule, so it still beats `.hud-toolbar`'s border and wash, and has no ancestor, so it works inside `.hud-flex` too.
The strip inherits `.hud-toolbar`'s flex, wrap and gap from `panels.css`.
It is sticky and so opaque: a translucent background showed the drawing sliding under its buttons.
It is flat: border, radius and wash are removed, since `.hud-toolbar` would draw one more box inside a section.
The reserved 26px height is on the chip and the hint, one of which shows in every state. A `min-height` on the strip would measure its content box and disagree with its padding.
The chip names the subject so icon buttons that appear on a press are legible.
Buttons are 26px, matching `icon-btn--sm`, which puts a cell's four inserts on one line at the 188px rail.
A move that cannot apply keeps its place and loses its ink.
The divider has no margins, since the strip's own gap already separates it.
The legend has two rows and swaps its text instead of reflowing.
The status truncates instead of wrapping; its full sentence is on `title`.
The key row wraps. When it scrolled sideways at 232px a legend ended mid word. The legend is last in the block, so a second line moves nothing.
One entry is a row so the picture and the word never wrap apart.

## apps/desktop/src/theme/hud-layout-editor/content.css

Styles for the Content section's controls, imported by `ReferenceField`, `SlotRefField`, `BoundedValueField` and `TextValueField`.
`.hud-ref-field` replaced the sprite only `.hud-sprite-field`, so the row shape lives in one rule.
A compact reference inside a card uses a one line tall picture.
`min-width: 0` on the name matters: a flex item does not shrink below its content, so a long label would push the caret past the rail.
The kind, or a subtree's id, is demoted but kept, so two sprite children stay distinguishable.
A specimen stands in for type, such as `07` drawn in the face being chosen.
The bounded field tightens the design system `Slider`, whose 16px gap and base size label suit a settings row, not a 188px rail.

## apps/desktop/src/theme/hud-layout-editor/drag.css

The outline's drag only: the ghost, the pan band, the spring load caret and the keyboard path's two signals.
The stage's drop surface rules were removed when the maintainer dropped that mechanic; there is no `.hud-drop` and no `nudge` tone.
The outline's scroll rules live here beside the pan band they exist for.
It is imported by `DragGhost` and `OutlinePanel`, not by the view.
Almost nothing animates: an eased ghost reads as latency and a fading indicator is wrong for 120ms.
The spring load caret is the one exception, because turning over the 500ms dwell is the only way to show waiting.
The ghost has `pointer-events: none` because a card under the cursor would take the drop.
The repeat warning line says the drop lands in a template that draws N times.
A refused drop turns the whole card, readable in peripheral vision.
The row list scrolls inside its panel, so the label and hint stay and the band has an edge to stick to.
The pan bands are zero height sticky children of the scroller, drawn only during a drag.
The spring duration here and `SPRING_MS` in `useSpringLoad` are the same number.
Nowhere to go shakes the row instead of announcing anything.
Both animations stop under reduced motion.
The `aria-live` text is clipped, not hidden, so it stays in the accessibility tree and takes no space.

## apps/desktop/src/theme/hud-layout-editor/geometry.css

The geometry half of the inspector: Position and placement, and Size and box.
Every rule is one the primitives cannot express, since a nested box model is a drawing.
The offset row only sets row participation; `PositionInput`'s shell lives in the design system.
`DisabledReason` tightens the composite's scrim, because a 232px rail cannot spend 16px of padding and a semibold line on a lock.
The extent field's unit suffix is a button and must not shrink; the number takes what is left.
Box model edge columns are elastic with a floor: fixed columns would waste the 289px rail and fold at 188.
The offset owned margin edges are dimmed and inert, not hidden, so the ring still shows what a margin is.
The link chain is padding's alone, because two margin edges belong to another section.

## apps/desktop/src/theme/hud-layout-editor/inspector.css

The accordion panel and the controls it is built from.
A section header's gold rule shows only when open, separating title from body.
A value field is a flex child of `.hud-inspect__row` and must be able to shrink; `.hud-value-field--wide` in `ValueInput.css` overrides the basis while a formula is edited.
`.hud-expr__live` serves `DataSection`, the one place in the panel that is a report, not a field.
Most `PaintField` layout moved to `Field size="sm"` and `Flex gap="2xs"`; what remains is a padded card, a border and an anchor's `position`.
A flex child's overlay slot is dashed and inset by a pixel, so it is never mistaken for, or drawn under, the solid gold selection outline.
`hud-inspector-property-rows.keep.test.ts` counts the `--space-2xs` uses in this sheet, and the suites in `apps/desktop/tests/hud/hud-layout-section-controls` check the slot is dashed.
The button state face rule went when faces became `ReferenceField`s.
The stage's measured badge remains; the snap guide went with the drag.
A repeat or switch embedded outline row is muted, since it cannot be dragged.

## apps/desktop/src/theme/hud-layout-editor/layout-set.css

Section one's packing and the flow row, split from `layout.css`.
Every piece is one row, so pieces wrap into as few lines as their widths allow and the gap piece takes the rest.
Each label sits beside its control, because the row is 26px tall: a word costs about 30px of width, a label line about 14px of height per piece.
The gap piece grows so the section is flush at both ends at the 320px rail.
`.hud-layout-set__overlay`'s `position: relative` anchors the colour popover.
The two gap cells share a box that a formula being typed floats over; `usePromoteOverlay` measures it, so the overlay never covers the `GAP` label, and both cells wrap together.
The flex flow row is icon buttons on the panel background with no border, wrapping at narrow rails, using the same `2xs` and `sm` gaps as section one.
`.hud-extent--bare` is the grid toolbar's bare extent wrapper.

## apps/desktop/src/theme/hud-layout-editor/layout.css

The Layout section's own controls: alignment tiles, the direction choice, the colour row and sub-sections.
It is imported by its components, not the view, so a control can move sections without anyone moving an import.
One row of tiles per axis; the 3x3 pad could not express a distribution and its nine 18px previews were unreadable.
The axis cap has a fixed width so both rows start at the same x, and is as narrow as `cross` allows; it is one tile tall so it centres on the first line of a folded row.
One track count for the whole component, `--hud-align-cols`, from the widest row.
Sizing rows separately drew the same control at two sizes, and wrapping with `auto-fill` let six tiles take three lines and grew the section from 150px to 420.
So tiles shrink, capped by `minmax(0, 72px)`, and `justify-content: start` leaves leftover space at the end of a short row.
The tile size rule is two classes deep so it beats `.icon-btn--sm`'s 26px square whatever order sheets load in.
Every tile has an outline, because unframed tiles read as one continuous wall of bars; the selected tile keeps its gold.
A diagram's `display`, `justify-*` and `align-*` are set inline, because they are the value.
Bars use `currentcolor`, so the selected tile's bars turn gold with its outline.
A flex tile's three bars are thinner than a grid's two.
A grid tile draws its cell divider, because `justifyItems` positions a child inside its own cell, the same dashed cell idiom as the lattice.
The colour row's `position: relative` anchors the popover, and a zero basis on the hex stops the swatch and field fighting over the row.
Sections are `sm` apart and items inside one `2xs`, so the air between sections is larger than within one.
A sub-section has no box, only a title over a 1px `--c-gold` rule, one step quieter than the accordion header's 2px rule.

## apps/desktop/src/theme/hud-layout-editor/motion.css

Styles for Motion: the keyframe track, the easing tiles, the transport and a transition row.
The rail is inset by a margin, not padding: a child with `position: absolute` resolves `left: 0%` and `100%` against the padding box, so padding would not keep a diamond inside.
With a margin, the space the pointer is measured in and the surface the author sees are the same rectangle, and the 11px diamond at `at: 1` hangs into the margin.
Each key's `left` is set inline, the one computed value here.
The transport only stops the play button from stretching; the slider fills the rest.
An `input[type=range]` has an intrinsic width of about 129px, its automatic minimum on a flex item, and `Slider`'s gap adds 16px.
Before the slider rules here it overflowed the rail by 14px at 232 and 36px at 188; `Slider` itself is left alone because settings screens have the width it assumes.

## apps/desktop/src/theme/hud-layout-editor/outline.css

The outline and inspector panel shells and the outline rows, split from `panels.css`.
Both rails are bordered, rounded and shadowed so they read as panels floating over the stage.
`--shadow-lg` is the design system's weight for a persistent panel, as in `DialogShell` and `Drawer`; popovers use `--shadow-dropdown`.
`--radius-md` matches `DropdownMenu`'s floating surfaces, one step above the stage's `--radius-sm`.
The row list scrolls inside the panel; the scrolling rules live in `drag.css` beside the pan band.
Rows set `user-select: none`, because the pointer based drag no longer gets that from `draggable`.
A row with no subtree gets a blank the width of the disclosure triangle, so names line up.
The triangle rotates a quarter turn when open, so the silhouette stays the same and only the state changes.

## apps/desktop/src/theme/hud-layout-editor/panels.css

The insert bar, the inspector's rows and the stage's pick boxes.
A formula being edited in a half width pair sets `flex-basis: 100%` on itself, and `flex-wrap` on `.hud-inspect__row` lets its sibling drop to the next line.
The extent and edge rules set only flex behaviour; the column and its label gap come from `Field`.

## apps/desktop/src/theme/hud-layout-editor/pickers.css

Icon only toolbar buttons are square, because the label lives in the tooltip.
Picker panels float over the stage's ground and live art, so they need an opaque surface (`--c-surface`, as `DropdownMenu` uses), plus a border and shadow to read as floating.
Extra right padding keeps tiles clear of the reserved scrollbar gutter.
A panel flipped above its trigger is shifted up by its own height after layout, as `Select` and `TagInput` do; see `SpritePicker.css`.
`TabBar` scrolls past its own edge, so the tab wrapper only stays out of its way.
Tile rules are two classes deep so they beat the bare `Button` rules whatever the import order.
The slot picker is a numeric entry above a list, never a fixed grid.
`.hud-sprite-field` was replaced by `.hud-ref-field` in `content.css`.

## apps/desktop/src/theme/msu-studio/msu-studio.css and apps/desktop/src/theme/msu-studio/msu-files.css

The sound row channel tag has a fixed width so the ids beside it line up, and is monospaced so the tag reads as a port name. A slot or sound row is one dense line: the whole row selects it and only the preview buttons sit outside the press target. The selected row is tinted and marked at its left edge, two classes deep so it beats the striping.

The files list scrolls with the editor's body, and its header is sticky on the body's sunken ground, so it stays put while the list moves under it. One column template (`--msu-file-cols`) serves the whole files list: the header and the cards read it, so they cannot drift apart. The header is a label strip, not a table head: no rules or frame, so what sits under it still reads as cards. Its transparent border matches the card border so the two share one column origin. The card is the entry and the player expands inside it; there is no striping, which would read as a table.

## apps/desktop/src/theme/store/store.css

The Hookshop pages share one sheet, because each page is its own view and a component imports only its own stylesheet. The frame fills the hub page and each part scrolls inside it.
Cards fill the pane's width in as many columns as fit.
Browse uses the master detail layout with its columns swapped, so the card grid takes the width.
Signed out, Home is one centred column: the store's art over what signing in is for, then the button.
A waiting link from the site is said in gold and framed so it is not missed.

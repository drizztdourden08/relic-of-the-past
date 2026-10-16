<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/compounds

Facts about `apps/desktop/src/compounds/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/compounds/CapacityFamilyRow/CapacityFamilyRow.css

Every line's label sits in one fixed narrow track so the family reads as a list, not a stack of
captioned controls. The controls of a line sit side by side while there is room: a slider takes
what is left, a dropdown or toggle keeps its width, and the curve keeps a fixed share so a long
preset label never squeezes the count slider. A note under a line is quieter than a problem and
louder than a caption. The ladder's label sits on the chips' baseline, not the control height.

## apps/desktop/src/compounds/CapacityFamilyRow/CapacityFamilyRow.tsx

One capacity family, read top to bottom as a list of named lines. The head sits on the same label,
control and impact grid as every plain option row: the family with what its modes do under it in
the words of its catalog row, the mode dropdown, and the In Pool cell, so every control and In
Pool cell in the panel lines up. Under the head comes one line per fact: the Custom lines (range,
items, jumps) only while the mode is Custom; the pickup bonus whenever the family hands out
upgrade items (Custom or in pool); and the ladder in every mode, which says what the player
gets. The wallet has no vanilla upgrades to pool, so it offers no "in pool" mode. A
family a sibling setting decided (`forced`) renders inert with the reason in red under its head:
the controls grey out, the sentence does not, the same as a forced plain option row.
`CapacityRowState` holds ladder indexes and choices, never ladder values; the curve choice is a
generator, the free sequence or a named preset. `floorNote` says where the final max may not stop
below and what asks for it, so a thumb that snaps back is never a mystery.

## apps/desktop/src/compounds/CapacityFamilyRow/sub-components/BonusLine.tsx

The percentage a capacity upgrade hands over beside the ceiling it raises, and the switch saying
what that percentage is of. The catalog's clarifier sits under the two, because "of what" is
exactly what a percentage cannot say by itself.

## apps/desktop/src/compounds/CapacityFamilyRow/sub-components/LadderControls.tsx

The Custom mode lines of a family: the range (start and max thumbs on the family's legal tiers,
the readout beside them, the floor as the line's note), the items (the count between the floor
the item cap sets and the ceiling the pool allows, with the curve dropdown beside it, presets
under a divider) and, only while the curve is Free, the jumps. A span with a single possible
count reads as text, and a family without a curve (the meter) says so in the curve's place. A
`readout` render hands the same lines to LadderReadout, with values as tags.

## apps/desktop/src/compounds/CapacityUpgradesBlock/CapacityUpgradesBlock.tsx

The block shows the master switch, the progressive switch over every Custom family, one row per
family and the notes underneath (each fallback the profile reader applied, plus whatever the
pond rule forces). With the master switch off everything below it greys out and freezes,
because the families are not the player's to set while the feature is out. The read-only
Options page passes `readOnly`, which draws the switches, modes and bonuses as tags.

## apps/desktop/src/compounds/ChecksTracker/ChecksTracker.constants.ts

The tracker once drew its states and view modes with text glyphs, which inherited the body font
and sat at a different weight and baseline from every other control. The paths here are the same
16 by 16 outline shapes the title bar and the search palette use, so a status reads as an icon
everywhere: a checkmark for taken, a filled dot for available (the one solid mark in the set), the
same dot hollow for left, and a stack of rows for every check. The summary words are the reader's,
not the model's: taken, available, left. Five grouping axes is the tree's depth limit, past which a
group holds one check.

## apps/desktop/src/compounds/ChecksTracker/ChecksTracker.css

The shell sheet pulls in `apps/desktop/src/compounds/ChecksTracker/sub-components/TrackerFilters.css` and `apps/desktop/src/compounds/ChecksTracker/sub-components/CheckList.css` so
any importer of it gets the whole tracker; the class sets are disjoint, so cascade order is
unaffected. The sub-components import this shell sheet, and CheckToasts renders CheckCard on its
own, which is why CheckCard keeps that import.

## apps/desktop/src/compounds/ChecksTracker/ChecksTracker.tsx

The summary bar, the filters and the grouped check tree, with every piece of data arriving as a
prop, so the small Checks widget and the full size spoiler tab show a check the same way. The
summary and the filters form one header band and the tree is the scroller under it: with
`stickyHeader` the header holds its place and hands the list the height that is left, so only the
list moves; without it the whole tracker scrolls as one, which a short widget wants. The header
and the list are siblings, not layers, so the pinned header needs no ground of its own and a
widget floating over the game stays translucent through it. With a `run`, checks show what this
seed put in them; without one, a normal profile is unchanged. The subtotal line shows only while a
search, facet, item filter or status filter narrows the set. `panels` and `expandedGroups` are the
controlled form: a surface with somewhere to keep them passes them in so they outlive the tree
being unmounted; otherwise each piece keeps its own state, closed on every mount. `eventStatus` is
the live side of the reversible events, true while the state holds; absent hides the pill.

## apps/desktop/src/compounds/ChecksTracker/sub-components/CheckCard.tsx

The tracker's card view and the check toasts share this card. An event card carries the app's own
mark where an item shows its sprite, and a gold frame tells it from an item while the left stripe
still says its status. The live pill shows only once the row happened: "not now" on a row never
done is noise. The item arrives resolved by the caller (`packages/game-data/src/logic/queries/check-contents`); a foreign item is the
name of another player's item placed here online.

## apps/desktop/src/compounds/ChecksTracker/sub-components/CheckList.tsx

The leaves of the check tree in the three view modes (compact rows, rows with items, item cards).
A check with several vanilla items expands to one entry per item in the modes that show the item,
but only without a run: once a seed has placed something there, the check holds exactly one thing
and collapses back to a single row. Card columns come from the space there is, so the same grid
reads in a 300px widget and across a full width spoiler pane.

## apps/desktop/src/compounds/ChecksTracker/sub-components/CheckStatusIcon.tsx

The one mark for a check's state, so the summary, the filter buttons and the rows never disagree
about what "taken" looks like.

## apps/desktop/src/compounds/ChecksTracker/sub-components/SwapBadge.tsx

A swap chest's item pays a stand-in once the player already holds it, so the same chest reads two
ways. The badge shows whichever of the two the row holds now, and the tooltip says both.

## apps/desktop/src/compounds/ChecksTracker/sub-components/TrackerFilters.tsx

The search box is always there and the rest lives in a drawer. Items, events or both is the one
switch always in reach above the drawer. Every control is a design system one, so the tracker picks
up the app's segmented control and button treatment. The funnel's count sits in a corner so the
funnel keeps its square footprint, the toolbar wraps so a narrow widget never scrolls sideways, and
an icon segment is square while text segments keep the control's padding. The summary word is the
first thing to go when the widget cannot fit the row.

## apps/desktop/src/compounds/ChecksTracker/sub-components/TrackerGroupTree.tsx

Adapts the check group tree onto the shared GroupTree composite: the composite owns nesting and
expansion, this file owns what a check group counts in its header and what a check row looks like.
Each count in a group header carries its own word, because three bare numbers said nothing about
which was which.

## apps/desktop/src/compounds/ChecksTracker/sub-components/TrackerLogicToggles.tsx

The drawer's switches over what the list holds and how its logic reads: small key doors, Big Key
doors, unlit rooms, and on the plain game the shop shelves. A seed's roster already carries only
the shelves its shop scope opened, so that switch shows on the plain game only. Small keys default
off on the plain game and on for a seed (`smallKeyDoorsOf`). `apps/desktop/src/compounds/ChecksTracker/behavior/active-logic-toggles.ts`
counts the switches away from their default for the drawer's badge.

## apps/desktop/src/compounds/ControllerCapabilityBadges/ControllerCapabilityBadges.tsx

The badges show the bus type and the rumble and gyro capabilities SDL reports for a claimed
device. A fact SDL did not report renders nothing: an unavailable device was never opened, so it
has none. The badges share only the icon set with ControllerStatusBar, because the bar's own
bordered chrome would double the box inside the device card.

## apps/desktop/src/compounds/ControllerPortRow/ControllerPortRow.tsx

An empty port renders exactly like an occupied one. Whether the two differ has not been
measured, and a wrong guess would hide a working port. `liveHint` is a short proof of life for
a ready port, such as a button and axis count.

## apps/desktop/src/compounds/ControllerStatusBadge/ControllerStatusBadge.tsx

Ready means SDL3 claimed the device. Unavailable means the Brock input module lists it but SDL3
did not claim it.

## apps/desktop/src/compounds/ControllerStatusBar/ControllerStatusBar.tsx

The wired or wireless chip is a fallback shown only when the bus type is unknown. It never
stands in for USB or Bluetooth, and the bar never shows a bus chip and a wired or wireless chip
together. `idLabel` arrives formatted: a vendor and product id, or a label for an unmapped
gamepad.

## apps/desktop/src/compounds/CurrencyPriceRow/behavior/currency-rows.ts

A price can never exceed what the profile can pay, so a row's range stops where its currency
does: the top rung the capacity profile reaches for rupees, arrows and bombs, and the heart
ceiling less one for hearts. The stops are rebuilt from that ceiling on every render, so
shrinking the wallet on the capacity tab shortens the rupee range at once, and a stored end above
the new ceiling reads as the ceiling. A currency the seed has nothing of
(`shop-price-currency-rule`) shows unticked and greyed with the reason on its row, while the
stored tick is left alone so it comes back when the rule lets go.

## apps/desktop/src/compounds/CurrencyPriceRow/behavior/price-stops.ts

Every whole number up to `FINE_LIMIT` is a stop whatever the ceiling: small amounts are what a
price row is usually set to, and a ladder that skipped them showed a stored 10 as 0. Above that
the ladder coarsens to `COARSE_STEP`, because a thumb that has to find one exact rupee in a
thousand is not a usable control. The ceiling is always the last stop.

## apps/desktop/src/compounds/CurrencyPriceRow/CurrencyPriceRow.tsx

One row of a currency price section: the checkbox that opts a currency in, and beside it the two
thumb range a rolled price is drawn from, disabled until the currency is ticked. A row may also
pass checkboxes as children: on their own they take the range's place, and under a range they
fall to a line of their own across the row, indented to the control track, so the tick and its
range stay together on the first line. A row a rule elsewhere has taken away is blocked: its tick
is inert and off, a danger marker runs down its left, and the line saying why takes the range's
place, so the greying reads as a consequence of another setting. A row that is merely off dims
as a whole. The rows and their catalog keys belong to whichever block draws them, so this
compound takes both as plain data and never reaches for one block's keys.

## apps/desktop/src/compounds/CurrencyPriceRow/sub-components/BottleContentRow.tsx

Two different reasons grey a bottle content and they must not read alike. The whole bottle row
being off is a setting the player can undo on the spot; a blocked content is a consequence of the
shop scope above (its cauldron went to the shuffle). Only the second carries a note, takes the
whole line and wears the danger marker.

## apps/desktop/src/compounds/DataSections/DataSections.tsx

The cards of a home page. The page above owns the level 2 heading, so a group label is level 3 and a card title level 4, which keeps the outline in order for a screen reader. The icon sits in a neutral media block so a card reads as a link to a page, not as a status.

## apps/desktop/src/compounds/DataStorageDetails/DataStorageDetails.tsx

Shows what the Storage page shows, without its actions: the data folder with its host label and the count and size of each data folder. The Storage page is the place to clean, export or import; this part only reports. The tiles used to sit in the hero panel of the data home and moved here with the folder path, so the hero keeps three numbers.

## apps/desktop/src/compounds/DebugCaptureButton/behavior/useDebugCapture.ts

Starting a recording checks for ffmpeg first, because a recording is encoded into a video the
moment it stops. When ffmpeg is not ready the caller shows the install prompt, and the recording
starts either way, falling back to raw frames. Stopping never needs ffmpeg.

## apps/desktop/src/compounds/DebugCaptureButton/DebugCaptureButton.css

The glow follows the "colorful glowing effect on hover" technique from codingnepalweb.com,
recoloured to the green and gold tokens and triggered by the active class in place of hover.
The outer circle and its two span layers share one background (`background: inherit`). Active
swaps only the outer background to the gradient: the spans inherit it and blur into a halo,
while the inner button keeps its own dark background and stays sharp on top through DOM order.
At rest the outer circle is transparent, so nothing shows past the 40px button. The hue swings
only 20 degrees each way so the glow floats between green and gold and never reaches blue or
purple.

## apps/desktop/src/compounds/DebugCaptureButton/sub-components/RecordingTimer.tsx

The elapsed time of a running recording, drawn as a pill with its own glass ground, a border and a
blinking red dot. It used to be a bare 10 px label with only a text shadow, over the game picture,
which made it hard to read on a bright scene. The time is the primary bright colour at the base
text size, and the selector is two classes deep so it beats the Text primitive's own colour and
size without an override.

## apps/desktop/src/compounds/DebugCaptureButton/DebugCaptureButton.tsx

The recorder toggle is also bound through the rebindable function actions in the Controls
settings (Tab by default). It renders only while `allowDebugLogging` is on; the caller owns that
gate, and the parent stack owns position and drag.

## apps/desktop/src/compounds/DebugFloatingControls/behavior/useDraggablePosition.ts

The position is an offset from the top right corner, the default spot, so it stays sensible
across window resizes. It is stored per viewer in localStorage: a placement convenience nobody
else needs. Both buttons share one position, so grabbing either drags the whole stack.

## apps/desktop/src/compounds/DebugFloatingControls/DebugFloatingControls.css

The hover zone has no z-index on purpose. A widget (explicit z-index, `--z-panel`) then always
wins the pointer hit test where the two overlap, so hovering a widget never counts as hovering
the game, and the stack's higher z-index is not trapped in a losing stacking context. That trap
once hid the buttons behind any docked widget. The icon colour never changes with state; only
opacity and the capture glow carry state. The busy selector includes `:disabled` so it beats the
Button primitive's `.btn:disabled` opacity whatever the CSS load order. The stack is absolute
inside the hover zone, which fills the game view; it was fixed to the viewport after the move to
Brock, which ignored the dock and put the buttons over a docked widget.

## apps/desktop/src/compounds/DebugFloatingControls/DebugFloatingControls.tsx

The stack is placed inside the game view, which Brock's dock layout shrinks for a docked widget,
so it stays inside the gameplay area and moves as a widget docks or undocks. There is no insets
store any more; the dock does that work. Both buttons idle at reduced opacity and turn fully
opaque while the pointer is over that area or while a button is busy. The component checks
`allowDebugLogging` itself so the caller can mount it unconditionally.

## apps/desktop/src/compounds/DebugReportFloatingButton/DebugReportFloatingButton.tsx

The button only opens Brock's bug report dialog. The save states and the recordings are packaged
into a debug report when it is sent, by the Sanctuary transport in main. Its round look is
`.debug-round-button` in DebugFloatingControls.css, shared with the capture button.

## apps/desktop/src/compounds/DialogBox/

The message box: a ground with an optional texture, the text, and a border on top. The border is the game's own three tiles (corner, horizontal edge, vertical edge, the rest flipped), a drawn single or double line with the chosen corners and corner marks, or nothing. When the tiles are not extracted yet the original border falls back to a drawn single line. A feathered ground with no border spreads a tile past the box and fades over two tiles toward every edge, so the words sit on near full shade (`feathered` is ignored under a border). `bordered` is false for a floating message, which draws only its ground. `tile` is one game tile in CSS pixels, the ground opacity runs from 0 to 1, and `markAngle` is the degrees the top left mark turns.

## apps/desktop/src/compounds/DialogPrompts/

The row of button prompts under a message box, right aligned to the box's right edge. When the box sits too low for the row to fit below it, the row moves above the box. `box` is the message box in CSS pixels, `limit` the height of the drawable area the row must stay inside, and `scale` CSS pixels per game pixel. The prompt height, the space between box and row, and the space between prompts are in game pixels.

## apps/desktop/src/compounds/DialogRows/

The three text rows of a message box, in the game's glyphs or the modern face, clipped to the rows in use and shifted up by the engine's own scroll progress so a scroll animates the way the bitmap does. The item picker's chosen item is a HUD sprite the mirror cannot see, so it is drawn here at the spot the engine blits it to (where `RenderText_DrawSelectedYItem` lands the 16 by 16 item in the text area, in game pixels). `unit` is CSS pixels per game pixel with magnification included, `widthPx` the text area width in game pixels, and `highlight` holds the primary then the secondary highlight: an atlas each for the game's glyphs, an ink each for the modern face.

## apps/desktop/src/compounds/DifficultyBlock/DifficultyBlock.css

The family sliders read as one question asked several times, so they are indented together
under their heading and do not sit flush with the heart ceiling below them.

## apps/desktop/src/compounds/DifficultyBlock/DifficultyBlock.tsx

The block stands directly under the tier cards because it answers the second half of the same
question: the cards say which rungs a family has, these sliders say how many times over the seed
carries them. A family whose rungs were all unticked carries no copy at all, so its slider is
shown inert with the reason on it, the same rule the retro costs follow under their own switch.
An absent `onChange` renders the block as a read out, which is the read-only Options page.

## apps/desktop/src/compounds/FfmpegInstallStep/FfmpegInstallStep.tsx

The download size and the destination are stated up front because a player might refuse over
either. A platform with no published build gets no button and shows the tool's hint: unlike a
failure, there is nothing to retry. The button installs through the Brock tools module
(`useTool`), which opens the job dialog where the download and the checksum check show their
progress. Every feature gated on ffmpeg (MSU audio conversion, debug report video capture) shows
this same step, so the prompt and the download are the same whichever feature asked.

## apps/desktop/src/compounds/FfmpegRequiredDialog/FfmpegRequiredDialog.tsx

A one shot gate in front of an ffmpeg action that has a fallback. Skipping is always offered
because the caller degrades on its own: debug capture falls back to plain screenshots. `onClose`
fires once, when the tool becomes ready or when the player skips, never both.

## apps/desktop/src/compounds/HelpTip/HelpTip.tsx

A stand in. Tessera has no help icon part (0.37), so this is a ghost icon button inside a Tooltip. The tip opens on hover and on focus, which a click also gives, and closes on Escape or a click elsewhere. Swap the body for Tessera's own part when 0.38 ships one; callers pass only a label and the text.

## apps/desktop/src/compounds/HookshopChip/HookshopChip.tsx

The gold lock mark of an item installed from the Hookshop: "Hookshop" on a list row, "From the
Hookshop" at the top of an editor. Only the words change, so every editor marks an installed
item the same way.

## apps/desktop/src/compounds/HubAccountCard/HubAccountCard.tsx

The shared account row has three states: signed out with a sign in button, waiting with the
code to confirm in the browser, and signed in with who and from which device. `userCode` stays
null until the API has minted the code. `siteHost` is the host the browser opens while the code
waits. The waiting state sits in its own card, with Cancel under the code and its text, so it reads apart from the page text above it.

## apps/desktop/src/compounds/HudButton/

Draws a control's own face, picked per state. A face is a picture the author chose, not an auto resolved binding: `states.idle` names a specific pack and glyph (or a file), so the button always draws what was picked in the states editor. `unassigned` is the one state computed here from a flag: `unassigned` says whether the bound slot fires anything right now, derived by the caller from the placed node's own `dimmed` (which the validator derived from this node's `bind`, see `validate-node.ts`) and never from `content.slots`, which answers item ownership. A missing state falls back to `idle`; no automatic dimming stands in for a face nobody drew. Live press and hold detection is not wired yet, so `pressed` and `held` default to false and every button reads as idle or unassigned until real input state is fed through. A glyph face's `glyph` is a plain string in the document, validated at load time against the SDL position or `DPAD` set (`validate-button-node.ts`), so narrowing it to a glyph position is safe.
The state and face resolution sits in `apps/desktop/src/compounds/HudButton/behavior` so it is testable with no React or DOM. The priority is a live press, then a hold, then nothing bound, then the plain default; a state with no face of its own falls back to `idle`, the only state every button must declare.

## apps/desktop/src/compounds/HudCountdown/

The HUD countdown: a pie that loses a slice per share of the time, with the seconds drawn over the middle of the pie. `variant` picks hard pixels on the game's grid or smooth vector slices; `total` is the seconds the countdown started from, `remaining` the whole seconds left (the number drawn), and `fractionLeft` the share still to run, 1 down to 0, moving every frame.
`resolveSlices` cuts a countdown into slices and counts those left. A countdown at least as long as the slice count (10) gets that many equal shares of its time, and a slice leaves each time a share is used up; a shorter one gets one slice per second. No slice is left once the seconds reach zero. A rounding slack keeps a share that lands on a slice edge from counting one slice too many. The slices are 32 game pixels across, four HUD tiles. `countdownSize` is the whole pie box for a HUD scale, empty rim included; `countdownBox` gives the box and the empty rim between its edge and the disc, and the pixel pie measures both in whole game pixels so its box lands on the game's pixel grid.

## apps/desktop/src/compounds/HudLife/

Draws the heart row and, for the two callers that still want it, the console's caption above it. Two arts, and the default is the enhanced one: `heartArt` picks the drawn heart (`HudHeart`, with a fractional fill and an armour tint) or the console's extracted sprites (`HudSpriteHeart`). The Original style replicates the console's bar from the ROM's artwork, so it opts into `sprite` along with the caption; every other caller is Enhanced and takes the drawing. `armor` (0 to 2) only reaches the drawn heart, because a baked bitmap has nothing to tint.
No caption in the enhanced HUD: `showCaption` defaults to false because the enhanced style is hearts and nothing else, and the nine pixels the caption cost were baked into the life block's published size for every caller, which put the shipped magic bar under the second row of hearts. The two callers drawing a replica of the console's interface (the vanilla styled `HudView` top bar, and the pause status panel, where the caption is the row's only label) opt back in, and neither is sized by `packages/hud/src/layouts/element-sizes`.
Fill is a fraction. `original` quantises with the console's own arithmetic: health is rounded up to the next quarter heart, then five units or more reads full and anything left reads half, kept verbatim. `smooth` hands over the true fraction and lets the heart ease to it. Sprite hearts are always quantised the console's way whatever the heart mode, because there is no third picture for a fraction to land on. A heart is 8 health units, and only hearts the save holds are drawn, ten to a row, wrapping.

## apps/desktop/src/compounds/HudMagicBar/

The enhanced HUD's magic meter: a green bar with a thin dark border and a slight corner radius under the heart row, 80 by 16 SNES pixels (5 to 1) when full. The drawing is `HudMeter`; this compound decides what the drawing must not. The bar's own width is the quantity: half the magic is half the bar, border and radius intact, so none draws no meter at all as the end of a continuum. The element keeps its full 80 by 16 reserve at every value, so the hearts above and the counts beside it never move as the player casts. `value` is raw magic power, 0 to 128, and zero draws nothing.
The half magic upgrade is a second band, not a tick. A tick marks the midpoint of a fixed trough, and once the bar's length is the value there is no fixed midpoint: a tick at half the drawn bar slides as spells are cast and says nothing about an upgrade that never changes. The upgrade makes every spell cost half, so the same bar goes twice as far, and it is drawn as a property of the whole bar: the interior splits lengthwise into two stacked bands, each with its own sheen, two bars' worth of casting in one. It reads at every length including a sliver, does not move with the value, and does not recolour the single green fill.
The colours come from the console's palette and not the app's design tokens: this is emulated hardware output on top of emulated hardware output, and a token that shifts with the app theme would put a UI coloured bar over game coloured pixel art. The shape is not the console's: 80 by 16 is a clean modern meter under the heart row and exactly as wide (80 is also the lane the element reserves), in place of the console's tall jar (which cannot sit under a life row without pushing everything down) or the 82 by 8 hairline that replaced the jar first. There is no fourth colour because there is no track. The frame is one pixel on every side at every length; it keeps the bar legible over any background and rules the two bands apart under the upgrade. The radius is slight, enough to soften the corner and not a pill, authored at full length (`HudMeter` shortens it with the bar). The sheen is a lighter band across the top of each band, the bar's light source.

## apps/desktop/src/compounds/HudNodeRenderer/

Draws a solved layout and computes no geometry. Every rectangle arrives from the engine (`layoutHud`) already absolute in SNES pixels, carrying the scale its subtree was laid out at and the opacity and dim state it inherited. This component multiplies by the display scale (`scale`, display pixels per SNES pixel), subtracts the origin it was pinned to, and hands each element to the compound that owns its art. The arrangement is a pure function nothing renders, and the drawing knows nothing about layout.
Containers draw nothing; they are in the list because the editor selects and drags them. Their order is kept as the engine emitted it (parents before children, siblings in document order), the paint order the document chose. Every node is positioned against this component's own box and never flowed, because the flow already happened; mount it inside a `position: relative` parent, or an absolute one that fills its box. It is inert unless asked: without `onSlotPress` nothing takes a pointer event, which lets the gameplay HUD sit over the play field. With it, every node that names a slot (a glyph drawing a slot's control, or the item that slot holds, both the same button) becomes that slot's click target. It is the control that is drawn, not a separate overlay measured against it, which is how the pause menu's targets used to drift from the cluster they covered. The motion hook combines an animation's clock, a transition's CSS string and any fading exit ghost, so a document with none of the three (every shipped built in today) costs one boolean check.
The props have two halves. `nodes` is geometry, whatever `layoutHud` handed back, already absolute, scaled and dimmed. `content` is data: what the save holds, what each numbered slot fires, which artwork a glyph resolves to. Neither knows the other, so the live HUD, the pause menu's copy of the button map and the editor's preview mount this with the same geometry and three different sets of values. Nothing here reads a store or computes a position. `origin` is the SNES pixel point mapped to the renderer's top left corner; the default is the play field's corner, and the pause menu passes the button map's bounding origin to pin it into its right hand column. `dataScope` is what a node's `style` resolves bound values against (a border width, a shadow's blur, a tint's amount); the empty default still resolves every literal number. `clockOverrideMs` parks every animation's shared clock at that instant; the HUD layout editor's scrub and play head (`apps/desktop/src/hud-layout-editing/motion-preview`) is the only caller, and leaving it out keeps the free running clock.
In the content, a slot role says what a numbered slot fires, which decides whether it wears a sprite. The vitals are in the units the core reports (armour tier 0 to 2 tints every heart; magic is raw power 0 to 128). A slot entry holds the sprite file name without extension for what the slot holds, and `dimmed` for unassigned or holding something the save does not own. Slots are keyed by slot number, and a slot with no entry draws nothing. `glyph` is a function and not a table because a glyph names a fixed position or a slot, and only the caller knows the packs and the device. The countdown content is the countdown as the caller tracks it (`packages/hud/src/hud-countdown-track`) plus the profile's pie style (`hudCountdownStyle`, which a node's own `variant` overrides); absent draws no countdown, and the pause menu's copy of the map leaves it out.
`DIMMED_GLYPH_OPACITY` is the one dim for the whole button map. 0.4 was tuned when only assigned buttons drew and a dim glyph meant an item not owned yet, a rare state. Since contract section 15.4 the map draws every assignable control all the time, so on a pad most of it is dim over the brightest terrain in the game, and at 0.4 the three free d pad chips over grass and canopy were all but invisible, defeating the reason the map stopped hiding them: an empty button answers where could I put this. 0.7 is legible on that ground and still reads as not assigned; the item sprite is what says assigned. The d pad's shared cross uses it for its group and a face disc for itself, so the two cannot drift apart.
`GROUP_GLYPH_ART` resolves the glyph that is not a position. A glyph pack (`packages/input-mapping/src/glyphs/`) is keyed by SDL position (`DPAD_UP`, `EAST`, `LEFT_SHOULDER`) because that is what a device enumerates and a binding row names. The whole d pad is not a position: nothing can be bound to it and no device reports it, so adding a key for it would put a non control into the table that describes controls. A document names it with the synthetic `DPAD` position and it resolves here. There is one picture for every family: of the six shipped packs only `snes` has whole d pad art, and promoting one console's pad would draw the wrong hardware for five players of six. The cross is drawn in the generic pack's style with no family's accent colour, the fallback every family reaches. The path is root relative like `glyph-files.constants.ts` produces, so `HudGlyph` prefixes it with the app's base.
`drawOrigin` is where a placed node's box starts in SNES pixels, the one place a solved rect becomes a drawing position. The countdown snaps to whole game pixels and nothing else does: `HudPixelPie` is a canvas of one cell per game pixel scaled with no smoothing, so it only lines up when its corner sits on a game pixel. The engine may answer a fraction (a centred box in a view of odd width is half a pixel off) and is right to, because rounding there would move the flow every other node is measured by. So the snap happens after layout, on the drawing only, for the one kind that needs it (section 62); every other kind keeps the exact rect.
`countdown-inset` and `countdown-variant-of` say which pie a countdown node draws (the node's own pie when it names one, else the profile's) and how far it sits in from its box. The box is the pixel pie's (`COUNTDOWN_SIZE`, 44 game pixels); the smooth pie is a hair wider, about 44.4, around the same disc. `HudView` centres the pie across the frame and pins the disc's bottom edge, so the smooth one is centred across this box and keeps its top edge: its rim ends where the pixel pie's does, and both discs share a centre and a bottom line. The inset is 0 for the pixel pie.

## apps/desktop/src/compounds/HudNodeRenderer/behavior/ (node motion: useHudNodeMotion and its helpers)

`useHudNodeMotion` is the one hook the renderer calls: animation (its own clock), transition (the browser's clock primed by a CSS string) and enter or exit (a node arriving or leaving), combined per node. A document with none of the three costs one boolean check, because the clock's frame loop never starts unless something animates. Render `renderNodes` (the nodes plus any still fading exit ghost), not `nodes`. `styleFor` gives transform, filter, width, height and transition for the wrapper; opacity is handled only by `opacityFor`, because it multiplies and does not replace, so only the transform half of an enter or exit override belongs in `styleFor`. Always call `opacityFor` and never read `placed.opacity` directly once motion is wired. The barrel also exports `useReducedMotion` so the HUD editor's motion transport reads the same signal the renderer does, not a second `matchMedia` call that could disagree.
`resolveNodeAnimationStyle` samples one node's `animation` list at `nowMs` and turns it into the CSS that node's own wrapper needs, under the reflow rule: every property is a transform part, a filter, an opacity multiplier, or (only `width` and `height`) a pixel override on this node's own box. None of it feeds back into placement (`measure.ts` and `place.ts` never run again), so the six safe properties cannot move a sibling, and `width` and `height` resize only this node's box (`packages/hud/src/layouts/validate-motion-warnings` tells an author who reached for them). `x` and `y` are authored in SNES pixels like every other bound field, so `displayScale` converts them. Tint animates an amount, not a colour: its keyframes modulate the node's own `style.tint` amount (0 to 1) with that tint's colour and mode, replacing the static tint for as long as the gate is true and not stacking a second tint filter. A node with a tint animation and no static tint gets a plain white `replace` flash. The opacity multiplier applies on top of `placed.opacity`, which already carries ancestor opacity and dim state, so keyframes of 1, 0.5, 1 read as half as opaque as usual.
`transitionCssValue` turns a `transition` into the browser's own `transition` property. A bound value that changes between renders is a plain CSS value change (`left`, `opacity`, `transform`), and handing the browser a transition string beforehand is all it takes for that change to ease, the `CLUSTER_FADE` technique of `HudLayoutView.tsx` generalised to an author chosen property list per node. `delta` is the one thing CSS cannot answer: easing only when a value grew needs the signed change, which `useNodeTransitionCss` computes from this render's and the last render's reads and folds into the `when` gate's scope under that name (the plan's example is `delta > 0`). The delta reads the first property in the list the snapshot can answer: `size` reads width, `position` reads x, `opacity` reads opacity. A transition naming only tint, scale or colour has nothing to diff and gates on a delta of 0, which is why an absent `when` is the common case. The snapshot is committed after paint, so a render's delta reads what was on screen a moment ago.
`useEnterExit` handles a node's own `transition.enter` and `exit`: a repeat's count changing is a node appearing or disappearing, not a value transition. Arriving and leaving are not symmetric in React. An arriving node is already in `nodes` and needs one extra render to flip from its pre enter style to rest under a transition string, the standard two frame mount fade; one frame later the pre enter override drops and the already active transition eases it to rest. A leaving node is gone from `nodes` the instant its repeat stops producing it, so the hook keeps drawing a ghost at its last rect for exactly `exit.duration` ms. The pre enter override pulls opacity and scale toward rest; the exit override pushes them away for the ghost's whole window. A known, accepted limit: ghosts are keyed by node id, so an instance that exits and a different one entering with the same id in one exit window are not handled; `expand.ts` suffixes ids with the index, so this only bites an id an author reused by hand.
`useMotionClock` gives ms since the clock last turned on, the one shared clock every animation samples against (`packages/hud/src/engine/motion` explains why one clock). `active` is computed by the caller from the same nodes list, so a document with no animations never starts a frame loop and the shipped HUD stays pixel identical with no new per frame cost. `override` is the editor's scrub and nothing else should pass it: a number parks the clock at that instant and stops the loop, which is how the editor shows 300 ms of ease out without saving and watching the game.
`useReducedMotion` reads `prefers-reduced-motion: reduce` live. The app honours it in CSS already; the HUD's own motion samples in JS, so there is no media query for the browser to apply. A looping animation is decorative by construction, a clock the document drives for its own sake, so reduced motion silences every animation entry regardless of its `loop` and holds the node at its rest keyframe. Transitions and enter or exit keep running: they carry real information (a counter changed, a heart arrived) over a short, non repeating span, the essential motion that accessibility guidance asks to keep.

## apps/desktop/src/compounds/HudNodeRenderer/behavior/ (node style: resolve-node-style and its helpers)

`resolveNodeStyle` turns `HudBoxStyle` into one `CSSProperties` object, the whole face applied to the wrapper every placed node mounts: background, border, radius, shadow and clip as plain CSS, plus outline and tint combined into one `filter`, since CSS allows exactly one. A ring or tint is a flat colour in practice (a gradient outline has no meaning), so a non string paint reads as opaque black and does not silently draw nothing. `styleToCss` is the CSS grade half: every numeric field is a value resolved against the same data scope the engine resolves size, scale and opacity against (`resolve-value.ts`, the same seam `packages/hud/src/engine/resolve-box` uses). A paint is a flat colour, a gradient or an image; the image's repeat and size keywords are set apart from the CSS value.
The outline traces the ink of whatever the node draws, not its box, and the tint recolours that ink. The outline is stacked `drop-shadow`s in eight directions, cheap at one or two pixels and expensive beyond, so the width is capped at 2 px whatever a bound expression produces; eight directions read as a continuous ring at that width, and the stack works the same on a PNG or an SVG image because the browser rasterises either first. The tint is an inline SVG filter as a data URL (the same trick as the outline filter in `HudSprite`), not a hue rotate guess: a flood of the exact colour is composited against the source alpha (`replace`) or blended with it (`multiply`), then crossfaded against the untinted original by `amount`.

## apps/desktop/src/compounds/HudNodeRenderer/sub-components/HudNodeArt/

One placed element, drawn by the compound that owns its kind of art. There is exactly one scale, `placed.scale * scale`: the engine reports SNES pixels per intrinsic pixel, the view reports display pixels per SNES pixel, and every compound wants the product. A 20 px box over a 16 px glyph hands down 1.25, which is the d pad cross. `dataScope` is what a text element's bound value resolves against, the same table the renderer's style resolution reads.
Dimming arrives from two places and means two things. `placed.dimmed` is the engine's answer to `dimWhenEmpty`: no slot named by this node fires anything, which dims the whole d pad cross for its four directions. `content.slots[n].dimmed` is the save's answer: the slot is unassigned or holds something not owned yet. A glyph naming a slot takes either, because the button under an unfound item should read as quiet as an empty button. A sprite's own box may not be square (the bomb and arrow counters are 16 by 8, the key counter 8 by 8), so a sprite reads the engine's contained rect and not the fixed tile the 16 by 16 kinds use. `repeat` and `switch` never reach this component, because `layoutHud` expands the tree (`packages/hud/src/engine/expand.ts`) before a node is placed.

## apps/desktop/src/compounds/HudNodeRenderer/sub-components/HudNodeCountdown/

A placed countdown node: the same `HudCountdown` the Original style draws, at the node's box (`scale` is CSS pixels per game pixel for this node). It draws whatever reading it is handed; whether it is on screen is the engine's answer (an idle countdown is not placed), so a fading exit ghost still shows the last reading, as `HudView`'s slot does.

## apps/desktop/src/compounds/HudShape/

Draws the two pictures the tree cannot compose from a sprite: a heart and the magic bar. See `packages/hud/src/types/hud-shape` for why this leaf exists; it hands off to the same primitives the compounds it replaces use (`HudHeart`, `HudMeter`). Nothing about how either looks changed, only how many there are and what feeds their fill, which is now the document's repeat and expression machinery in place of a compiled in loop over the save's health units.
Original heart mode is quantised here and not in the document: which of full, half or empty a heart reads is a live per player setting (`heartMode`), not a game data variable, so it cannot be an expression in the preset. `quantiseHeartFill` reproduces the console's rule (round the total up to the next quarter heart, then read this heart's share) from the continuous fraction alone, the arithmetic `heartFills` in `HudLife` applies to the whole row, restated per heart. That is exact because subtracting a heart's own whole multiple of four offset commutes with rounding up to the next multiple of four. A heart is 8 health units, the plan's own unit for `life_current`.

## apps/desktop/src/compounds/HudText/

Draws a `text` element's own ink: the game's extracted glyph sprites or a real font. Content and sizing are resolved once upstream by `packages/hud/src/engine/resolve-text`; this only draws the string it is handed. The default stroke is the `.game-text` rule generalised: white fill, blue edge, `paint-order`, and a four way shadow ring filling a blocky face's diagonal gaps become the default when a `font: 'game'` face carries no stroke of its own, with the author's width and colour in place of one pixel of one blue.

## apps/desktop/src/compounds/InputGlyph/InputGlyph.tsx

The glyph accepts a full InputBinding, resolved through the shared binding display helpers, or a
raw button icon id. Without an icon it falls back to a keycap (`key`) or plain text (`plain`).

## apps/desktop/src/compounds/InstalledOrigin/InstalledOrigin.tsx

The origin bar sits at the top of an editor showing an item installed from the Hookshop.
Duplicate makes an editable copy when the licence allows one; `copyRefusal` says why not when it
does not. Uninstall asks first, in the bar's own dialog, and `onUninstall` runs only after that
confirmation. While `busy` every button waits.

## apps/desktop/src/compounds/JumpChipsEditor/JumpChipsEditor.tsx

The free sequence editor: one chip per jump, each capped at the largest jump one item carries
(`maxJump`, the span when absent), and a sum readout against the span that reads as invalid
until the sum is exact. The caller supplies the validation wording in `problem`.

## apps/desktop/src/compounds/LadderPreview/LadderPreview.css

The currency icon draws at its source pixels so it stays the drawing the game shows.

## apps/desktop/src/compounds/LadderPreview/LadderPreview.tsx

The ladder a capacity family produces: the start value, then a jump label and a cumulative chip
per pool item. It is dim in Vanilla, which is the native ladder with nothing in the pool. The last
chip is flagged when its jump ran past the top of the ladder. An ordered ladder numbers its jumps
(1st, 2nd) because pickups take them in that order whatever the shuffle did. A chip may carry the
sprite of the currency its value is asked in: the picture names the currency and the number the
amount, so a demand with no amount (one item, held up and handed back) is the icon alone.

## apps/desktop/src/compounds/MappingPasteBox/MappingPasteBox.tsx

Lets a player paste an SDL mapping line for a controller that is not recognized, as an
alternative to the calibration wizard. The IPC call happens in the view that wires `onSubmit`,
which resolves false for a malformed mapping.

## apps/desktop/src/compounds/ModeBadge/ModeBadge.tsx

The badge says at a glance what kind of playthrough a profile is. The art lives in
`apps/desktop/assets/mode-badges/` as `mode-<id>.png`: a 128 pixel transparent square (the
source art trimmed, squared and downscaled with a quality filter), drawn smoothly at
`--mode-badge-d`. The glob in `apps/desktop/src/compounds/ModeBadge/behavior/mode-badge-src.constants.ts` resolves to an empty map
until a file exists, so dropping a PNG in swaps the monogram chip for the image with no code
change. The image and the chip share the same square footprint, so nothing shifts when the art
arrives, and the chip's per mode tint gives way to the art's own colour.

## apps/desktop/src/compounds/OptionDescription/OptionDescription.tsx

A setting's words come in whichever shape the catalog wrote them: one sentence, or a list of lines
each opening with its term. The branch lives here only, so a plain option row, a capacity family
and the wishing pond present a description the same way. An entry with nothing to say renders
nothing, so the row above it closes up and keeps no blank line.

## apps/desktop/src/compounds/OptionSliderRow/OptionSliderRow.tsx

The slider sits on the same fixed control track (`--option-control-w`) the catalog option rows
use, so a slider section and a catalog section line up on one grid down the panel. An absent
`onChange` renders the row frozen: that is both the read-only face and how a row emptied by a
sibling setting is shown. A `readout` row draws the formatted value as a tag in the slider's
place.

## apps/desktop/src/compounds/OptionValueTag/OptionValueTag.tsx

A setting's value drawn as a read out in place of its control, for an options panel shown read
only. A boolean is a True or False chip, green for true and muted for false, so the eye lands on
what is switched on. Any other value is its own text on a neutral chip. A control that carried
its own label keeps it, before the chip. `compact` sets the label at the small size for a tag
inside a small box, such as a rung or a shop slot. The `behavior/` helpers give the words for
controls that hold no text of their own: a picked choice as its label (looked up in a flat or a
grouped list, the raw value when none matches), a range as its two ends, a list of steps as its
numbers.

## apps/desktop/src/compounds/PauseAbilitiesPanel/

The player's abilities and equipment. Game layout: tiles (1,21) to (19,29), 19 by 9 tiles with a 17 by 7 interior. Abilities come from `link_ability_flags` in a 3 by 2 grid: row 1 (y 22) is bit 7 LIFT, bit 6 READ, bit 5 TALK at tile columns 3, 8 and 13; row 2 (y 24) is bit 3 PULL, bit 2 RUN, bit 1 SWIM. Bit 4 is skipped by the original loop's outer shift. The gloves level sets the level suffix on LIFT (none is .1, Power Glove .2, Titan's Mitts .3). Equipment sprites sit on the bottom row (y 27): boots, gloves, flippers and moon pearl. Both rows align with the item grid above, starting at column 2 and 14 tiles wide. The A button mark sits in the corner and the DO label on the top border at column 2.

## apps/desktop/src/compounds/PauseBottlePanel/

Shown when the cursor is on the bottle slot, in place of the progress and equipment panels on the right: a yellow bordered panel with all four bottle slots stacked and centred, the active bottle under the blinking selection circle. `BOTTLE_SPRITES` maps a bottle's content value to its sprite.

## apps/desktop/src/compounds/PauseEquipmentPanel/

The equipped sword, shield and armour, plus heart pieces or dungeon items. Game layout: tiles (21,21) to (30,29), 10 by 9 tiles with an 8 by 7 interior. Row 0 is the label; rows 1 and 2 hold the sword, shield and armour (2 by 2 each, at columns 0, 3 and 6); row 3 is a dashed separator of eight dots; row 4 is the dungeon items label (in a dungeon only); rows 5 and 6 hold the heart piece indicator (overworld) or the map, compass and big key (dungeon). Dungeon item possession for the current palace is read from the bit masks shifted by half the palace index.

## apps/desktop/src/compounds/PauseGearScreen/

Draws the equipment ladders and the passive row, with the hero beside them at three times native (this screen is about gear). How many ladders is the caller's answer: one row per entry of `ladders` (blade, guard, armour and arrows, in the order the cursor walks them), the passives under the last, and the box sized from that count. Three are upgrade ladders; the fourth is the arrow row, whose rungs are the two projectile types and not a rank, so it has no nothing worn rung. A row draws owned, worn and cursor, and what a press means is decided where every other press is decided.
The ladders are selectable, which the console's menu never allowed: a tier at or below the highest ever held can be worn again, so a player can drop to a weaker blade for a challenge run and climb back. The high water mark the view supplies makes that safe; ownership is never read off the live equipment, which only says what is worn now. The passive row (gloves, boots, flippers and the world charm, each held or not) is a readout: the cursor walks it like the ladders so there is no dead region, and having no tier to equip makes it the row that assigns the ACTION verb. Every cell reports a click the same way (move the cursor here, then confirm, the pad's confirm from a pointer), and what that confirms is not this screen's business; it used to check ownership and call the write itself, which gave the mouse a path the pad did not have. `hintLines` says what the row offers or why a faded tier cannot be chosen, already wrapped to the portrait column by the view.
Geometry is true scale in SNES pixels from the screen area's top left. The published plan measures the content at 152 by 88: a 40 pixel label column (wide enough for the longest ladder name at half a tile) plus five tiers on the menu's 24 pitch (16 by 16 art, like an item cell), and four rows on the same pitch. The bordered box is one tile larger on every side, 168 by 104 outside, unlike the items box whose published 152 by 104 is the outside measurement. The row count is computed, not constant: a fourth ladder makes five rows, so the box height (`gearBoxRows`, content height in tiles for `PauseBorderBox`) and the hint position follow the rows handed in, and at four rows they return the published numbers. The content height is the last row's art plus the pitch for the rest. The panel area runs from y 56 to the legend at y 208 (152 pixels); four rows take 104, five take 128. Width is unchanged: the five tier blade row is still the widest at 152, and the two rung arrow row is 80. The hero column starts one tile past the 168 wide box. The hint sits below the panel, half a tile clear of the box: a hint level with the frame's last row and centred in the 96 pixel portrait column grew back across the panel for any wider line, and the caller now wraps it to the column. At five rows the box ends at 128 and three lines of half tile text end at 150, clear of the legend.

## apps/desktop/src/compounds/PauseGearScreen/sub-components/PauseGearRow/

One labelled ladder: a name, then its tiers left to right. All rows of the gear screen are this component. The upgrade ladders and the passive row differ only in what a cell means (a tier to drop to, or a thing held or not), and both answer the same two questions: is it owned, and is it in force. One shape keeps the cursor's left and right walk identical on every row. A cell's sprite is the file name without extension, empty for a nothing worn tier; owned means at or below the high water mark (a tier) or held (a passive); the worn tier keeps a steady one pixel frame so it reads apart from the cursor. `cursor` is -1 while the cursor is on another row. A tier above the high water mark draws as a silhouette like an unowned item cell, so the ladder's full length is visible from the start without saying what waits there. The cursor ring clears the 16 pixel cell by one tile on every side.

## apps/desktop/src/compounds/PauseHeroPortrait/

Shows the player character as the game would draw them, wearing what the save holds and doing what the idler says. It is the same composer the sprite studio previews with, given the palette the core would hold (resolved for the armour and glove tier worn): change the armour tier on the gear screen and the portrait repaints on the next render, because the palette is a prop recomputed from live equipment. It draws one pose and holds no clock: the pose, the facing (`link_direction_facing >> 1`: 0 up, 1 down, 2 left, 3 right) and the frame (out of range wraps) arrive as props, chosen by a pure sequencer in the shared layer and ticked by the view, so the sequence table is testable without a canvas. `zoom` is whole steps over native size.
The pose atlas reserves a canvas big enough for every pose, so the box is larger than the standing frame and the padding is transparent; `POSE_ORIGIN` says where the character's own origin (the pixel the engine positions them by) sits inside it, so a caller can line the canvas up with a world position. With no sheet yet (assets loading, or a ROM with nothing compiled) the space is reserved so the screen never reflows. The pose canvas ships with the sprite studio's editor chrome, a checkerboard behind and a rounded hairline around; here the portrait is drawn at the live player's position over the running game, so both are reset, and the compound selector beats `.pose-canvas` on specificity whichever stylesheet loads first.

## apps/desktop/src/compounds/PauseItemGrid/

The Y button item grid, 5 columns by 4 rows (20 slots), in a green border box with the Y button mark. Game layout: tiles (1,5) to (19,19), 19 by 15 tiles; each item is 2 by 2 tiles with one tile gaps, placed to match the SNES BG3 layout. The visual order is the save RAM index order 0 to 19. The ITEM label sits on the top border at column 2.

## apps/desktop/src/compounds/PauseItemsScreen/

Draws the inventory: twenty item cells, four bottles, the hero and the name of whatever the cursor is on. Items are unstacked: the console shares one save slot between the digging tool and the wind instrument and collapses four bottles into one current bottle cell; here each of the twenty four has its own cell, which is why a slot can be assigned to a specific bottle. `buildItemCells` does the splitting; this only draws it. The bottles get their own bordered box because they are a different kind of thing (contents that change, not tools owned), while the cursor still treats them as the grid's next row, so walking down out of the grid lands in them. The name lines are the localized name already folded and wrapped by the view; the hint lines (the standing invitation or a refusal) are wrapped to the portrait column; the portrait is built by the view so this stays free of sheets and palettes. Clicking a cell moves the cursor; assignment is a separate press.
Geometry is the published plan's, in SNES pixels from the screen area's top left (the view places that corner): a 16 by 16 icon on a 24 pitch, six columns by four rows, so the grid content is 136 by 88 and the bordered box 152 by 104. The border box measures in whole tiles and adds a tile of frame per side, so the box sizes are content in tiles (17 by 11 for the items, 11 by 2 for four bottle cells). The bottle box sits one tile below the items box (104 plus 8). The hero column is 96 wide, one tile past the 152 wide items box; the name and then the hint sit under the portrait, and the hint is half a tile high so a long one still fits.

## apps/desktop/src/compounds/PauseItemsScreen/sub-components/PauseCellGrid/

A run of inventory cells on the menu's 24 pixel pitch. The item grid and the bottle row are the same thing at different widths (six columns and four), so they are one component; the cursor walks from the bottom of the item grid into the bottles, and two separately built grids would drift apart on the pitch that makes that read as one movement. An unowned cell still draws its tier one sprite as a silhouette, never an empty hole, so the grid's geography is identical from the first pause to the last and the outline never says which tier is still out in the world. `showCursor` is false while the cursor lives in another section; clicking a cell only moves the cursor. The cursor ring is 4 tiles wide, one tile clear of the icon on every side.

## apps/desktop/src/compounds/PauseNamePanel/

The selected item's name with its icon above the text. Game layout: tiles (21,5) to (30,10), 10 by 6 tiles with an 8 by 4 interior. The icon (16 by 16 SNES pixels) and the name pack together, matching the original's fixed two row icon and two row name, with the name bottom aligned in its two rows. The ampersand is drawn across two native tiles in the ROM's own font, so its sprite is twice as wide. Every line shares one glyph size: the caller already broke the name onto this grid (see the view's `wrap-name`), so a line still wider than the box shrinks the whole name and every row stays at the same scale.

## apps/desktop/src/compounds/PauseNavLegend/

The strip along the bottom saying which button does what. Every glyph comes from the player's actual bindings, resolved through the glyph pack chain before it arrives; nothing is a hardcoded letter, because a menu saying press A to someone who moved confirm onto a shoulder is worse than no legend, and the menu verbs are rebindable. A control with no artwork falls back to its own text (usually a keyboard key with no cap sprite) and leaves no hole. An entry pairs one or two glyphs (two for previous and next screen) with the verb; its `id` is the stable key and `width` is the full play field in SNES pixels.
The strip is 398 by 16 SNES pixels along the bottom of the play field. Its height comes from the layout layer, because a bottom anchored HUD element must be placed clear of it and the two are drawn by files that cannot see each other; the wallet in the shipped layout sits in this band, flush with the bottom. The left padding keeps the centred pairs clear of the bottom left corner, from the same file the layout takes the corner's width from. It is a fixed promise and not a reading of the live layout: the chrome does not move out of the HUD's way, so a player who moves the wallet leaves the strip very slightly off centre. The plate stays the full field width and only the content starts clear of the corner. Glyphs are 12 pixels, leaving a pixel of air top and bottom; verbs are half a tile so six pairs fit a 4:3 field. Pairs are 8 apart, not the 12 they were: the strip shares its row with the 64 pixel corner reserve (334 of the narrowest 398 wide field) and can carry five pairs (SCREEN, MOVE, a confirm verb, ASSIGN, CLOSE), which on a d pad profile (four glyphs for MOVE) measure 294; twelve made 342 and ran past the reserve, eight makes 326 and fits every legend context, still four times the 2 pixels inside a pair. The dark plate keeps a verb readable over any play field.

## apps/desktop/src/compounds/PauseProgressPanel/

Pendants or crystals, depending on game progress. Game layout: tiles (21,11) to (30,19), 10 by 9 tiles with an 8 by 7 interior. Pendants: green (Courage, bit 2) top centre, blue (Wisdom, bit 1) bottom left, red (Power, bit 0) bottom right, from `link_which_pendants`. Crystals: seven icons from `link_has_crystals` bits 0 to 6 in rows of 2, 3 and 2, positions in tiles from the inner top left; each crystal is 2 tiles wide and 1 tall, and the middle row of 3 is inset one tile. The index order is the crystal bit order, so slot N shows bit N.

## apps/desktop/src/compounds/PauseStatusScreen/

Everything the save is on one panel, plus the two ways out of the game. Continue and Save and quit live here because quitting is a status decision, and a fourth screen for two buttons is one screen too many. They are the only cells the cursor can land on; the rows above are a readout. They are activated and never assigned: a button pressed on Save and quit either quits or does nothing, and never rebinds itself. `onConfirm` fires the row the cursor is on, the pad's confirm from a pointer.
This panel is Enhanced, so its hearts are the drawn ones, tinted by the armour tier as in the Enhanced HUD's life block. The caption is the row's only label, so it opts into the console's LIFE strip while taking none of the console's heart art. `armor` (0 to 2, `GameUIState.equipment.armor`, published by `usePauseMenu` as `data.armor`) is optional only so the host can add its pass through independently; without it every tier shows the armour 0 tint. Every progress mark draws whether held or not: an unfound dungeon item is its sprite as a silhouette, the item grid's rule, so the row's shape never changes. Heart pieces run 0 to 3, magic is raw power 0 to 128, pendants and crystals are bit masks from the save, and the dungeon items are the map, compass and big key of the current dungeon.
Geometry is true scale from the screen area's top left: the plan measures the panel at 216 by 144 outside its frame, 25 by 16 tiles of content (200 by 128) holding the rows and the two actions. Row labels are half height so the widest fits before the value column. The life block owns the top and is 25 tall. Full icons sit on a 24 pitch; crystals pack tighter, and a crystal's sprite is 16 by 8 so its row sits half a cell lower. Pendants draw in bit order red, blue, green. The two actions sit side by side at a full tile so they read as buttons. The row words are plain English constants, not name table lookups: the shipped table keys only the six pre composed label strips the console drew, and adding keys is a change to the language types in another part of the tree.

## apps/desktop/src/compounds/PauseStatusScreen/sub-components/PauseStatusRow/

A label on the left and whatever the row reports on the right, on the screen's one shared value column. The status screen is a table, and rows that each computed their own left edge would drift by a pixel per row at these scales. `top` is the row top in SNES pixels from the panel's content origin, and `valueTop` nudges a value shorter than a full cell so it centres on the label.

## apps/desktop/src/compounds/PondImportControl/PondImportControl.tsx

Copying another pond's settings takes two steps on purpose: pick a pond, then press. The copy
overwrites everything the tab holds, and a dropdown that acted the moment it changed would do
that on a misclick.

## apps/desktop/src/compounds/PondStatusNote/PondStatusNote.tsx

The plain answer to "what will the pond do?", at the top of its tab: one sentence for what it
sells and what it costs, one for which capacity families still take their upgrades from it. The
sentences arrive derived from the live settings, so the block follows every edit.

## apps/desktop/src/compounds/PoolFillBar/PoolFillBar.tsx

The pool against every location of the world as one segmented bar. The track is every location
the seed generates, the same total the Checks widget shows, and items, upgrades, filler, fixed
and prizes add up to exactly that width. It fills left to right with the items in the pool
(progression, useful and dungeon items), the capacity upgrades (each in a filler's place), the
balance filler, the spots settled before the shuffle (a locked vanilla item, the assured
starting weapon) and the ten boss reward slots, which are placed from their own fixed pool
outside the general fill.

## apps/desktop/src/compounds/PoolImpactCell/PoolImpactCell.tsx

The In Pool cell of an options row sits in a fixed width track, right aligned with tabular
digits, so the number never moves the control beside it. Anything wider than the track
ellipsizes. It is muted for a qualifier ("fixed", "not used") in place of a count.

## apps/desktop/src/compounds/PoolListing/PoolListing.tsx

The item pool of the current options as the generator would shuffle it: a multiset, not a
placement. Each group is the pool builder's own partition. The same placeholder stands in for a
row without art and for a sprite file that fails to load, so the list never shows the browser's
broken image glyph.

## apps/desktop/src/compounds/PoolTotals/PoolTotals.tsx

When the pool cannot be built (more upgrades than the filler can absorb) the row carries the
reason in place of the bar.

## apps/desktop/src/compounds/ProfileHero/behavior/hero-art-src.ts

Hero art lives in `apps/desktop/assets/home-hero/` as `hero-art-<mode>.png`: a 128 pixel square
piece of pixel art on a transparent ground, drawn at twice its pixels so it stays pixel art. A
mode without its piece shows the backdrop alone.

## apps/desktop/src/compounds/ProfileHero/ProfileHero.tsx

The Home tab hero, drawn through the shared Hero: the scene the host hands in as a full bleed
backdrop, the mode's piece (sword, shield) beside the intro, the mode and its game controls on
the left (Play, or Pause, Stop and Reset while a game runs), the last save on the right, and the
facts and per file progress along the bottom. `runFacts` holds the seed, connection and session
row and is null on an unrandomized profile.

## apps/desktop/src/compounds/ProfileHero/sub-components/HeroProgress.tsx

One row per save file holding a game, with a segmented bar in the Checks widget's palette (green
taken, yellow available now, grey left), the percent done and the raw counts. A file shows as
slot plus one, under the name typed on the file select screen when there is one. The rows share
one grid, so every bar, percent and count lines up.

## apps/desktop/src/compounds/ProgressiveTiersBlock/behavior/progressive-cards.ts

The count line is the point of the card. A rung is one copy of the family's item in the pool, so
"3 of 4" says exactly what unticking did: the fourth copy is a small rupee pickup now, without the
player knowing the pool arithmetic. Names come from the dataset
(`packages/randomizer/src/world/progressive/progressive-display-names`); a checkout without it keeps the short neutral words
of the family table. Each box's catalog key is also its React key.

## apps/desktop/src/compounds/ProgressiveTiersBlock/ProgressiveTiersBlock.css

The cards pack across the panel and wrap, each at the width of the rungs it holds. The families
have different rung counts, so a shared track width made every card as wide as the widest and
left the two rung families mostly empty. Wrapping keeps it responsive without a media query,
since the panel lives in a split pane.

## apps/desktop/src/compounds/ProgressiveTiersBlock/ProgressiveTiersBlock.tsx

The tiered families, one card each, with a box per tier: the same shape the shop block uses for
its shelves, because it is the same question, which of a fixed set of slots are in the seed.
Under the grid the block says what the ticks have done to the world. Emptying the blade family,
or leaving only the rung that throws no beam, relaxes five rules that would otherwise have no
answer: the tablets, the medallion doors, a hanging cloth door, the tower's seal and the last
fight. Each is a line only while it is true, so the default set says nothing. The block also says
when a tick set cannot be rolled at all: two rungs are load bearing under the rules this version
transcribes, and the generator refuses without them. That refusal carries the blocking colour,
not the advisory one. Both readings are derived from the ticks as they are edited, never stored.
An absent `onChange` renders the read-only Options page; an absent `onModesChange` freezes only
the order controls.

## apps/desktop/src/compounds/ProgressiveTiersBlock/sub-components/ProgressiveTierCard.css

A card is drawn at the width of what it holds and may still be squeezed by a narrower pane, which
keeps the pane from scrolling sideways. The rungs are one centred row, since a ladder reads
across; a row too long wraps its last boxes, and only a box wider than the card shrinks, folding
its name. The boxes are squared off to read as rungs, with the tick beside its name. Their rules
are written through the card so they outrank the checkbox's own single class rules whatever order
the sheets load in. The box height is a floor so every box in every card comes out level, and the
tick keeps its size because a flex row would otherwise squeeze the input before the text.

## apps/desktop/src/compounds/ProgressiveTiersBlock/sub-components/ProgressiveTierCard.tsx

The rung boxes are the only tick control. A family is in the seed because something is ticked,
so a whole family tick would be a second way of saying the same thing. A card with nothing ticked
wears a dashed edge, because "this family is gone" otherwise looks like a card that failed to
draw. The order control sits below the boxes, set off by a hairline, because it only means
something once a rung is ticked; with the family emptied it has nothing to order and draws inert.

## apps/desktop/src/compounds/RandomizerOptionGroup/RandomizerOptionGroup.tsx

The title is a section's only chrome: gold for every group, brighter for a live one, a section
whose rows are the player's own choices.

## apps/desktop/src/compounds/RandomizerOptionRow/behavior/partition-catalog-by-lock.ts

Splits the option catalog by lock state so every consumer shows the same shape: the unlocked
options first, flat in catalog order and also grouped by section (so a newly supported option
lands under its real heading), then the locked remainder grouped in catalog group order with
empty groups dropped. It runs on each entry's `locked` flag alone, so unlocking an option in the
catalog moves it into the choices on its own. Options that a dedicated block owns are left out of
the plain list: the capacity rows (one family row each in CapacityUpgradesBlock, with the master
switch, the progressive switch and the pickup bonus rows), the shop slot and price rows, the
pond's value rows (the pond's mode row stays in the list, under its section, because that is the
choice offered there), the progressive tier ticks and their per family order rows
(ProgressiveTiersBlock), the five dark room rows (DarkRoomsSection), the retro switch with its
two arrow prices, and the difficulty block's copy multiples and heart ceiling. The test in
`apps/desktop/tests/randomizer/option-wiring.keep.test.ts` imports this file by path, which is why it keeps
its camelCase name. `catalog-by-lock.ts` partitions the shipped catalog once, since the catalog
is static module data.

## apps/desktop/src/compounds/RandomizerOptionRow/RandomizerOptionRow.tsx

One row of the options panel: the name with a status tag, the catalog's short line under it, the
control, and the In Pool cell, on the catalog's fixed grid so a value that changes width never
moves the control. A row the catalog locks renders its control disabled at reduced opacity, and
the tag says why. A row the catalog leaves open can still be frozen by the panel (`disabled`),
when another choice has taken the setting out of the player's hands: it keeps its own tag, and a
`note` in the blocking colour says which setting decided it. That row keeps full contrast,
because the value shown is the value the seed is built with and the sentence must not dim with
it. A `readout` row draws the value as a tag in the control's track. The frozen run view passes
no handler, so a range shows the recorded value without offering a drag that could not be saved.
The In Pool cell sits on the title's baseline, not the description's.

## apps/desktop/src/compounds/RecordingCard/RecordingCard.tsx

One debug recording in the bug report dialog. A recording with a video previews as a muted loop; one without ffmpeg has only PNG frames, so the card steps through them on a timer (`useCyclingFrame`) to read as a video. The card only asks: ticking and deleting go back up by callback, and the view confirms a delete.

## apps/desktop/src/compounds/ReportingAsLine/ReportingAsLine.tsx

Says who a report is filed as, in place of the email field once the app is signed in. The GitHub
login shows when the issue will mention it.

## apps/desktop/src/compounds/RescanButton/RescanButton.tsx

The one control that tears down and repopulates the controller list. It is small and icon only
and lives in a screen header, never on a device card, because the rescan covers the whole
subsystem. `isPending` stays true from the click until the next device snapshot arrives or a
timeout passes, and the glyph spins meanwhile.

## apps/desktop/src/compounds/RetroBowBlock/RetroBowBlock.tsx

One switch and, under it, the two costs a shot takes out of the wallet. The costs go inert with
the switch, because they only matter once the bow is fed rupees, and they are indented under it
so they read as its consequence. Both sliders stop where the seed's wallet does
(`packages/randomizer/src/world/retro/retro-cost-ceiling.ts`): the plain shot at the wallet's top, the silver shot at that top
divided by the final fight's count of back to back shots. A stored cost above the live top reads
as the top, and the line under the sliders says where the two tops come from. The first rung of
the bow family is the plain bow (`PLAIN_BOW_RUNG`); while it is unticked the first bow found
already fires silver, so the plain cost goes inert with the reason on it. Cost steps are 5
rupees: round numbers a game of this age would ask. An absent `onChange` renders the read-only
Options page.

## apps/desktop/src/compounds/SaveListRow/behavior/useRename.ts

Escape in the rename field is consumed (`preventDefault`), so the dismiss stack leaves the page around the row alone.

## apps/desktop/src/compounds/SaveListRow/SaveListRow.tsx

A save row is thumbnail, name over date, then the actions. The row wraps, so in a narrow column the actions drop under the name instead of squeezing it. The full name is in a tooltip because the name truncates, and a double click on it renames the save. Load is the one primary action, Overwrite is secondary and Delete is a danger icon button with a tooltip. The callbacks only ask for the action: the home tab shows a confirm dialog and runs it on yes.

## apps/desktop/src/compounds/SaveSlot/behavior/useArmedAction.ts

Two click confirmation: the first press arms one action and a second press on the same action
performs it. Arming the other action, waiting past the timeout, or showing new slot data all
disarm. `resetKey` is a digest of the data the slot shows, so any change disarms without a render
round trip.

## apps/desktop/src/compounds/SaveSlot/SaveSlot.css

The card's width comes from its container and its height follows the SNES frame (256 by 224). The
placeholder stops short of the action bar so the mascot is centred in the visible area. The
no screenshot badge is two layers on one 16 unit grid so the cancel ring carries its own colour;
the coordinates centre the combined ink, and a halo in the card's background colour keeps the
frame's strokes from blending into the ring. The mascot hops right then left forever, each jump
running crouch, launch, arc, land and settle. Squash and stretch happen off the feet
(`transform-origin` at the bottom edge) so push off and impact read as weight, and the arc frames
are spaced wide near the apex and tight near the ground, which gives the jump its gravity under
linear timing.

## apps/desktop/src/compounds/SaveSlot/SaveSlot.tsx

Only a slot that holds a save but has no screenshot gets the placeholder; an empty slot stays
bare. The placeholder mascot uses a relative `src`, because the packaged renderer is served from
`file://`, where a leading slash resolves to the filesystem root; the title bar and the About view
load these logos the same way. The action bar is the bottom slice of the card, blackened to stay
legible over the shot, with Load on the left and Save on the right in DOM order too, so the tab
order matches what is drawn. Each action takes one click to arm and a second to confirm. The
busy spinner covers the card with a scrim while the screenshot is captured and the slots reload.

## apps/desktop/src/compounds/SaveSlot/sub-components/SlotActionButton/SlotActionButton.tsx

No colour, filter or mask reaches the glyph: the emoji keeps its own palette, and only the half
behind it tints on hover, focus and arming. The glyph is its own stacking context so the armed
halo sits behind the emoji and above the button's tint. While armed the emoji bobs and a green and
gold halo wanders behind it.

## apps/desktop/src/compounds/ServerSetup/ServerSetup.tsx

An Archipelago server setup, drawn by the profile creation form and by the Randomizer page's
Network tab. The host field reports on its own (`onHostChange`), because a pasted `host:port`
splits across the two fields. The port field fits five digits.

## apps/desktop/src/compounds/ShopPricesBlock/behavior/bottle-content-rows.ts

The potion rule is read once here, and each content answers for itself on its own row. A cauldron
blocks its own content and nothing else: ticking the red cauldron greys the red row, says why on
it, and leaves blue and green as they were.

## apps/desktop/src/compounds/ShopPricesBlock/ShopPricesBlock.css

Every row spans the block's two column grid as a subgrid: its checkbox or label in the first
track and its control in the second, so all the sliders start on one vertical line however long
the names are. Each row stays a real box, so dimming and the blocked marker cover the whole line.

## apps/desktop/src/compounds/ShopPricesBlock/ShopPricesBlock.tsx

One row per currency a shelf may charge (a checkbox and the range its rolled amount is drawn
from), the bottle row with the contents a shelf may demand, and the percentage every rolled price
is scaled by. With nothing ticked no price is rolled and every shelf charges what the unmodified
game charges. Each counted range ends where its currency does: the capacity profile decides how
many rupees, arrows and bombs the seed can ever hold and the heart ceiling how many hearts, so a
range the player cannot pay for cannot be set. The percentage has nothing to scale until a
counted currency is ticked and stays frozen until then; a bottle price carries no amount, so it
is never scaled. Two rules grey a row from elsewhere on the panel and say why on that row: a
bottle content whose cauldron went to the shuffle cannot be demanded as a price, and arrows have
nothing to pay with once retro bow has taken them out of the world. The stored tick is kept, so
the choice comes back when the rule lets go. `onChange` takes one patch per edit because a range
writes both ends together; two calls in the same tick would each build on the old values and the
first end would be lost.

## apps/desktop/src/compounds/ShopPricesBlock/sub-components/ShopPriceModifierRow.tsx

The percentage has no opt in, since a hundred per cent already means "leave the ranges alone". It
dims and freezes as a whole while no currency is ticked, on the same terms as a currency that is
off.

## apps/desktop/src/compounds/ShopSlotsBlock/behavior/ (scope edits: summary-of, with-depth, with-mode, with-slot-count, with-slot-ticked)

One number drives both the count control and the total sentence: `opened`, the size of the set
this scope opens (`packages/randomizer/src/world/shops/shop-scope`). The counted modes take it out of the ticked set, and in
the custom mode it is the ticked set, so a control fed the stored `slotCount` would sit still while
the ticks moved and its fill would climb as the ceiling under it dropped. The stored count is
re-clamped after every edit, not only the slider's, so it never outruns a ticked set the player has
just made smaller. The edits live in a folder because
`apps/desktop/tests/randomizer/shop-slots-panel.keep.test.ts` imports `summaryOf` and `withSlotTicked` from this
path.

## apps/desktop/src/compounds/ShopSlotsBlock/behavior/retro-shop-note.ts

Both shelf names and prices come off the dataset through the same helpers the seed and the core
read, so the note never describes a shelf the game does not stock that way. With vanilla shops the
stock changes in place and nothing is shuffled; with shuffled shops the quiver is in the item pool
and its shelf always opens as a shuffled slot.

## apps/desktop/src/compounds/ShopSlotsBlock/behavior/shop-cards.ts

Every derivation for the shop grid lives here, so the card stays presentational and this is the
one place the shop slot records are read for the panel. A card's name is the short one, because the
grid is headed by world and repeating it says nothing. A lone slot has no shelf position worth
naming, so it wears its stock in its place. The stock line joins with a middle dot so it reads as
one sentence of stock.

## apps/desktop/src/compounds/ShopSlotsBlock/behavior/shop-count-control.ts

A slider promises two things: the value can be dragged, and the filled part of its track means
something. Only the counted modes keep both: they take a number out of the ticked set, so the fill
is the share of that set this scope opens. The custom mode's opened set is the ticked set, so the
value equals the maximum by definition and the bar would sit hard against the end while unticking
a slot dropped the number and left the fill still. Vanilla opens nothing. Both get a read out: the
same label, sentence and figure without a control that cannot move.

## apps/desktop/src/compounds/ShopSlotsBlock/behavior/shop-sections.ts

The split into world sections is read off the shops themselves, so a shop added to the dataset
lands in a section without this file changing, and a section with no shop is dropped. The light
world comes first because the game opens there.

## apps/desktop/src/compounds/ShopSlotsBlock/behavior/shop-total-text.ts

The total is a sentence (slots times items equals locations) and not three numbers, because the
multiplication is the part the player is deciding about.

## apps/desktop/src/compounds/ShopSlotsBlock/ShopSlotsBlock.css

The reading order (what the seed may take, which spots, how many) is made visible: the mode, the
cards under a heading per half of the map, then the two counted controls on their own plate under
a hairline. The dropdown keeps the same indent as the cards and sliders, so the three line up
under their headings.

## apps/desktop/src/compounds/ShopSlotsBlock/ShopSlotsBlock.tsx

The shop scope section, everything the Shops tab shows above the prices, in decision order. It
starts with the mode because the mode governs the rest: on vanilla nothing else on the tab can
change the seed, so every control under it (the cards, both sliders, and the prices block beyond
this component) draws inert. Then the cards, split into the two halves of the map and one per
shop, because the ticks are what every mode draws from; then the count, whose maximum is the size
of the ticked set, so the control never offers a slot that does not exist; then the depth and what
the two cost the seed. The count control and the total sentence read the same number off the
summary (the slots this scope opens), so they never disagree. The retro note sits under the
mode because retro is decided on the Items tab but its one shop consequence depends on the mode
chosen here. The block's fixed copy lives in ShopSlotsBlock.constants.ts so the sentences a player
reads are one short file to review. No handler renders the read-only Options page.

## apps/desktop/src/compounds/ShopSlotsBlock/sub-components/ShopSlotCard.tsx

The slot boxes are the only control on a card. A shop is on because something in it is ticked, so
a whole shop tick would repeat the boxes, and a shop that starts unticked wears an "Off by default"
badge, because "nothing ticked here" otherwise looks like a setting that got lost. The card has
three faces on `data-state`: on (a raised surface), off (nothing ticked, dimmed, so the grid reads
as "these are in play") and disabled (vanilla mode or the frozen Run tab, flattened onto the page
background with no dim, because the ticks already carry the disabled opacity and stacking a second
one would push the text under contrast). "Nothing ticked" rides on its own `data-empty` attribute,
carried by a dashed outline and a muted title, so it survives the inert face: a fresh profile opens
on the mode that freezes the block, and folded into the state, the one shop that starts with
nothing ticked drew exactly like the ten that start full. The slots sit on three fixed tracks so
boxes are the same size in every card and a one slot shop does not stretch across. Boxes are
squared off to read as shelf cells, and their height is fixed so a long label wrapping to two
lines does not make its box taller than its neighbours.

## apps/desktop/src/compounds/ShopSlotsBlock/sub-components/ShopSlotCount.tsx

The read out face stands where the slider stands and keeps the slider's type scale and inert dim,
so switching modes changes what the control is without the row moving or changing weight.

## apps/desktop/src/compounds/ShopSlotsBlock/sub-components/ShopSlotSection.tsx

Each world gets its own titled section, the same group every other part of the screen uses, and
the heading is what lets the cards drop the world words from their names. The section is indented
one step so its heading reads as a level below the group's title; the grid gives the padding back
so the cards start on the block's margin. The grid uses auto fill tracks that follow the grid's own
width, since the panel lives in a split pane, and `min()` keeps a single column from overflowing a
pane narrower than one card.

## apps/desktop/src/compounds/StoreItemCard/StoreItemCard.tsx

Cards are uploaded at 16:9, so the picture frame keeps that shape at any column width. A missing
picture draws the kind's icon in its place.

## apps/desktop/src/compounds/SunkenWell/SunkenWell.tsx

A sunken Box that goes inside a raised side panel of a studio, for lists and text areas. The surface comes from Tessera; the compound adds the column layout, the gap and the padding. The three studios draw their frame with Tessera's `StudioLayout` (bar, banner, start and end panels, editor toolbar), so RotP has no frame of its own.

## apps/desktop/src/compounds/TrackerInventory/TrackerInventory.tsx

Three views of the same inventory: the default view grouped by category, the in game view laid
out like the SNES pause screen, and the compact view as one flat grid with the upgrades broken
down.

## apps/desktop/src/compounds/UnavailableControllerNotice/UnavailableControllerNotice.tsx

Both remedies sit on the same card because the API can prove the device is connected and
unclaimed but cannot prove why: another process may hold it (Steam is the common case) or the
mapping database may not know it.

## apps/desktop/src/compounds/WishingPondRow/sub-components/PondAskControls.tsx

What the fairy may ask for, drawn with the same row the shop prices use (CurrencyPriceRow) so a
demand and a shelf price read alike. Each row costs one line on the block's grid, and the caption
above them spans the width as the group's title. Rupees, bombs and arrows carry a two thumb
range; the rupee one is the pond's price ladder, so moving it moves the ladder and the preview.
The bottle row counts how many bottles she may name and keeps its contents on the line under its
range. The item row is a tick alone, because what she asks to see is one item and no amount of
it. The edits in `apps/desktop/src/compounds/WishingPondRow/behavior/ask-with-*.ts` are pure: the whole ask goes in and comes back out. The
bottle's two ends use the same writer as bombs and arrows, since the row has the same shape.

## apps/desktop/src/compounds/WishingPondRow/sub-components/PondPriceControls.tsx

The Custom mode ladder controls: how many throws the pond sells, the curve that cuts the climb,
and the free sequence chips when the curve is "free". The climb's two ends are the rupee row of
the ask block above, because they are the same pair of amounts: what the ladder charges is what
she asks for.

## apps/desktop/src/compounds/WishingPondRow/WishingPondRow.tsx

The rupee pond in the options panel: the head line naming the mode the player picked (the
dropdown itself sits with their other choices, under its own section), the controls the mode
asks for, and the price schedule as a preview in every mode. It reuses the range, slider, curve
and jump chip controls of the capacity families, with the same tracks and rhythm, so the two
sections read and behave alike. Every setting the mode asks for sits on one grid of a label track
and a control track, so a demand's tick, a slider's name and the curve's name all start on one
vertical line, their controls on the next, and no setting spends a line on its own name. The
label track sizes to its content up to `--pond-label-w-max`, past which a long name wraps. Each
line is a subgrid so its dimming and blocked marker cover the whole line. `PondRowState` holds
indexes and choices, never prices: `range` holds the price ladder indexes of the first and the
final throw. Custom alone lets the player set prices; every mode but the legacy one carries pool
items. A price the wallet could not hold is held down to what it can and noted in the blocking
colour.

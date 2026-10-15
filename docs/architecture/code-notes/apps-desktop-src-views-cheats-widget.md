<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/CheatsWidget

Facts about `apps/desktop/src/views/CheatsWidget/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/CheatsWidget/behavior/pointer-hint-context.ts

One hint per tab follows the pointer and is shown by whichever control is under it. The context carries the show, move and hide calls; the layer that draws the hint and the hook that binds a control both read it.

## apps/desktop/src/views/CheatsWidget/behavior/reachable-rungs.ts

The capacity rungs a player can stand on with the upgrades the seed hands out, as ladder indices (the core's numbering). Custom progressive: the plan's own climb, since every copy takes the next planned jump. Custom fixed jumps: the start plus any subset of the plan's jumps, since the items can be found in any order and any skipped. In pool: the vanilla rung plus any subset of the reference jumps. Vanilla: the pond sells every native tier of bombs and arrows, the meter only has the bat's half cost level, and the wallet has nothing to buy.
Nothing below the start is ever offered: logic reads a family as its start plus what was collected, so a lower value would leave a price or the ending's arrows unpayable while logic still counts them as open. Without a seed the result is null and the core's ladder stands.

## apps/desktop/src/views/CheatsWidget/behavior/useCapacityLadder.ts

The core reports every rung its gates allow; a running seed narrows that to the rungs its plan reaches. The core has no event for a profile change, so the ladder is re read on the store's mode changes, on a 750 ms tick, when a session arms or disarms, and right after a write. Only a rung the ladder offers is ever written, so a seed's floor holds whatever the caller asks.

## apps/desktop/src/views/CheatsWidget/behavior/useCheatGates.ts

Which cheat categories the core honours right now, read from the effective gate word. A category that is off draws its surface inert with the reason, never a control the core silently refuses. The word only moves on a settings change or a game start, so it is re read on mode changes and on a one second tick, fast enough that a settings change lands before the next click.

## apps/desktop/src/views/CheatsWidget/behavior/useConsoleScale.ts

The pause components take a near integer scale (1 SNES pixel equals scale CSS pixels). A tab says how many tiles wide its widest row is and gets the largest quarter step scale that fits, the same way the pause menu derives its scale from the game view's height. Quarter steps keep every tile a whole number of pixels at the common widget widths.

## apps/desktop/src/views/CheatsWidget/behavior/useInPlay.ts

Normal play means module 7 (dungeon), 9 (overworld) or 11 (special overworld area) with submodule 0: no menu, message or transition running. The writes that change what the HUD draws (a capacity, the heart containers, an item, a bottle, the keys) redraw the HUD at once, and the HUD shares its layer with the message box, so the console offers them only in play.

## apps/desktop/src/views/CheatsWidget/behavior/useWheel.ts

A non passive wheel listener on whatever element the callback ref lands on, so an element that mounts later still gets it. The handler is read through a ref, so a new closure on every render never re subscribes.

## apps/desktop/src/views/CheatsWidget/CheatsWidget.css

The shell holds what more than one tab shares: the section caption, the input glyphs, the legend, the pointer hint and the two floating boxes. The body is a column so the check list can take the whole height while the other tabs keep their own. The floating boxes are portalled; the portal layer lets no pointer event through by itself, so each box takes them back, and it stays hidden for the one frame before it is placed. A long ladder (the wallet) scrolls inside the step box and hides no rung.

## apps/desktop/src/views/CheatsWidget/CheatsWidget.tsx

The cheat console: the game's own HUD and pause menu, made clickable. Player holds life, magic, counters and bottles; Items holds the pause grid and its panels; Rules holds state and combat cheats as tiles; Checks grants what a location holds. A profile written by an older console may still name a tab that is gone, so an unknown stored tab falls back to Player.

## apps/desktop/src/views/CheatsWidget/sub-components/ChecksTab/ChecksTab.tsx

The Grant button hands over what this run put at each location, and the row names that item, so a randomized file shows the seed's item and never the vanilla one. The rows are the tracker's own roster, so the console lists exactly what the tracker lists; building the whole dataset instead used to hide a seed's shop shelves and offer locations the seed never generated. A few pure progress buffer events carry no screen. Resolving a row's item walks the item records, so the visible list is planned once per session.

## apps/desktop/src/views/CheatsWidget/sub-components/ChoicePopover.tsx

The list a slot opens: one row per choice with its sprite, the current one marked, and an optional "all" control per row for a rack of identical slots (the four bottles). A give row plays the receipt, a set row writes the byte, a remove row takes it away. Portalled under its anchor so the widget's edges never cut it.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/behavior/build-slot-specs.ts

Nothing is retyped: a ladder's rungs, a by value pick and a held flag all come from the tracker's `packages/navigation/src/tracker/item-ids`, the sprites from the pause slot components, the labels from the item records (a fighter's shield reads "Blue Shield"). Specs are built per call because a published dataset bundle can replace the records under the labels. Rung i of a ladder is held at byte value i + 1, except the bow. The mirror byte is 1 for the scroll it starts as and 2 for the mirror the receipt hands over. A slot whose zero draws a sprite (armor) names that tier instead of "None".

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/behavior/is-removal.ts

A tier that draws nothing holds nothing, so picking it is the removal.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/behavior/is-slot-owned.ts

Armor always draws a mail, so it reads as owned at zero; every other slot is owned above zero.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/behavior/useSlotClick.ts

An owned slot (and the bottle slot) opens its list under the cell; an unowned one gives the lowest tier the receipt can hand over and flashes. The flash is a counter per slot, so the cell remounts and restarts its animation on every give.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/behavior/useSlotName.ts

An owned grid slot shows the localized name the pause menu would draw; an unowned one is named as if it held its first tier, drawn dimmed, so a ghost reads before it is clicked. Equipment and ability slots show the tier label from the item records. An unowned bottle slot draws an empty bottle.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/behavior/useSlotWrite.ts

A give rides the delivery queue, so the hold up, the message and the counters are the game's own. A set writes the byte directly: the remove, the downgrade and the "exactly this tier" path.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/ItemsTab.constants.ts

The panel geometry repeats the pause compounds' numbers so the editors land on the same pixels. The bow byte counts the arrows loaded on top of the bow held, so its two rungs sit at values 1 and 3. Save index 15 is the bottle selector, edited on the Player tab. The ITEM box has 17 by 13 inner tiles with the 5 by 4 grid one tile down and two across. EQUIP holds sword, shield and armor along row 1 and a dotted rule on row 3. The PENDANTS or CRYSTALS box is one tile narrower than the game's so it fits beside EQUIP; pendants sit courage on top, wisdom left, power right, and crystal N sits at index N in the game's 2, 3, 2 layout. The game shows crystals once the progress indicator reaches 3. The A box has the ability words in a 3 by 2 grid and the four passives on the bottom row in the game's order. Slots 20 to 26 are the CheatSlot numbers for gloves, boots, flippers, pearl, sword, shield and armor.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/ItemsTab.css

Every pixel size that follows the console scale is inline, the way the HUD components set theirs; the sheet holds only the click affordance over the game's own drawing. A panel label sits on the top border on a black plate that hides the border line under it. The flash after a give is a gold ring that fades while the receipt plays in the game.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/ItemsTab.tsx

The pause menu's five panels, made clickable. The name box follows the slot under the pointer only; the ITEM grid, EQUIP, PENDANTS or CRYSTALS and A boxes each edit what they draw. One tier list is open at a time, under the cell that opened it. The ITEM box is 19 tiles wide with its border; two more keep it clear of the edge.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/sub-components/AbilityTextGrid.tsx

The six ability words (LIFT with its level, READ, TALK, PULL, RUN, SWIM) come from the game's letter sprites in the pause menu's 3 by 2 grid, read only. When the store's ability word is still zero, the flags are derived the way the game sets them: gloves light LIFT, the book lights READ and TALK, PULL is always on, boots light RUN, flippers light SWIM.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/sub-components/ProgressEditor.tsx

The label switches between pendants and crystals; the default follows the game's progress indicator. Every pendant and crystal is a toggle on its SRAM bit.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/sub-components/SlotCell.tsx

A right click opens the list on any slot, owned or not, so a tier can be picked outright. A remount (a new key from the caller) restarts the flash that follows a give.

## apps/desktop/src/views/CheatsWidget/sub-components/ItemsTab/sub-components/TierList.tsx

A tier above the held one with a receive id is a Give (the receipt plays); every other tier is a Set (the byte is written); the empty tier is the Remove. The bottle slot shows a notice instead, since bottles are edited on the Player tab.

## apps/desktop/src/views/CheatsWidget/sub-components/NumberSetter.tsx

The box a right click opens on a number. A counted value takes plus and minus steps; a value with a ladder (a capacity tier) walks the ladder and shows every rung as a chip. Every press writes at once, so the game answers while the box is open.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/behavior/heart-write.ts

Health and capacity are in the game's units: 8 per heart, 4 per half heart. A left click lands health on that heart, the left half of an owned cell on the half heart, and a cell past the capacity raises the capacity to include it, then fills it. A right click lands the capacity on that heart.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/behavior/useNumberEdit.ts

A click opens a field over the digits with the value selected; Enter or blur commits it clamped, Escape drops it. A wheel tick moves one, or to the next rung on a ladder; the value a tick wrote is kept until the game reports a value of its own, so fast ticks step from the last write. Every commit goes through `write`, so the value stays in the game.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/PlayerTab.constants.ts

The widest block is the ten heart life meter with a little room either side (16 tiles). Small keys have no capacity byte. A ladder longer than 12 rungs (the wallet's 101) is walked by steps, not shown as chips. The keys counter reads 255 outside a dungeon. The meter's level codes are 0 none, 1 full, 2 half, 3 quarter. Save index 15 is the bottle slot the sprite table is keyed on. A bottle is two tiles square, one tile from its neighbour and from the frame. The HUD draws the silver arrow icon from bow value 3 up.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/PlayerTab.css

Every pixel size that follows the HUD scale is inline; the sheet holds the layout, the hit zones and their hover and ghost treatments. The meter's frame layer sits at a low z index of its own, so the meter box isolates it and the rows can rise above the frame without competing with the popover outside. Hovering a magic row lights it and every row under it, so the level a click would set reads as a fill first.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/PlayerTab.tsx

Every value is read from the live store and written through the bridge; nothing here mirrors game state. All of it sits under the stats gate.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/sub-components/CounterEditor.tsx

The ceiling walks the capacity ladder the mode offers: the native tiers on a vanilla file, exactly the rungs the seed's upgrades reach on a randomized one, plain digits where there is a single rung or no ladder (keys). A ceiling redraws the HUD, so it is locked outside play, and so is the key count.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/sub-components/LifeEditor.tsx

Twenty transparent cells sit over the hearts on the same tile arithmetic, under the LIFE label row (one tile plus its one pixel shadow). A container change redraws the HUD, so outside play only the health inside the owned hearts moves.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/sub-components/MagicEditor.tsx

Sixteen rows lie over the meter's interior, inset 0.8 tile from each edge of the 3 by 6 tile frame, the inset the meter uses for its black well. Row r from the top sets level 16 minus r, 8 magic units per level.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/sub-components/MagicLevelBar.tsx

The meter's cost level as a column of steps read like the hearts: one rectangle per level the file can stand on, filled from the bottom. A vanilla file has two (full cost and the bat's half cost); a seed has exactly the levels its upgrades reach, its empty level included when it starts there. The column spans the meter's inner well so the steps line up with the fill. A level redraws the HUD, so the column is locked outside play.

## apps/desktop/src/views/CheatsWidget/sub-components/PlayerTab/sub-components/NumberCell.tsx

Without a writer the number is plain digits, for a ceiling the console does not set; with a locked reason it is plain digits too, dimmed, with the reason as its tooltip.

## apps/desktop/src/views/CheatsWidget/sub-components/PointerHintProvider.tsx

The hint box sits 14 pixels from the pointer so the cursor never covers it, and is kept inside the window.

## apps/desktop/src/views/CheatsWidget/sub-components/RulesTab/RulesTab.css

Three sections of tiles in a widget about 340px wide; the square tile size comes from the spacing scale so three squares and their gaps fit. On a state tile the checkbox label fills the square so the whole tile is one click target, reversed so the art reads first, and written through the tile so it outranks the checkbox's own single class rules.

## apps/desktop/src/views/CheatsWidget/sub-components/RulesTab/RulesTab.tsx

The tiles come from three tables: one row per tile with its sprite, gate category, and the getter and setter it is wired to. The getters return plain module state, which never re renders by itself, so the tab bumps a tick after every write and when the remembered rules land a moment after the game starts. Tiles belong to different categories, so each tile goes inert on its own when its category is off. A ladder's first rung is the game's own value, so the tile lights its edge only once another rung is chosen.

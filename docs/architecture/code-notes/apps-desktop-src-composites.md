<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/composites

Facts about `apps/desktop/src/composites/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/composites/HudCount/

A vertical stack with the icon on top and the digits below, with no absolute positioning. `icon` is the sprite file name without its extension, `iconWidth` is in SNES pixels (8 for one tile, 16 for two), and `isMax` draws the yellow at max digits (see the Indicate Max Resources setting).

## apps/desktop/src/composites/HudCurrentItem/

The equipped item inside a bordered item box: the eight tile frame (corners, top, sides, bottom) around a black interior, with the 16 by 16 item sprite centred. The box is 4 by 4 tiles (32 SNES pixels): a one tile border round a 2 by 2 interior. The black fill is inset 0.8 tiles from each edge. `itemId` is the equipped slot id (1 to 20) and `itemValue` the slot's inventory value, its upgrade tier (see `getSlotSprite`).

## apps/desktop/src/composites/HudGlyph/

Draws one controller glyph at tile scale, one 16 by 16 SNES pixel tile pair like an item sprite (`size` is the edge in SNES pixels). The glyph layer is shared with the Node side, so it stores root relative asset paths and never runs them through the renderer's public asset helper (it has no `import.meta.env` to ask); applying that prefix is this component's job, which lets the glyph pipeline stay in `packages/`. Glyphs are vector artwork, not extracted sprites, so nothing asks for pixelated rendering: at a fractional scale a nearest neighbour glyph would look broken next to the pixel art.
A custom pack's source is a file key into the player's glyph library, which the glyph store has already turned into an object URL. That URL is used raw: `publicAsset` would mangle a `blob:` URL into a request for a file that does not exist. A key the store has not primed yet renders nothing and leaves the space; the cluster's geometry is fixed, so a missing glyph costs a hole and never a reflow.

## apps/desktop/src/composites/HudMagicMeter/

The magic meter is 3 tiles wide and 6 tall, matching the SNES tilemap: a top row (corner, top, corner), four rows of side, fill cell and side, then a bottom row. Magic 0 to 128 maps to 16 fill levels across the 4 interior cells, filled bottom up. The black interior is inset 0.8 tiles from each edge of the frame. In `accurate` mode the frame tiles sit above the black ground and the green fill; the green fill grows from the bottom by percentage, and a white cap line, narrower than the fill, sits on its top edge while it is not full.

## apps/desktop/src/composites/PauseButtonLabel/

The Y, X or A button letter sprite in its own colour. Button sprites are vertical strips 8 pixels wide and 16 tall (two tiles).

## apps/desktop/src/composites/PauseCrystalIcon/

A single crystal, empty or filled. A crystal is 16 by 8: two tiles side by side, one tile tall; drawing it square stretches the sprite to double height.

## apps/desktop/src/composites/PauseEquipSlot/

An equipment item (sword, shield, armour and so on) with its level dependent sprite, 16 by 16 SNES pixels. `EQUIP_SPRITES` maps the equipment type and level to the sprite file name. The heart piece and the armour always draw, including at level 0.

## apps/desktop/src/composites/PauseItemSlot/

A single item in the pause menu item grid: a 16 by 16 sprite or empty, highlighted when selected. `SLOT_SPRITES` maps a save slot index to its sprite by value; each inventory save slot stores a small value (0 is empty, 1 and up is owned or a level). The selection circle is a native 32 by 32 pixel art sprite drawn once to a data URL and scaled up with pixelated rendering; it is 4 by 4 tiles and reaches one tile past the item on each side.

## apps/desktop/src/composites/PausePendantIcon/

A single pendant, empty or coloured. Pendants are 16 by 16 (2 by 2 tiles).

## apps/desktop/src/composites/PauseScreenTabs/

Says which of the three screens is up and where the other two are. The tabs exist because the content does not fit: three screens need about 312 by 264 SNES pixels and the menu area is 310 by 160, so they take turns under a chrome that never moves. A tab strip says that out loud: the player sees there are exactly three and which one is up without pressing anything. Switching is a shoulder press in normal play; the click path makes the menu fully operable with a mouse. The tab wording is half a tile high so three names fit the strip above the panel.

## apps/desktop/src/composites/PauseText/

Draws one line of the game's own font from extracted sprites. The enhanced menu writes far more words than the six pre composed label strips cover (three screen names, three gear ladders, the status rows and the two actions), so it draws them a character at a time from the same font tiles the name panel uses. It can draw A to Z, 0 to 9, space and the ampersand; anything else takes a blank column, the same contract the name panel's glyph has. The ampersand is drawn across two native tiles, so its sprite is twice as wide. Folding a translated string down to that set is the caller's job (the view folds through `wrapName`), which keeps this a bare compound with no data of its own. `pauseTextWidth` gives a line's width in SNES pixels, which the screens lay themselves out against. `size` is one character's edge in SNES pixels (default 8, the native tile), and `dim` fades the line for an unowned, unreachable or inactive label.
The menu's colours come from the console's own menu palette and not the app's design tokens, for the same reason the magic meter's do: a token that follows the app theme would put an app coloured frame round game coloured pixel art. The focus green is the one the console uses for its cursor and selection marks, and the dim opacity is how far an unselectable or unowned element fades.

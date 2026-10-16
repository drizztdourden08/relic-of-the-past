<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views

Facts about `apps/desktop/src/views/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/BugReportRecordings/

The recordings section of Brock's bug report dialog (`rotpBugReport.section`). It draws nothing unless debug logging is on, a profile is active and a game session has registered the report snapshot, since the main process attaches recordings only in that case. Recordings not yet sent start ticked, and the ticked keys go to the transport as `captureSessions` in the report's extras. Only the recordings on screen count, so one ticked and then hidden by turning off Show sent is not sent. Deleting a recording removes it from disk (`debug-capture:deleteSession`).

## apps/desktop/src/views/ChecksWidget/behavior/useStickyHeader.ts

The pinned header is a per profile widget pref, so the settings panel and the tracker read the same value with no event plumbing, and it survives the widget unmounting and the app closing.

## apps/desktop/src/views/ChecksWidget/ChecksWidget.constants.ts

Every checks pref is keyed under the widget id `checks`, the same key the tracker data uses. The notify prefs turn the toasts for completed checks on, and keep them on while the tracker is closed. The view mode pref is the same key `useTrackerData` writes.

## apps/desktop/src/views/ChecksWidget/ChecksWidget.tsx

The shared checks tracker wired to the live tracker data. With a randomizer session loaded it shows each check's actual contents, the same as the randomizer page's spoiler tab. The tracker counts as open for as long as the widget is mounted, and the check toasts follow that.

## apps/desktop/src/views/CheckToasts/behavior/useCheckToasts.ts

Two sources finish a row on a seed. The tracker's completed set, diffed on every change, covers
every row the game writes a flag for. The substitution seam's own reports
(`apps/desktop/src/game/randomizer-client/override-fire-registry`) are the only word on a row no check record can see: a shop shelf, a
pond prize past the reference's two, any virtual row. Those never reach the completed set, so on a
seed they once passed silently. A reported location shows its check record, or the virtual row the
seed minted for it. Every report of one synchronous burst lands in one batch, so a backfilled
session arming reads as one jump, and whatever the seam reported before the hook mounted is not
news. Nothing shows outside a file in play, and what turns up right after the save changes (a
state load, a file entered) belongs to that file and shows nothing (`play-quiet.ts`); the quiet
window after a load is two sweeps long so the combined rows land too. More than `MAX_BURST` rows
at once is a load, not something the player just did. An item received within
`RECEIPT_WINDOW_MS` belongs to the chest that just completed, which tells what a swap chest
paid out. Turned off, the hook still follows both sources, so turning it on never replays what happened
meanwhile.

## apps/desktop/src/views/CheckToasts/behavior/useOnlineNoticeToasts.ts

A kind the profile's settings turn off shows nothing, and a burst folds into one summary
(`packages/randomizer/src/client/notice-burst`). The settings are read as each notice arrives, so a toggle acts at once.
Outside a file in play the room's news stays in the log only, with nothing on screen to tie it to.
A notice line's parts never reorder, so their index is a stable key.

## apps/desktop/src/views/CheckToasts/CheckToasts.tsx

A toast per check or event the player just completed, stacked at the bottom left of the play area
(the game picture, never the whole window), laid over the picture the same way the HUD overlay is.
Each toast is the tracker's own card, a size up because it is read at a glance over the game, and
it reads the same run context as the tracker's rows, so a card and a row never show two items for
one check. A status only row ticks and unticks with the live state, so it raises no toast. An
online session's notices (items both ways, the connection, DeathLink and the rest, each kind
toggled in the Online settings) join the same stack, one line each, with item and player names in
the highlight colours the profile chose (gold and green when none is set).

## apps/desktop/src/views/DataHome/DataHome.constants.ts

The card copy of the data home, one entry per page of the data area. Each item id is the page id (`data/<id>`), and each icon and title repeats the `meta` of that page. The page files are not imported here: a screen module loads on its own when its page opens, and the home must not pull every manager into its chunk. When a page is added, renamed or given another icon, change its entry here too. The groups follow the navigation groups, and Storage has no group in the navigation, so it sits under Data folder.

Descriptions say what the page holds and what you do there, from what the page renders.

## apps/desktop/src/views/DebugWidget/DebugWidget.tsx

A live view of every state value the game hooks sync (mode, HUD, equipment, inventory, dungeon progress, text, map). The two toolbar buttons flip the main HUD and the pause screen between the enhanced and the original drawing, through the `hudEnhancedParts` setting.

## apps/desktop/src/views/DeliveryQueueIndicator/

A bottom right overlay showing the delivery queue, visible only when items are queued. It shows up to 20 items, with a more in queue line beyond that. Known source types have their own colours (cheat amber, randomizer purple, network cyan, system grey); player sources (`player:Name`) are teal and show the name after the colon, and unknown sources are soft blue.

## apps/desktop/src/views/DialogView/

The enhanced message box. It reads the core's dialog mirror through the dialog store and the look from the dialog settings store, and draws the frame and rows over the canvas in either HUD mode. Skipped messages never show: with skip dialog on, only a box that waits on a choice is drawn. Nothing is drawn for a message the core is still drawing itself, which is how a setting changed mid message lands: that message stays native and the next one is ours (`dialog_suppress.c`). A save state load that brought the mirror back shows its message where it was saved; one that did not leaves the store stale until the next message, and nothing is drawn. The box fades in when a message starts and fades out on its last content when it closes, so the last shown frame is kept while it fades.
Message 0x112 is the legend told over the pictures, the story crawl's first part (`attract.c` loads it by this id). Messages 0x184 and 0x185 are the spawn picker on starting a game or continuing after death, without and with the mountain spawn (`misc.c`); the spawn picker always floats on a faded ground whatever border the player chose. Message 0x1F is Zelda's telepathy in the opening at Link's house, her call while Link is still in bed (the uncle raises it).
A drawn border and its corner marks take room the game's one tile inset never had to give. The game's box keeps its one tile inset; a drawn border needs a little side air past its ring, more with corner marks so the rows clear them, and only a sliver above and below. Screens the game lays out around their words keep the game's text position and size: the game over menu (the fairy points at each row) and the story crawl (placed over its scene, moved by layer scroll). A talk box always has a ground. The legend told over the pictures and the game over menu never do; the later story scenes do, always faded at the edges. A borderless message such as telepathy follows its setting, with the opening telepathy at Link's house on a setting of its own. The glyph atlas is cached per font and palette; asking per message catches a language switch or a colour line.
`pickerItemSprite` gives the sprite of the item the throw picker has selected. The picker index walks the save block from the Bow on: 0 to 19 are the item slots, 20 to 23 the Power Glove, Pegasus Boots, Flippers and Moon Pearl, 25 to 27 the sword, shield and mail, and 28 to 31 the four bottles by their contents. Index 24 is a byte the game never fills. Bombs hold a count, so any count shows the one bomb sprite.
`useButtonGlyphs` resolves a prompt's buttons to pictures of the input the player is using: the active input profile's binding for each SNES button. It follows profile switches and controllers plugging in or out, so a prompt already on screen updates. A profile picked on the Controls screen changes the manager without an event, so each call reads it fresh, and the version counter re renders for the changes that announce themselves.
`useChoiceLatch` holds the wait a message is on through a choice redraw. Moving the cursor makes the engine load the menu's other message and retype it into the same box, so for a few frames it reports typing and no choice. Once a box has asked for a choice it keeps asking until a new box starts or it parks on a plain next or close wait, which is what the prompts and the skip rule need to see. `useOpeningMessage` gives the message a box opened with: a menu that redraws on a cursor move loads other messages into the same box, so the id on screen stops naming the menu while the first one still does.
`useDialogGeometry` gives the box layout in CSS pixels: the game pixel layout from `box-geometry`, placed by the overlay's scale. A box that follows its rows keeps the layout it had once a scroll starts, because the rows in use change under the box mid scroll; the frame never changes size while the rows slide, and the next still frame lays it out again. The text width is in game pixels with magnification included; `unit` is CSS pixels per game pixel for the text and `tile` for the frame tiles. The padding is in game pixels between the frame and the text, and a native layout moves with the text layer's scroll as the game's text does.
`useDialogScale` maps game pixels to CSS pixels the way `HudView` does: the scale comes from the container height against the canvas's native height (the canvas buffer is twice the native height, 448 for 224 lines and 480 for the 240 line mode), the 256 pixel screen sits centred inside a wider canvas, and the picture starts below any lines the view adds on top, shared with the HUD so the two cannot drift apart. The renderer draws output row r from scanline r plus 1, as the hardware does (`ppu_runLine` skips line 0), so every background tile shows one game pixel above its tile coordinate, and the box follows the text.
`useFadePresence` keeps a thing mounted through its fade out (140 ms by default). `shown` says whether it should be on screen; the hook answers whether to render it and at what opacity, so a box that just closed stays for the fade with its last content, and a box that just opened mounts at zero and rises on the next frame so the transition has a start value.
`useHighlightLook` gives the two highlight colours of randomizer messages as the box paints them, snapped to the game's 15 bit colours first, the same words the core draws the native box with, so both boxes match. Original glyphs get an atlas per colour; the modern face gets the colour as ink. Index 0 is the primary span and index 1 the secondary. The atlases are asked per message, like the plain atlas, so a language switch or a new palette is caught.

## apps/desktop/src/views/EnhancedPauseView/

The host owned pause menu: three screens under one chrome, drawn at true SNES scale over the running game. It is the only tier in the feature allowed to touch a store, and it touches four: the pause machine for where the cursor is, the control scheme for what the buttons fire, the layout store for the cluster's shape and glyph pack, and the game UI store for what the save holds. Everything below is bare and presentational, so the screens can be drawn from props alone. The chrome never moves: three screens need about 312 by 264 SNES pixels against the 310 by 160 the menu area has, so they take turns while the tabs, the legend and the cluster column stay where they are. The cluster is held on the right with every assignable button drawn, assigned or not, because a player looking for somewhere to put an item has to see the empty buttons; this is where the menu deliberately disagrees with the gameplay HUD. Scale comes off the canvas's own height so the menu stays pixel aligned with the game in 240 line mode too.
It performs no writes of its own: a click lands as the same `PauseEvent` a pad press does (focus, then confirm), and the store performs whatever that means. The view once held the bridge for a gear tier, which left a pad player able to move onto a blade and press confirm to no effect. The menu has no ground: everything readable carries its own (opaque panels, the legend's plate, a dark halo on loose text, see `hud.css`), and the portrait is the live character drawn at their own screen position with the game's sprite suppressed underneath (`PauseHeroLayer`). The view draws the browsing position from `useVisibleBrowsing` and not `state` directly, because `closing` names no screen. It solves the same document the gameplay HUD draws, once, and pins only the part that draws numbered slots to its own column wherever the layout puts it, so a player who moved their buttons still finds them, with no second copy of the map's geometry. The name `EnhancedPauseView` is the product's name for this menu and is kept because `GameOverlay` in the app domain imports it.
The published chrome: a top strip for the vitals, a 16 pixel legend along the bottom, and a column on the right for the button map, leaving the screens 310 by 152 at 16:9. The column is no longer a number: it was an 80 pixel reserve with a comment claiming the cluster was 72 wide, false since the d pad group was added (contract section 15.5, open item 3); the menu now pins the map by its own measured bounds, and only the two insets (8 from the right and the top, like every fixed element) survive. The top strip is 56, not the 48 first published, because the vitals reach y 44. The tab strip sits beside the vitals, not under them: the vitals are an L, two 80 wide rows down the left (hearts 6 to 22 at a full block, the meter 28 to 44) with the 30 wide counts column beside the hearts at x 94, reaching x 124 and y 44. The panels start at y 56 and the strip is 9 tall (a 6 pixel glyph, 2 of padding, a 1 pixel underline), from y 46 to 55. A vertical answer cannot work: when the counts stacked under the meter the block reached y 74, eighteen pixels past the panels' origin, and the column has only eight pixels of slack (the bottle box ends at 200 and the legend owns 208 to 224). Beside the vitals there is room: the strip is 106 wide (ITEMS 30, GEAR 24, STATUS 36, two 8 pixel gaps) from x 132 (8 plus 116 plus 8) to 238 in a menu area that runs to 318, and the two rectangles are disjoint on X, so the life block growing to a second heart row can never reach it.
The menu wording is uppercase A to Z only, because the menu draws text from the game's font sprites (letters, digits, space and the ampersand). A hint line holds 16 characters: the 96 pixel portrait column divided by the half tile glyph; a centred line wider than that sticks out both ways and runs back across the panel, so hints wrap to it. The gear screen's two assignable rows (the blade and the passives) say so, because they are the only home the two gameplay verbs (the swing and the reach) have. A refusal stays up 1.6 s. The legend verbs read left to right. MAP was dropped because the map button raises no menu event (`menu-edges.ts` emits none), and CONFIRM because the word never answered what a press would do; a confirm's verb is keyed by the confirm rule's own answer (equip, remove, activate), so a new outcome cannot reach the strip without a word. The assign row names no button, because any button the menu is not using will do.
`heroScreenPoint` turns world position into screen position for the one sprite the menu draws itself. The engine writes `link_x_coord - BG2HOFS_copy2` into OAM (`player_oam.c`), so the screen position is the world position minus the camera, but the rendered view is not the camera: a wide or tall view renders a band on each side and, under the camera lock, shifts by `cameraLockShift`, so the canvas origin is the camera minus the lock shift minus the side budget. That is the origin the navigation overlay anchors against (`buildDrawContext`); an overlay that subtracts the bare camera drifts as the view re centres. The result is in SNES pixels from the rendered view's top left, the space `useHudViewport` reports. `useHeroAnchor` reads it once per open and again when the save's `linkX` and `linkY` move, which under a held menu is never; the store's copy is only the trigger, and the answer comes from the viewport query, which reports the position and the camera from the same frame. A refused or not yet running query reports zeros, and drawing the character in the corner is worse than not drawing them.
`useHeroIdle` is the clock behind the idle sequencer in `packages/game-data/src/logic/hero-idle`, which is pure and knows only what a clock value means. It counts in game frames (sixtieths of a second) because every hold in the sequence table was transcribed from the engine's per frame counters. It re renders only when the drawn pose changes: the clock ticks at the display rate (120 or 144 here) while poses change about fifteen times a second, so the setter returns the previous object when nothing moved. Before the first tick the character stands facing the viewer. The take is re rolled on every open; re opening onto the closing pose looks like a paused video.
`useHeroWearing` gives what the character wears and the palette that shows it. The core keeps armour and gloves as two small numbers, and `resolvePalette` mirrors PushBank in the C player sprite hook, so the sixteen colours are the ones the PPU would hold and a tier change on the gear screen repaints the portrait in the same breath. Armour tiers map to the first three outfits; the fourth outfit is its own art. The sheet is the profile's chosen sprite over the stock one, with the stock palette behind a tiles only container so an imported sheet is never colourless; it loads in an effect because it is a one shot read of a file that cannot change during a game.
`useGearModel` builds the gear screen's rows. Selectability is the high water mark, never the live equipment, which is why the ladders can be walked down; the mark lives beside the profile's other JSON and not in the save, because every byte of a cartridge save already means something. Passive sprites resolve through the record dataset so the game's item names stay in the data layer where the copyright gate expects them. Only the lifting pair has a second tier, and an unheld passive draws its tier one art as a silhouette. The launcher's byte carries which arrows and whether any are nocked, so the arrow row's rung is the type read back out of it.
`useItemModel` splits `buildItemCells` (twenty four cells from twenty save slots, the split tool and instrument pair, the four bottles, and the tier one silhouette) into the grid's twenty cells and the bottle row's four, and looks up the selected cell's name through the same localized names and fold and wrap as the original menu. The bottles follow the twenty item cells in the cell index.
`useLegendEntries` builds the bottom strip from the player's actual bindings; no letter is hardcoded, since every menu verb is rebindable and a legend saying A to confirm would be wrong the moment confirm moved. Each verb resolves binding to position to glyph through the same pack chain the cluster's chips use, with the player's own packs included (contract section 12, gap 3), so strip and chips never disagree. A stick claims no SDL button position (which frees the d pad for slots), but for the legend it is a visible control, so an axis maps to its own axis position (`LEFT_X`, `LEFT_Y`), which every pack answers with the neutral stick art, and never to the stick click, whose glyph means pressing the stick in. Both axes of one stick share an entry and collapse to one glyph. The strip says what this cursor can do: every row is asked of `pause-menu-store`, which answers from the same rules the presses are planned through (`confirmVerbAt`, `assignTargetAt`, `firstSectionOf`). Navigation and CLOSE are true everywhere. `canConfirm` from `useVisibleBrowsing` and the store's cursor actions are two readings of one rule; where they disagree the confirm row is dropped, because a strip one verb short for a frame costs nothing and a strip promising a dead press costs the player the try. A control no pack draws shows its own text, folded to the letters the font can draw.
`usePauseAssign` is the mouse's way of putting the cursor's thing on a button, plus the hint line. A click dispatches the same `slot` event a pad press raises, so both go through `planAssignment`. The wording and the refusal flash are this hook's own: the store only counts refusals, and the flash must clear itself or it becomes a permanent label. The standing line is per section: the item grid, the blade ladder and the passive row each put a different thing on a button, and the guard and armour ladders accept none. The hint is wrapped here, through `wrapName`, to the 96 pixel portrait column every screen centres it in, with one row more than the longest line needs, because `wrapName` keeps whatever is left on its last row.
`usePauseCursor` is the mouse's half of the menu: land the cursor, jump to a screen, fire what it landed on, each a `PauseEvent`. A click uses the machine's `focus` event, which still lands through `clampCursor`, so it cannot reach a cell a d pad could not. A tab click raises the screen verb, because a screen opens where it opens (on the worn blade, not the no blade rung); sending cell zero once let a click on the GEAR tab arm a confirm that would have unequipped the sword. A gear tier and save and quit are now both `confirm`, so the rule for what a confirm means is asked in one place.
`useStatusModel` gives the dungeon row: map, compass and big key for the current dungeon. The flags are 16 bit masks with dungeon 0 at the top, and the palace index is doubled, so the test is the core's: shift the mask up by half the index and read the top bit. Outside a dungeon (palace index 0xFF) all three are silhouettes, so the row keeps its shape.
`useVisibleBrowsing` separates what the menu draws from what the machine is doing. `closing` carries no screen, section or cursor, but the menu is on screen for the whole 483 ms slide out, and falling back to a default there swaps the panel to the item grid on its way off (the tab underline jumps, the ladders become the inventory, the name changes, the legend drops CONFIRM). So the view keeps the last browsed place, including the confirm answer, until the layer is gone. Assigning during render is safe because the value is derived from this render's state and the write is idempotent.
`PauseHeroLayer` draws the character where they stand, at the live player's screen position from `useHeroAnchor`, never a constant; the camera keeps them near the middle, which looks like a layout choice but moves with them. The game's sprite is suppressed underneath while the layer is up (`HostMenu_HidePlayerOam`, `host_menu.c`), and the character draws at native size so it registers with the world. It is a sub component because it re renders about fifteen times a second and the view does not. Its outer box is mounted whether or not the menu is open and carries `counterTransform`, the exact inverse of the menu's slide with the same transition, so the character stays on their spot during the animation; it must exist before the slide starts or the cancellation would be a frame late. The idle clock runs only while the menu is open.
`PauseScreenHost` picks which of the three panels is on, which keeps the view about stores, and lets the screens be exercised with every value as a prop. No screen draws the portrait any more; the columns stay reserved because the name and the hint are laid out against that width. The status vitals carry the armour tier so the panel's hearts match the main HUD. The hint lines are chosen and wrapped by the view, and `onConfirm` fires the cell the cursor is on, one door for every screen.

## apps/desktop/src/views/GameLayer/behavior/overworld-screen-id.ts

The overworld is an 8 by 8 grid of 512 pixel screens. The screen under the camera is found from the camera position plus half the view (128 by 112), divided by 512 and wrapped to the grid.

## apps/desktop/src/views/GameLayer/behavior/useCanvasOverlayLoop.ts

The shared requestAnimationFrame lifecycle for a WebGL overlay driven off the game canvas (edge glow, shadow casting). Each feature supplies its async setup, its per-frame body and an optional teardown. The loop waits one frame before it starts, so SDL has set the canvas size, then matches the overlay buffer to the game buffer. Bumping `canvasKey` tears the loop down and starts it again.

## apps/desktop/src/views/GameLayer/behavior/useControllerOverlay.ts

The overlay's mappings are recomputed when `paused` flips, so they reflect the bindings and profiles of that moment.

## apps/desktop/src/views/GameLayer/behavior/useEdgeGlowLoop.ts

The edge glow mirrors the screen edge into the extended viewport on the overworld (`OVERWORLD_MODULE`, game module 9). `locationModule` is the physical location, unaffected by text and menu overlays. Bounds are only updated on the overworld, so they freeze during text and events. A 240 line tall SNES screen counts as extended and gets a 16 pixel bottom margin.

A screen crossing shows as a jump of more than `SCREEN_CROSSING_JUMP_PX` in any black bound while on the overworld. The bottom bound counts too: a crossing between two areas of equal width moves neither horizontal bound, so without it an up or down crossing never tripped and the glow kept compositing the departing screen's edge. On a crossing the glow fades out fast (about 80 ms, `FADE_OUT_PER_SECOND`), because every frame of it shows the wrong picture, and fades back in over a quarter second once the bounds stop moving. Waiting for the fade to finish would hold the glow out while it is still on its way down.

The mirror pass uses a clean frame without the HUD. A pending save-state screenshot is taken from this visible frame, in the same turn, which avoids hidden canvas readback quirks.

## apps/desktop/src/views/GameLayer/behavior/useProfileSwitcher.ts

The profile switcher opens on an active profile change and hides itself after `AUTO_HIDE_MS`. With a single profile it never opens, because cycling never fires.

## apps/desktop/src/views/GameLayer/behavior/useShadowCastingLoop.ts

The shadow project loads when the loop starts, then follows the editor store while the editor is open or dirty, so live edits show at once. The renderer gets the view origin every frame through the same helper the overlays use, and new screen data whenever the overworld screen changes or the editor is dirty.

## apps/desktop/src/views/GameLayer/GameLayer.tsx

The game layer stacks three canvases of the same size: the game canvas SDL draws into, the edge glow canvas, and the shadow casting canvas. `useCanvasDisplaySize` sets their CSS size, and sets it again one frame after the game starts running, because SDL and Emscripten strip inline styles while the WASM core initialises. `useCanvasBufferSize` reads the game canvas buffer back once the game runs, since SDL may resize it.

A fresh canvas element (a new `canvasKey`) is made when the game returns to idle after it has run once (a crash or a reset), never on first mount. Docked widgets shrink the game area through the exclusive insets store. The controller presence check waits `CONTROLLER_PRESENCE_DELAY_MS` after the game starts, so HID enumeration and gamepad activation have a moment to fill in. A pause whose name is empty or `Manual pause` shows the plain pause icon; any other name is a disconnected controller.

## apps/desktop/src/views/GameLayer/sub-components/NavigationOverlay/sub-components/DotLegend.tsx

The ring of a dot says which layer or layers the flood reached the tile on; the fill says what kind of result it was. Arrows have their own legend box because an arrow is an edge between tiles, not a property of one.

## apps/desktop/src/views/GameLayer/sub-components/ShadowEditorOverlay/

The editor overlay draws only on the overworld and only with preview mode off. Hit testing works in world space: lights first (a small radius), then heightmap shapes, last drawn first. A freehand shape is hit inside its polygon or near an edge. Dragging a vertex of a regular polygon turns it into a freehand shape with those vertices. A right click during a drag puts the element back where the drag started. Keyboard shortcuts while the editor is open: Ctrl+Z undo, Ctrl+Y or Ctrl+Shift+Z redo, Delete or Backspace removes the selection, Ctrl+S saves, Escape returns to the select tool.

## apps/desktop/src/views/GameLayer/sub-components/ShadowEditorOverlay/behavior/ (the gizmo files)

The transform gizmo of the shadow editor, in display pixels around the shape's center. The Y axis arrow points up. The uniform resize handle sits on the upper left diagonal. Vertex points are stored in the same local, unrotated space the hit test turns the mouse into. Shape rotation is stored in degrees and the gizmo works in radians.

## apps/desktop/src/views/GameLayer/sub-components/ShadowEditorOverlay/behavior/render.ts

- Viewport info feeds the edge-glow shader. Null when the module is not running or the export does not exist.
- Main module values: 7 dungeon, 9 overworld, 14 menu, 0 and 1 intro and title. The location module is the physical location, unaffected by text and menu overlays; active gameplay is location module 7 or 9.
- Location type: 0 overworld or other, 1 house or cave, 2 dungeon.
- `extraLeftRight` is the most extra pixels per side the config allows; the left, right and current extras are uint16 because very wide ratios exceed 255.
- The current extras are valid map content beyond the base 256 width or 224 height. Black edge = budget minus actual extra.
- `extraTopBottom` is the tall budget per side, 0 when the view is not tall. Without it the legacy extend_y mode adds 16 lines at the bottom only (a 240-line picture).
- Camera X and Y are the BG2 scroll. The camera lock shift is signed: the rendered view sits at camera minus shift; 0 means no lock.
- `inDoorway` is nonzero while the player occupies a doorway (its orientation, not a flag). `doorAnimStep` is 0 when no door animates.
- The clean frame is rendered without HUD or BG3 into WASM memory as RGBA.

## apps/desktop/src/views/GameLayer/sub-components/ShadowEditorPanel/sub-components/NumberField.tsx

Escape calls `preventDefault` so the dismiss stack treats the key as consumed and leaves the surface the field sits on alone.

## apps/desktop/src/views/GameOverlay/behavior/useEnhancedAspectWatch.ts

The other half of the host drawn styles' 16:9 rule: the window itself getting narrower. The
settings screen already drops the style when a setting narrows the ratio, but with
`aspectRatio: 'auto'` the ratio is measured from the live viewport, so a player who drags the window
in changed nothing settings can see and would keep a clipped HUD until the next settings change.
This watches from a component mounted during gameplay and asks for the same drop, with the same
notice, through the same request. It is debounced because a drag fires continuously and the check
reads layout; `RESIZE_SETTLE_MS` is long enough to sit out a drag and short enough that a resize
feels answered. The threshold itself lives only in `enhancedAspectAllowed`.

## apps/desktop/src/views/GameOverlay/GameOverlay.tsx

Sized to the game canvas with `pointer-events: none`, so the canvas keeps the mouse; the host drawn
pause layer turns pointer events back on for itself while the menu is open, the only moment
anything in here is meant to be clickable. The pause menu slide takes 29 frames at 60fps, 483ms
linear, matching vanilla.

The HUD style picks a pair, and only the pair: Original keeps the sprite HUD and the sprite pause
menu exactly as they were; Enhanced and Modern swap in the placed HUD and the host owned menu.
Every style reads the extracted sprites for the active ROM, and without them an HTML notice shows
in their place, which has exactly one cause: no sprites extracted for this ROM. Both pairs take the
same slide props from different sources, and that difference is the point. Original mirrors the
native menu, so its slide is read from the native menu's own state machine once per frame, and
that poll runs for Original only. Enhanced and Modern are the menu: `kFeatures2_HostMenu` parks the
native machine so the host can draw its own, and polling it would cost a call per frame to learn
nothing; the slide follows the host's pause store instead. A parked machine's state describes
something deliberately stopped, and letting it place this layer once left the menu "open" while it
sat entirely off the top of a frozen game. The host menu is on screen only while `browsing`:
`closing` slides it away as the core begins its own close scroll, so the two run together, and the
takeover's `holding` flag is read alongside as ground truth that the core still holds the menu for
the host. The host drawn transition is unconditional because the layer only moves when that phase
flips; a transition switched off at rest is one dropped frame away from teleporting the menu into
place. The main HUD shows only in gameplay and dialogue (`hud-visibility`). The app drawn HUD holds
its place while the host menu is up, unlike the sprite one: the menu's chrome is measured around it
(a 48 pixel top strip left for the vitals, a legend along the bottom), so sliding it away would leave
those bands empty; only the cluster steps aside, and HudLayoutView does that itself because the menu
pins its own cluster to the same corner. The reimagined title draws over the hidden native one while
the intro runs, and the enhanced message box draws in either HUD mode while the native one is kept
off VRAM.

## apps/desktop/src/views/GameView/GameView.css

In the notch "usable space" mode the whole app is inset away from the camera cutout. The padding
goes on `.app`, the flex parent, so the `position: absolute` layers inside `.app__content` shrink
with it. The default notch fill mode renders edge to edge.

## apps/desktop/src/views/HudLayoutView/

The app drawn HUD: a document of nested containers, solved against the display it is on and drawn. It is the only tier here allowed to touch a store, and it touches three: the layout store for the document, the control scheme store for what each numbered slot fires, and the game UI store for what the save holds. Everything below is bare and presentational, which is why the whole HUD can be previewed in the layout editor without a game running. There are no fixed elements and nothing here knows the name of one: the layout is a tree, `usePlacedLayout` turns it into rectangles in SNES pixels against the real view, and `HudNodeRenderer` draws them at the display scale. A layout survives a resize, a change of aspect ratio and 240 line mode without being re authored, and it reflows: a save with three heart containers closes the gap under them.
The button map is the one part that comes and goes. The pause menu pins its own copy to the right column, so this one stands down while the menu is up, and the layout's own reveal rule can hold it off screen until something about it changes. The rest is drawn unconditionally, because vitals and wallet stay readable with the menu open. Whether the menu is up is asked of the core's own view of the menu, not of the pause store: the hold is in force and the native menu module is running. The data scope every bound value, repeat and switch reads from (`packages/hud/src/data/variables`) is built from the same vitals object the renderer gets, so the two never disagree about the save. `showAllChips` holds the cluster on screen regardless of the reveal rule, for a host showing the HUD and not playing under it; it no longer decides which chips are drawn, since every assignable button is drawn everywhere so a player can always see where an item could go. `slideTransform` and `slideTransition` let a host slide this HUD with a pause animation; the host drawn pair does not, because its menu's chrome is measured around the HUD, which holds its place while only the button cluster stands down.
`countdownContentOf` splits the tracked countdown into what a `countdown` node draws and what the data scope reads (section 62); it is pure so the path from a parsed reading to a placed node is testable with no store and no DOM. `frames` is the game's frames left in this second, which the track does not keep; the seconds are the track's, so the scope and the pie agree. `useCountdownContent` feeds the same store `HudView`'s countdown slot feeds (`apps/desktop/src/stores/hud-countdown-store`), so the length a countdown started from survives the HUD unmounting on the map screens; feeding it twice with one reading changes nothing.
`deviceFamilyOf` says which device family a bound slot list came from. The glyph chain needs a family so the auto pack can follow the pad in hand, but the control scheme store carries bindings and not hardware, and asking the SDL device list would put an IPC round trip in a per frame render path. Slot icon keys are family stamped by construction (`xbox-a`, `ps-cross`), so the answer is in hand. The icon is asked first, because it is the only thing that describes the device; the binding describes what one control was rebound to read, and asking it first once let a single slot moved to a keyboard key turn the whole cluster into key caps. The binding only counts for a slot that names no position (a keyboard profile's slots, which SDL never enumerates). The family most slots vote for wins, so one rebound control cannot outvote the pad it sits on. The prefixes are ordered so a short one cannot shadow a longer key. With no vote, the profile's declared family is the backstop, then `generic`.
`declaredDeviceFamily` reads the active input profile's own declared family. A generic or unrecognised pad names its controls with family less icon keys (`generic-btn`), so the slot list says nothing about the hardware, but the profile has known the answer since the device was assigned. It uses `peekInputManager`, never `getInputManager`, because it runs in a render path and the getter constructs and starts the engine; a HUD drawn before the engine exists must get null. Reading without subscribing is safe: both readers call it inside a memo keyed on the resolved bindings, which the engine rebuilds and rebroadcasts on every profile change and device snapshot (`rebuildSchemeBindings`).
`useClusterVisibility` says whether the button cluster is on screen. `on-change` is the reason it is a hook: the cluster is a reminder and earns its space only when something about it changed (an assignment moved or a different pad was picked up), then gets out of the way after 2 s, long enough to read four chips and gone before the next room. The first signature is not a change, or loading a save, opening the pause menu or resizing the window would look like a rebind. A document with no rule means always.
`useGlyphPacks` gives every glyph pack the resolver should see, the shipped ones plus the profile's own, with their images primed. A custom glyph needs both its pack in the list `resolveGlyph` walks and an object URL `HudGlyph` can read synchronously; both are async and neither is useful alone, so priming happens before the state update and the first render that sees a custom pack can draw it. The shipped packs are the initial value so the cluster has art to draw on the first frame.
`useHudViewport` gives the display scale and the play field size in SNES pixels. The scale comes off the canvas's own native height, not a constant, because the core can run in 240 line mode and a hardcoded 224 would leave the HUD a few percent oversized exactly when the extra rows show. The width derives from the same scale, so a wide display reports a wide play field and an anchored element keeps its corner.
`placeLayout` solves the document and splits it into the button map and everything else. Two surfaces draw the same document at once and disagree about one part: the gameplay HUD draws all of it, while the enhanced pause menu draws its own copy of the button map pinned to its right column with the vitals and wallet left in place. The map is separated by what it contains, not by name: a band holds the button map when something in it draws a numbered slot, so a custom layout is treated like a shipped one. A band is a direct child of the screen, what a `regions[]` entry became in section 42; `layoutHudBands` reads the groups off one layout pass, because a child of a grid cannot be placed alone. The screen's own row rides with the rest, being the ground the layout sits on. `bounds` is the union of the map's ink (elements, not containers, whose box can reach past their children), item overhang included, so there is no second measurement of the cluster. `usePlacedLayout` memoises on `ctx` by identity, so a caller memoises it over the values it is built from.
`useSlotContent` is the live half of what a placed layout draws: what each numbered slot fires, whether the save holds it, and which artwork its control wears. The arithmetic is `buildSlotContent`, pure and shared with the editor's preview; this hook only reads the stores, which stopped the editor and the live HUD disagreeing about a rebound button. Every slot is answered for, in gameplay as in the pause menu, because the map answers what is left and a map that hid empty buttons could not. The player's own packs are included or a custom pack would resolve against a list it is not in. The control scheme slice (contract section 10) is declared structurally so the dependency is a shape, not a coupling.
`useVitalsContent` gathers everything the vitals draw from: the game's counters, the two display preferences that change how a counter reads, and the armour tier, which is equipment and tints every heart. Health is stored in eighths of a heart, and bow tier 3 and up is the silver art, as the console reads it. `hearts` comes back with them because it decides a size: the life block grows a row per ten containers, so the layout pass needs it as context.

## apps/desktop/src/views/HudUnavailableNotice/

Replaces the main HUD overlay when it cannot draw its sprites, which has one cause: no extracted sprites for the active ROM. It used to have a second, the Modern style having no renderer, but Modern draws the same HUD as Enhanced. Plain HTML, informational only.

## apps/desktop/src/views/HudView/

The Original style HUD. One game pixel in CSS pixels is measured against the canvas's native height, which already counts the rows a tall view adds and the 240 line mode's sixteen, so a game pixel is the size the core drew it at in every shape. The content is centred at the chosen ratio's width ('match' uses the full container, and a ratio can never be wider than the screen) and placed against the rendered frame on both axes: the left and right groups sit two tiles in from its edges and the bar 1.75 tiles below its top, so a wide view spreads the groups and a tall view puts the bar over the rows it adds, and the pause menu it slides against measures the same way. The left group is the magic meter, the item box and (in original count layout) the counts; the centred layout puts the counts in the middle; the life sits on the right.
A key count of 0xFF means no key display. The rupee counter needs a fourth digit once the Larger Wallet cap raises it past 999. A bow value of 3 or more means Silver Arrows, as `Hud_Update_Inventory` in `hud.c` reads it. The life uses `heartArt="sprite"` and the caption because the Original style replicates the console's bar from ROM sprites. The countdown of the digging game and the Super Bomb draws at the bottom centre and draws nothing until one runs.
`useHudCountdown` feeds the game's countdown reading into the countdown store and returns the tracked result. `HudCountdownSlot` places the countdown at the bottom centre of the content box while the game counts down and fades it in and out over 400 ms; the pie stays mounted through the fade out with its last reading. The bottom gap is two HUD tiles (the HUD's side margin), measured to the disc, which sits inside the pie box by its empty rim; it follows the HUD scale, so it is set inline.

## apps/desktop/src/views/InstalledOriginBar/behavior/useConfirmUninstall.ts

An editor's Delete on an installed item runs the same uninstall the Hookshop tab runs, asked with
the same words through the editor's confirm dialog, so the install record and the profiles that use
the item stay right.

## apps/desktop/src/views/InstalledOriginBar/behavior/useUpdateTo.ts

The store is asked once per item and installed version. Signed out, the store does not answer, so
no update is offered.

## apps/desktop/src/views/InstalledOriginBar/InstalledOriginBar.tsx

The origin bar wired to the store IPC: Duplicate, Update, Open on the site and Uninstall. Every
editor that shows an installed item puts it at its top and is told what to select after each
action: `onDuplicated` gets the name the editable copy was written under, and `onUpdated` the name
the update landed under, which a new version may have changed.

## apps/desktop/src/views/InventoryWidget/behavior/useInventoryViewMode.ts

The view mode is a per profile widget pref read by both the widget and its settings popover. It used to be one localStorage key, which made every profile share one mode and left each reader blind to the other's writes without a hand dispatched StorageEvent.

## apps/desktop/src/views/LiveDataInspector/ (styles)

The inspector shell normally never scrolls, since the recommendation list and the record region each own a `ScrollArea`; `overflow-y: auto` is the escape hatch when the widget shrinks so far that two tab strips and the list header exceed the body. The record region has a real floor of `6rem` (one card header plus a line or two of fields) so a long recommendation list can never shrink it away; no size token covers a content area floor yet. The collection tab bar scrolls sideways because eleven tabs never fit the docked width. The recommendation list is capped at 45% of the body and can still shrink; the batch button and outcome line are pinned outside the scrolling list. The review label restates the uppercase accent of `compact-record-view__group-label`, and the record id is monospaced and clipped so a long id cannot widen the card. The spawn section carries the same reserved accent gutter as `compact-record-view__row`, and its colours follow that composite's label and empty conventions; a live only row uses the danger accent of `compact-record-view__row--differs`.

## apps/desktop/src/views/LiveDataInspector/behavior/accept-all-certain-here.ts

A thin wrapper: `acceptAllCertain` (the Data Inspector's batch runner) is already generic over entries and an `accept` callback, so this supplies the callback with `entry.proposed` unedited, since the widget's cards never open a draft the way the comparison view's `ProposalForm` does.

## apps/desktop/src/views/LiveDataInspector/behavior/context-signature.ts

The content signature the detection pass debounce gates on, shared so `useComparison` memoises its own undebounced diff on the same key. `context` is a fresh object every render, so this turns it into a string that only changes when something a detector or a comparison could act on does.
The four `liveGameId` values are included on purpose. Without them, walking from an unmapped room into a different unmapped room (or crossing a recorded palace mismatch, or entering through another entrance) changes nothing else here, so the finding from `screen-presence-probe.ts` would never move to the new room; `screenId` is null both before and after the move. `dataRevision()` covers the write side: an accepted finding changes the dataset, not the game, so without the counter a fix's siblings stay on screen until the player walks into another room.

## apps/desktop/src/views/LiveDataInspector/behavior/granted-item-ids.ts and apps/desktop/src/views/LiveDataInspector/behavior/granted-items-state.ts and apps/desktop/src/views/LiveDataInspector/behavior/subscribe-granted-items.ts

Every raw item id the native receive path has granted this session, kept as a module set and not component state, because the tracker bridge listeners (`onItemReceived`, `onUnknownItem`) fire whether or not a widget is mounted. Both report ids in the same raw index space `GrantedItemObservation.itemId` wants, so both feed the one set. A granted id with no dataset record is the case the `create` draft of `item-grants` exists for. The snapshot `useSyncExternalStore` compares by reference is rebuilt only when the set changes, never per read: a fresh array on every call reads as changed every render and runs the subscriber into React's update depth limit. The listeners are wired once, however many hooks subscribe.

## apps/desktop/src/views/LiveDataInspector/behavior/live-only-spawns.ts and apps/desktop/src/views/LiveDataInspector/behavior/spawn-key.ts

`SPAWNS_PROBE` (`packages/navigation/src/recommendations/strategies/screen/spawns-probe.ts`) reports the union of the record's own spawns and every live spawn resolved this pass as `diff.liveValue`, so it is always a superset of the record's list; a reviewer only acts on the entries the record does not carry yet. A spawn's identity is its actor and tile, the same key the probe uses. `diff.liveValue` carries a `ScreenSpawn[]` by the probe's contract even though the comparison engine types a difference's payload `unknown`.

## apps/desktop/src/views/LiveDataInspector/behavior/useChestObservations.ts

`wasmGetRoomChests` already reports the `ChestObservation` shape per chest, so the rows pass straight through. Outdoors there is no chest table, so this returns `undefined`, not an empty array: absent means not read, and an empty array would tell a detector the game had proved there is nothing here. The query's own `null` on a closed developer mode gate collapses into the same `undefined`.

## apps/desktop/src/views/LiveDataInspector/behavior/useComparison.ts

Per record live field differences for the inline diff display (`260 [0x0104]` in place of `260`). It is not folded into the detection pass effect: that one gates a persisted, async side effect, while this is a pure synchronous read over one screen's records, memoised on the same content signature with no second timer. `runComparison` therefore runs once more here than inside `detectorFromStrategy.detect()`. Sharing that call would force every detector's `detect` to expose the intermediate `Difference[]`, and the duplication is cheaper than that contract change.

## apps/desktop/src/views/LiveDataInspector/behavior/useContextSignature.ts

The signature folds `dataRevision()` in, but a module counter only reaches a component that happens to be rendering. Subscribing here is what makes an accepted finding or a hand edited record run detection again at once, and not only once a game frame or another store renders the widget, which with the emulator paused may never happen.

## apps/desktop/src/views/LiveDataInspector/behavior/useCurrentRecords.ts and apps/desktop/src/views/LiveDataInspector/behavior/records-for.ts

Every record in the selected collection that relates to the current screen. A screen commonly owns several `connection` and `check` records, and `actor` and `item` can repeat too. Only kinds with a direct live link are handled; a collection without one (area, tag) shows nothing. `connection` reuses `observations.existingConnections` as is: it is already every point touching this screen, the same list the recommendation filtering trusts. Distinct spawns or grants of the same type resolve to one record, so there is one card per record, not one per spawn. `LiveRecord` is the element type every card renders.

## apps/desktop/src/views/LiveDataInspector/behavior/useDetectionPass.ts

Runs every registered detector against the live context and folds the result into the shared recommendation store. Nothing else calls `runDetectionSweep` from the running game. Detection is gated on the content signature, not on `context` identity, so it only runs when the resolved screen, a count that moves on a real game event (a new crossing, sprite type or grant), or the dataset changes. A 600 ms debounce coalesces the burst of renders one room transition produces into a single pass.
Importing the strategy barrels installs the full detector set; they must come before `strategy-detectors`, which reads `allStrategies()` once at import time. The connection `wire-detector` import must come after it, because it registers the connection detector again with its `onUnresolvable` mapper over the one the generic pass installed.
There is one store write per collection the sweep touched, keyed by the kind each draft names: a finding is decided under its own kind's file, so it is persisted there or accepting it could never close it. The pass runs even when `screenId` is null (an unmapped room), which lets `packages/navigation/src/recommendations/strategies/screen/screen-presence-probe.ts` report a room with no screen record. Every detector tolerates a null `screenId`, and `applyPass` in `store.ts` scopes reconciliation with `scopedToPass(detectorIds, context.screenId)`, so a null screen pass can only resolve a null screen finding.

## apps/desktop/src/views/LiveDataInspector/behavior/useGrantedItems.ts

Each granted id is resolved against the live receive tally and the tracker's current owned set. `fromInventoryDelta` is always false: every id came off the direct receive callback, never a guessed inventory diff, so the evidence is native and `item-grants` may grade it `certain`.

## apps/desktop/src/views/LiveDataInspector/behavior/useLiveContext.ts

Assembles the live `DetectionContext` for the current screen, the one piece the recommendation engine does not build for itself, since a detector only receives observations and never reads the game. `origin` is always `live`; the simulator's recording path (`packages/navigation/src/simulation/recording/`) is a separate producer of the same shape.

## apps/desktop/src/views/LiveDataInspector/behavior/useRecommendationFilter.ts

Classifies open findings by what accepting them would do to the dataset (change a property, add a missing record, drop an extra one), which is the axis a reviewer triages on; confidence is already a badge on each card. The active filter is derived: if the screen changes and the selected tab's count drops to zero, the next render already reports `all` with no effect needed. `buildFilterTabs` hides a tab that could never show anything and always keeps `all`, so there is never zero tabs.

## apps/desktop/src/views/LiveDataInspector/behavior/useScreenObservations.ts

The screen and connection half of a live `ScreenObservations`: everything the old Dataset widget read for its status badges and connection audit, so a detection pass reads the same ground truth. The entrance room table is static (entrance id to room index) and read once per room change; absent (module not loaded yet) means not read. Fall hole rooms are read off the transitions and not the table a second time, because the facade already resolved every hole on this area to its destination room and holds the head group rule for what is on this area. Room header tags and the room's exit tables are meaningless outdoors, so they are absent there, not empty. The dungeon map position follows the same rule; a `found: false` for a house or cave is a resolved negative and still reported. The entrance spawn table is static and entrance indexed like the entrance room table, so it is read unconditionally.

## apps/desktop/src/views/LiveDataInspector/behavior/useSpriteObservations.ts

The room addressable simulator queries (`wasmGetRoomSpriteSpawns`, `wasmGetOverworldSpriteSpawns`) already report the `LiveSpriteObservation` shape per spawn, so the rows pass straight through. `spriteCombat` reads one native row per distinct sprite type, never per spawn, so the wasm call count is bounded by kinds of actor, not copies.

## apps/desktop/src/views/LiveDataInspector/LiveDataInspector.constants.ts

The tab strip reuses the Data Inspector's own `KIND_NAV_ITEMS` (same icons, same order) so a reviewer recognises the collections at a glance. There is no curated field allow list: the widget shows a record's full set of fields, like the full Data Inspector. `DEFAULT_KIND` is `screen` because every screen has a screen record and nothing else is guaranteed. `JOINABLE_KINDS` lists the kinds `useCurrentRecords` can resolve live records for. `FILTER_ORDER` is also the filter strip's left to right order.

## apps/desktop/src/views/LiveDataInspector/LiveDataInspector.tsx

The Live Data Inspector widget (id `dataset`). Detectors run against the live game (`useDetectionPass`) and surface what they find as cards a reviewer can act on from the widget; only the comparison itself opens in the Data Inspector. A collection tab shows every record this screen relates to, each in its own `RecordCard`. Clicking a reference in a card, or its edit button, jumps to the Data Inspector at that record through `openRecord`, the same handoff `openRecommendation` uses for a finding. `useComparison` feeds each card its own record's live differences, keyed by id, so a wrong field shows inline where it lives.
A screen's `spawns` field renders through `SpawnsSection`, supplied as a per path field renderer. The generic array cell shows an object element as an unreadable `{...}`, so this one field gets its own view and keeps the place the schema gives it, inside the Contents group. Every real collection's rows carry a plain string `id` (see `getId` in `apps/desktop/src/data-inspector/collection-sources`).

## apps/desktop/src/views/LiveDataInspector/sub-components/

`CollectionTabs` is icon only: eleven full labels do not fit a docked widget, and the iconography is the one a reviewer already knows from the full inspector, so the label stays as the hover tooltip. `RecommendationCard` shows one open finding (kind, confidence, one line reason); clicking it opens the Data Inspector's comparison view at that finding, so a finding's current and proposed pair is only ever rendered in one place.
`RecommendationList` has a collapsible count header, the filter strip, one card per open finding in the selected tab (certain first, oldest first, the review's pass order) and a batch accept button that only appears once there is something safe to batch. The batch acts on the filtered list, so a hidden tab can never let a reviewer accept a finding they cannot see, and it sits outside the scrolling list because a button that scrolls away with the cards it acts on is unreachable when it is most useful. A batch that writes nothing says so through `batchOutcomeMessage`.
`RecordCard` gives each record its own bordered card, since a tab can hold several records for one screen. Its edit button is `IconButton` with a `title` beside its `label` for a tooltip. `ReviewControls` sits on each card because reviewing means reviewing one real record; the mark goes into the record's own file through the same record writers an edit uses, so it travels with the data. The status is written at once, the note on blur, because every write rewrites a source file. The heading matches the card's field group headings, and the id and date sit under it as metadata.
`SpawnsSection` resolves each spawn to its actor's name and tile. A spawn the live game reports that the record does not catalogue yet is appended below the recorded list and marked in the same red accent `DiffBracket` uses for a live value that disagrees with the dataset.

## apps/desktop/src/views/LocationNotification/

Animated screen and transition banners at the bottom centre of the game overlay. A banner slides in over 300 ms and fades out over 400 ms, starting the fade before the auto dismiss clears the store.

## apps/desktop/src/views/MusicWidget/behavior/useLiveChannels.ts

The same store per readout arrangement as the studio's preview: the poll runs on animation frames, each store deduplicates to the precision its meters draw, and only a changed readout redraws. Stores are keyed by channel name, not the sounding id, so a readout stays subscribed across track changes. The session comes and goes with the profile and the pack, usually after the widget mounted, so it is polled with the channels.

## apps/desktop/src/views/MusicWidget/behavior/useMusicDebugData.ts

The traces are armed exactly while a debugger watches, because each one costs a host call per sound. Events and counters are read through `useSyncExternalStore`, so a burst of events is one render.

## apps/desktop/src/views/MusicWidget/MusicWidget.tsx

The music debugger. The live section is the pack engine's own state per session channel, with the studio's meters. Counts turns the feed into rates, so authored odds and measured odds sit on one line. Events is the feed of raises and rolls, each tagged MSU, CHIP or SKIP, so a stray sound names its exact id and owner. Mounting the widget arms the core side traces and closing it disarms them; the traces only observe.

## apps/desktop/src/views/MusicWidget/sub-components/ChannelLive.tsx

A silent channel still gets a named row: a debugger asks why a channel is not playing as often as what it plays.

## apps/desktop/src/views/MusicWidget/sub-components/CounterTable.tsx

Running totals per sound and per roll, most recent first. A chance layer reads as tried against played, so 10 percent authored odds landing at 3 of 31 shows as exactly that. A roll row reads played over raised; a sound row reads MSU against chip.

## apps/desktop/src/views/MusicWidget/sub-components/EventFeed.tsx

Every raise the core reported and every roll the engine decided, newest at the bottom, each tagged with its owner. A CHIP line during a storm names the exact id to claim.

## apps/desktop/src/views/PauseMenuView/

The pause menu drawn from extracted sprite tiles. A CSS grid of 32 by 28 cells (one SNES tile each) lays out five panels matching the SNES BG3 tilemap, with the 24 pixel BG3 scroll offset (tile row 5 in BG space is visual row 2, three tiles up): items (1,5) to (19,19), 19 by 15 tiles; name (21,5) to (30,10), 10 by 6; progress (21,11) to (30,19), 10 by 9; abilities (1,21) to (19,29), 19 by 9; equipment (21,21) to (30,29), 10 by 9. On a widescreen view the 256 pixel BG3 content is centred. The canvas buffer is always twice the native height (448 for 224 lines, 480 for the 240 line mode), so the scale matches the game's pixel size. `GRID_TO_SAVE` maps a grid slot to its save RAM index (`kHudItemToItemOrg` in `hud.c`), for cursor navigation and not for display order.
Slot 15 holds a bottle index, so the bottle's own content is swapped in for display. On the bottle slot, a bottle panel replaces the progress and equipment panels with an expand and collapse animation of about 300 ms in 18 steps, matching the SNES 18 frame expand. Names come from the active profile's language set with English defaults behind it, then are folded to drawable glyphs and wrapped onto the panel's column grid. When the core has not exported `link_ability_flags` (byte 81) yet, the ability flags are derived from equipment: bit 7 LIFT from gloves, bits 6 and 5 READ and TALK from the Book of Mudora, bit 3 PULL always, bit 2 RUN from boots, bit 1 SWIM from flippers.
`itemNameKeyForSlot` maps a save RAM slot to a name record key, a record id plus tier (tier 1 is the base pickup), which the name dataset is keyed by; names stay in the data layer so a language set can retitle them. `SLOT_RECORD_IDS` is the base record per slot 0 to 19 in save order. Three slots read their value: one upgrade is a second tier of the same record, two are a rename to a different record, and the rest only recolour their icon and keep the base record at tier 1.
`loadNameTable` resolves the name table the running profile displays names from. Two lookups sit behind one call: the profile's language set id and that set's name table (which pulls the whole set off disk). Both are memoised per key at module scope as pending or settled reads, so two callers in one tick share a lookup, reopening the menu never touches storage again, and a profile switch resolves the new one once. It returns null when there is no profile, no set selected, or the set cannot be read, and the caller answers each with the built in defaults.
`useLocalizedNames` resolves display names against the running profile's language set. English is the floor: each lookup falls back per key to the built in defaults when the set is absent, still loading, missing the key, or holding an empty string, so a half translated set shows its translated entries and English for the rest. A tier fallback stays inside the chosen language first, because an untranslated upgrade name reads better as the translated base name than as English. The profile id is read at render and not subscribed to: it is set when a game starts, and the menu only exists while one runs.
`wrapName` folds a display string to the characters the name panel can draw and breaks it onto the panel's grid (8 columns, 2 rows for the name; lines wider than a row are shrunk by the panel). The panel composes text from one sprite per character, and only A to Z, 0 to 9, space and the ampersand (double width, two columns) have one; anything else would draw as a gap. So a letter with a diacritic folds to its base ASCII letter (NFD splits it into base and combining marks, and uppercasing first also expands the ligature like cases), the few letters with no canonical decomposition are mapped by hand in both cases, dashes and slashes become spaces so they still offer a break point, and the rest is dropped. Drawing real accented glyphs needs new sprites and a new draw path and is out of scope. Wrapping is greedy: a word moves to the next row when it no longer fits and the final row keeps what is left; every name that used to carry a hand placed break still breaks at that space. Only a lone word wider than every row combined is broken mid word, since it cannot be shrunk into anything readable. An empty name yields one empty row so the panel keeps its space.

## apps/desktop/src/views/PlayerSpriteStudio/behavior/is-live-selection.ts

The core's override gate opens for the active profile having some sprite selected, not for the one
the studio has open. Pushing on every save would drop an unselected sheet into the running game, and
the next boot would stage the real selection and silently swap it back. Editing one sprite must not
repaint the player with a different one, so a save pushes only the profile's own selection.

## apps/desktop/src/views/PlayerSpriteStudio/behavior/useSpriteDraft.ts

The draft keeps the sheet's two palette layers, not a mutable palette plus a copy of the old one.
`original` is never written to, so Revert is dropping the override and `dirty` asks whether the
override holds anything; there is no flag to keep in sync. Saving also pushes the sheet at a running
game, flattened to ZSPR because that is the only format the core reads. The push lands only when the
core's override gate is open, so the result is reported back (`applied`: null when not attempted,
true when the game took it, false when the core refused), never assumed.

## apps/desktop/src/views/PlayerSpriteStudio/behavior/useSpriteExport.ts

The container decides the bytes and the platform decides how a file reaches the player: a save
dialog on desktop, a share sheet on mobile, a download in a browser. A cancelled dialog is a normal
outcome, reported as such.

## apps/desktop/src/views/PlayerSpriteStudio/behavior/useSpriteLibrary.ts

Thumbnails are rendered once per refresh, not per render, because decoding tiles for every entry is
the expensive part of showing the list. An entry's file name, extension included, is the key
everything else uses. Deleting a sprite also puts the selection back to default on any profile that
pointed at it, so no profile names a sprite that no longer exists.

## apps/desktop/src/views/PlayerSpriteStudio/PlayerSpriteStudio.tsx

The studio is one Tessera `StudioLayout`. The bar holds the file actions in three labelled groups: Sprite (new, close), Save to this app and Export a file. Save keeps a sprite in the app library; export writes a file to share. The bar's hint line says so when nothing is hovered, and shows each action's own hint when one is. The library is the start panel, the details (name, author and palette) the end one, both resizable and kept under `sprite-studio.library` and `sprite-studio.details`, and the viewer controls sit on the editor toolbar. A sprite installed from the Hookshop opens under its origin bar, read only: it previews and exports, its palette and names stay as published, and Delete uninstalls it. An installed sprite is read only in the main process too, so a refused write lands in the notice lines. After a duplicate or an update the library refreshes before opening the result, because the new file may be one it has not read yet. The palette is in the end panel, level with the stage, so it never scrolls out of view under a tall zoomed in state or contact sheet.

## apps/desktop/src/views/PlayerSpriteStudio/sub-components/PaletteEditor.tsx

A slot is an outfit index, or `g0` and `g1` for the two glove colours; null means no picker open.
The quick assign swatches are every colour already in the sheet, grouped by where each comes from,
because a flat list makes a green outfit shadow impossible to tell from a blue one, which is the
whole point of offering them for reuse. Index 0 is transparent and has no entry.

## apps/desktop/src/views/SaveStateOverlay/behavior/useEnhancedSaveSlot.ts

The save slot shortcut flow. The first press of any load or save key opens the overlay and
highlights that slot. A different slot key while open moves the highlight. The same key a second
time: a quick tap (under `TAP_THRESHOLD_MS`) loads and closes; holding until the bar fills, then
releasing, saves and closes; releasing midway cancels the hold and stays on the overlay. Esc or any
non slot key or button cancels (`useCancelOnOtherInput`). When the feature is off, the load and
save actions fire at once, the original behaviour. The core cannot save or load while paused, so
`with-pause-guard.ts` unpauses, runs the action, and pauses again.

## apps/desktop/src/views/SaveStateOverlay/SaveStateOverlay.tsx

A vertical wheel maps to horizontal scroll, so a scroll wheel pages through the slots; the track
overflows horizontally on small viewports and never grows wider than the viewport. The listener is
native and non passive so `preventDefault` takes. The highlighted slot (the one whose shortcut was
hit) is centred in the track with a manual calculation in place of `scrollIntoView`, so the page
never nudges vertically. The overlay stays open after a save so the fresh thumbnail updates in place;
a load dismisses it, since the player is resuming the game. The hints sit centred below the row,
outside the scroll track.

## apps/desktop/src/views/SceneBackdrop/behavior/useSceneAssets.ts

The tiles decode once for the whole app. A failed load forgets the attempt so the next mount tries again.

## apps/desktop/src/views/SceneBackdrop/SceneBackdrop.tsx

The title's lake scene drawn once and still, as the background of a box, at a whole number pixel scale. `horizon` places the water line as a fraction of the box's height. Without `scale`, the smallest whole scale that lets the 224 row frame cover the box's height is used. The same `seed` always draws the same scene.

## apps/desktop/src/views/SimulatorWidget/behavior/classify-event.ts

The order of the tests matters: specific prefixes come before the broad flood match, so the `Unlock! re-flooding` line is an unlock, not a flood line.

## apps/desktop/src/views/SimulatorWidget/behavior/compute-indents.ts

Sequence markers and the final outcome sit at the base; an "Area" marker (a big multi sub screen group) opens one level in until "Leaving area"; screen markers sit one under their area (or the sequence outside areas); everything inside a screen goes one deeper.

## apps/desktop/src/views/SimulatorWidget/behavior/exits-event.ts

The exits line lists detected exits with their walk step distances, the closest first evidence. `steps` and `stepsNote` are already decoded from the ordering score (`exit-order.decodeScore`); the bias must not be derived again here.

## apps/desktop/src/views/SimulatorWidget/behavior/fan-out-events.ts

Narrative events go to the store and the log bus; every event goes to the JSONL sink. A detected check carried on an event is fed into the recorder, so unmatched checks surface as dataset suggestions: an unidentified diff records a null check id, which is what the suggestion builder looks for.

## apps/desktop/src/views/SimulatorWidget/behavior/to-log-rows.ts

Line numbers are the event's position in the run (1 to N), never the engine step, which repeats. Position rows drop the START or END prefix because the tag already says it.

## apps/desktop/src/views/SimulatorWidget/behavior/trail-haul.ts

A trail stop records the check tally on arrival, so the checks it earned are the next stop's arrival tally minus its own. The last stop has no successor and is closed against the live tally.

## apps/desktop/src/views/SimulatorWidget/behavior/useDatasetSuggestions.ts

Only check suggestions can be applied. The screen and connection channels take a typed record and allocate the id in the main process, while a suggestion carries a pre rendered code block, the very shape those channels keep out of the dataset. Until the recorder emits records, those two kinds say so plainly.

## apps/desktop/src/views/SimulatorWidget/behavior/useSimulatorRun.ts

The runner owns the simulator loop: it snapshots the pre run state (a Memento the Restore button returns to), forces auto skip dialog on, drives the pure engine one step at a time, runs the returned triggers through the port, and fans events out to the store, the log bus and the JSONL sink. It stops on an outcome, the Stop button, or a cap of 50000 steps.
The run drives real checks, so SRAM disk sync is paused for its whole length; otherwise a 5 second tick could persist half simulated state to `sram.dat`. Restoring the snapshot makes it safe to sync again at once.
The run arms the `WasmSim*` mutators (`kHostGate_SimulatorSupport`); without them every door unlock, kill drop and cell lock trigger silently does nothing. It also holds the developer tools switch for its own duration: the combat table queries that decide which enemies gate a room sit behind it, and without them every room reads as ungated and a kill gated room's shutters never reopen. The gate is read only instrumentation and the user's own setting is never touched. All three are dropped in the `finally`.
A features word set from here is only wanted until the core latches it on its next frame (`zelda_rtl.c:989`), so the run waits 500 ms before anything reads the tables.
A check can flip the game's progress phase, so a change is surfaced as a Sequence marker. The flood and exits lines are re emitted on entering a new screen or after an unlock reseeds the frontier (an epoch bump), so a "Reset:" line is followed by the new reachability; never after the stop target or the run's end, and never on backtrack pass through hops, where the phase stays `traversing` over explored ground.
Stop flips the store to done at once: the loop may be mid await (a trigger and a frame wait) and would leave the status on running until its next pass. `finishRun` still runs and is idempotent.

## apps/desktop/src/views/SimulatorWidget/behavior/useStopAtChecks.ts

The stop at check picker runs the checks widget's own snapshot pipeline (`tracker-statuses`, over the placement where nothing moved) and the shared `filterChecks`, so it offers the same search, tag, item and status filters as the checks widget.

## apps/desktop/src/views/SimulatorWidget/sub-components/LogDialog.tsx

The modal is the only place the log is read: the widget column is too narrow, so the widget itself shows only a button with the live event count. Kinds are filtered before the indents are computed, so hiding a marker type re levels the rows under it.

## apps/desktop/src/views/SimulatorWidget/sub-components/ResultsPanel.tsx

Reaching the configured stop check and completing the goal both read as success; only `not-completable` is a failure, with a softlock summary. "Reveal log file" opens the run's JSONL on disk, which is not the in app log dialog.

## apps/desktop/src/views/SimulatorWidget/sub-components/RunTrail.tsx

The route the run walked, in order, with the checks each stop earned: the event log says what happened, the trail says where the run went. Stops come from the engine's own current screen, so the trail cannot disagree with the run.

## apps/desktop/src/views/SimulatorWidget/sub-components/SimulatorWidgetSettings.tsx

The screen limit here is the same widget pref the run controls edit, so a change in either place shows in the other.

## apps/desktop/src/views/SimulatorWidget/sub-components/StopAtCheckPicker/StopAtCheckPicker.constants.ts

No shared per kind icon set exists elsewhere, so the check kind glyphs live here. Their keys follow the `CheckKind` union in `packages/game-data/src/data`.

## apps/desktop/src/views/SpriteDebug/sub-components/

The review panels share one card per row and one status button strip.
Each button and card lives in its own file. The shared label colours sit in `LABEL_STYLES` beside the view styles.

## apps/desktop/src/views/TitleView/behavior/useTitleAssets.ts

A picture from the `app-sprite://` scheme is another origin, so a canvas that draws it can no longer be read and the sparkles could not find its pixels. Its bytes are read through the file store and shown from a same origin blob. When that read fails the picture still draws from the scheme.
A sword picture lives in `apps/desktop/assets/title-scene/sword/<id>.png`. An id without a file draws the ROM's sword.

## apps/desktop/src/views/TitleView/behavior/useTitleGeometry.ts

The game canvas buffer holds two rows per native line: 448 for 224 lines, 480 for the 240 line mode. The overlay's height is the native height and the 256x224 frame sits centred, with the rows a tall view adds above it.

## apps/desktop/src/views/TitleView/behavior/useTitleProgress.ts

The sword tier and the world come from the profile's battery save, read once per mount. The default picture shows when the setting is off, the save is missing, or the read fails.

## apps/desktop/src/views/TitleView/sub-components/TitlePrompts.css

The Start prompt blinks 32 frames on and 32 off at 60 fps: the pace of the game's own blinking cursors, doubled.

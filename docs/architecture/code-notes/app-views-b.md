<!-- @layer docs @kind doc -->
# App views B code notes

Notes for four renderer views under `apps/web/src/ui/domains/app/views/`: `ProfileHub/`, `InputTester/`, `GameLayer/` and `Randomizer/`. Each heading names a file or folder relative to that `views/` folder. The code carries no comments, so the facts a reader cannot get from the code live here.

## Randomizer/behavior/activity-feed.ts

The activity feed is one time-ordered list: the app's own log entries and the Archipelago room's messages (chat, item sends, joins), each room line tagged AP. Both inputs arrive oldest first, so one merge pass keeps the order. On a tie the app's own entry goes first.

## Randomizer/behavior/is-room-echo.ts

The online session also logs each room message to the log bus, prefixed `[AP]` and a space (see `online-messages.ts` in the randomizer client). The room row stands for that line, so the echo is dropped whenever room lines are present.

## Randomizer/behavior/classify-entry.ts

Classifies a log-bus entry into a display kind and a short tag, the same way the simulation log classifies its events. Session lines arrive prefixed and structured (`[Local] Overrode ...`), so they carry real types. Level wins over content: an error stays an error whatever it says. `ACTIVITY_RULES` is ordered and the first match wins, so specific prefixes come before broad ones.

## Randomizer/behavior/activity-row.ts

The session prefix (`[Local]` and the like) is the tag's job, so it is stripped from the message. Repeating it on every one of the roughly 500 arm-time lines is noise.

## Randomizer/behavior/recent-activity.ts

The Run tab's short list of what happened last, newest first. Checks found, items received and sent, the session starting and stopping, the connection coming and going, the goal, deaths, warnings and errors stay. The arm-time plan, the overrides, the receipt text, room chat, hints and plain info stay in the Logs tab. A room server line is kept only when it is about a goal.

The echo test runs against every room line before the room lines are filtered: the kept room lines do not stand for the dropped ones.

## Randomizer/behavior/options-summary.ts

The big picture of a frozen option snapshot, as counts: how many of the player's settings moved off their default (the same test the tab badges use), which shuffle scopes are on, and how far each block (dungeon items, progressive rungs, story gates, dark rooms, fairy ponds) departs from the game as shipped. Every block, and every scope flag in `scope-flags.ts`, is read with the reader the generator itself uses, so a count describes the seed that was rolled, never the current baselines.

The seed passed in is the profile's own: a random shop scope drew its shelves from it. A pond in `LEGACY_POND_MODE` (`capacity`) is left as the capacity families describe it, so it does not count as selling throws. Ponds count out of the three fairy ponds.

## Randomizer/behavior/run-progress.ts

How far the run has come, in checks. The tracker counts them whenever a seed is loaded, the same count the Spoiler tab heads its list with: taken, available now, left out of reach, out of the seed's locations. An Archipelago room that has not handed its locations over yet has no seed here, so its own count stands in, and it only knows taken out of total. `available` and `left` are null in that case.

## Randomizer/behavior/counter-tiles.constants.ts

`COUNTER_LABELS` gives nicer wording for the plan counters known today. A counter not listed still shows, humanized from its key. The plan's classes keep changing, and a closed list silently drops whichever counter lands next.

## Randomizer/behavior/useRandomizerSession.ts

A thin subscriber. Session ownership lives in the shared session store (`lib/game/randomizer-client/session-store`); the hook mirrors the store, the game-running gate and the page's activity feed into React state.

The log panel windows its own rows, so the feed keeps as much history as the bus does (`MAX_LOG_ENTRIES`). A full plan application logs about 500 entries, and a screenful would throw away the arm-time detail. The feed takes the error channel beside the randomizer channel, so a session failure that surfaces as a global error (a bad ccall, an unhandled rejection) shows on the page that caused it.

## Randomizer/Randomizer.tsx

The Randomizer page is laid out like the profile hub: the section nav beside one page per tab. Run (with a summary of its options), the frozen options (the creation panel, read-only), the activity feed, the spoiler (the same checks tracker the widget renders), and for an Archipelago profile the Network and Online pages. `RANDOMIZER_TABS` and `RANDOMIZER_NAV_GROUPS` are the one table the nav and the page both read, the way the hub reads `PROFILE_HUB_TABS`.

Sessions are owned by the shared session store and start with the game. Nothing on this page starts one except the dev-only sandbox. A profile switch away from Archipelago drops the Network and Online pages, so a chosen tab that no longer exists falls back to Run.

## Randomizer/Randomizer.constants.ts

`RUN_PANELS` and `NETWORK_PANELS` place each dashboard panel: its section anchor and its column span. On the Run page the one-column panels come first so they share the top row; the players table and the settings tiles take two columns, and the item pool fills the column the players leave. A local seed has one player, whom the Progress panel already covers, so `LOCAL_RUN_ANCHORS` drops the Players link. On the Network page the server setup and the connection share the top row with health and progress, then the players table takes two columns beside the server's rules.

## Randomizer/sub-components/RandomizerPageContent.tsx

The content pane draws the active tab inside the page frame the profile hub uses (glowing icon, title over the scene, section links). Online goes through the settings page context instead, so the settings layout draws the frame and its own section links, the same as Settings, Online in the hub. A page header is short, so `HEADER_HORIZON` sits the water line low to keep the castle in view.

## Randomizer/sub-components/RunTab.tsx

The run at a glance: what the run is, how far it has come and the last moments that mattered share the top row, then the room's players (Archipelago only), then a summary of the options it was generated with. A normal profile, or none, gets a quiet empty state.

## Randomizer/sub-components/OptionsTab.tsx

The profile creation panel drawn read-only from the profile's frozen snapshot, never the current baselines. The snapshot is read back as the form's choices, so every block draws what it drew when the profile was made, each value as a tag in its control's place. The profile's ROM supplies the extracted sprites that illustrate the item pool.

## Randomizer/sub-components/OnlineTab.tsx

The profile's Online settings, the same component the settings screen shows. It reads and writes through the settings bridge the profile's settings screen registers (`search-store.ts`), so a change lands in the same `config.json` and acts at once in both places. The bridge is up whenever a profile is open, game or not.

## Randomizer/sub-components/ActivityLog.tsx

The page's activity feed is drawn through the shared `LogPanel`, so it gets the same windowing, search, copy and type filter the simulation log has. The kinds come from `ACTIVITY_KINDS`; the `.randomizer-log` rules in `Randomizer.css` colour each kind, and the panel owns everything structural. A clock gutter needs more room than a line number, hence the wider gutter.

## Randomizer/sub-components/SpoilerPanel.tsx

The spoiler is the same checks tracker the Checks widget renders, given the room to be read properly, plus the one grouping only a run offers: the sweep sphere. Locations the placement carries that the app's check dataset does not are reported, never dropped: a spoiler that omits rows is worse than one that says how many it could not place.

## Randomizer/sub-components/WishingPondSection.tsx

The fairy pond section of an options panel: the switch that puts all three ponds on one set of settings, a tab per pond, and the selected pond's block. An ErrorBoundary fences it, so a setting the model cannot plan shows an inline notice and the options screen stays up. The creation panel and the read-only Options page share it.

Tabs replace three stacked blocks: the ponds are set the same way and only one is worked on at a time. While one shared set is in force, every tab shows the same thing, so the copy control offers no sources.

## Randomizer/sub-components/PondInstanceRow.tsx

Every pond setting is held to the wallet top of the capacity family before anything is drawn (`pond-wallet-top.ts`): a range control stops at what the wallet can hold, a stored range past it reads as the reach itself, and every edit leaves already held, so a row shows what the seed is built from. Each clamp is said in the blocking colour under its row. One component per pond gives each derivation its own memo, and switching tabs leaves the copy control empty.

## Randomizer/sub-components/CapacityUpgradesSection

The capacity upgrades section is fenced: the rows are derived and rendered inside an ErrorBoundary, so a profile the model cannot plan shows an inline notice (with a reset where the panel is editable). The fence retries on every profile change. `sub-components/CapacityUpgradesRows.tsx` holds the derivation, so a throw there reaches the boundary.

## Randomizer/sub-components/StoryGatesSection

One plain row per story gate, in the order the catalog seeds list them. The rows read and write through the same key mapping the snapshot uses (`story-gate-from-snapshot.ts`), so a row and a stored value cannot disagree. With no handler the section is a read-out, every value as a tag.

## Randomizer/sub-components/DarkRoomsSection

The requirement row, then the four lights as tiles. A light is an item, so its tile carries the item's own sprite and a tick, and the section only speaks again when something is wrong. The requirement shapes the seed logic only: a ticked light lights rooms either way, so the tiles stay editable when it is off.

Two things can be wrong, and they read differently. A tile a sibling setting holds off (`dark-room-forced.ts`) shows off with its reason in the blocking colour, whatever the setting stores, because the seed is built with it off. The stored answer is untouched, so lifting the mask hands the tick back. Unticking every light while a light is required is allowed: the rule then reads unlit rooms as passable and the seed rolls blind, which is a consequence and not an error, so it is a banner.

The tiles are rebuilt when the extracted sprite set moves: a set rewritten in place is served under new URLs, so the sprite revision is a memo dependency although nothing reads it. Availability is read for no ROM in particular: the app points the set at a ROM from startup, and the creation form re-points it at the ROM picked. Until then the tiles draw placeholders. The same placeholder stands in for a sprite file that fails to load, so a tile never shows a broken image.

The tile's name is its tooltip and the checkbox's accessible name. Its face is carried on `data-state` (on, off, forced, disabled). The label fills the square, so the whole tile is one click target, and the tile rules are written through the tile so they outrank the checkbox's own rules whatever order the sheets load in.

## Randomizer/sub-components/NetworkTab

The Network page for an Archipelago profile: the server setup with Test connection, then the connection, its health, this slot's progress, the room's players and the server's rules, all live from the online session. With the game stopped every panel stands: the setup stays editable, and the rest show the last session's picture on this connection, marked as such (`network-view.ts`), or say they fill in once the game connects. The last picture belongs to this profile when it was taken on the same server and slot.

`useNetworkStatus` lands every change the session reports at once, and a one second tick moves `now` (ages, countdowns) and reads the status again, because the game side (the received index, a file in play) moves without a packet. With no online session, `last` is the last picture the app saw (`last-network-status.ts`).

The link is healthy while connected and a packet arrived in the last `STALE_AFTER_MS`. The ping alone brings one every five seconds, so a longer silence means the room stopped answering. Another player being offline is ordinary, so it takes no alarm colour. The `dim` tone means nothing is known, quieter than idle.

The server setup is a draft of the profile's connection, always open. It follows the profile until the player edits it; Save checks the draft, writes it through `onSave` (which reconnects) and the draft follows the saved values again. Revert drops the edit, and a refused write keeps the edit with its reason. A save made elsewhere that lands on the edit ends it.

A player's checks show while a tracker link to their slot is up. The compact players table, used on the Run tab, drops the slot and status columns and the heading row. The Run tab pill's styles live in `NetworkTab.css`, which the tab's barrel loads first.

## GameLayer/GameLayer.tsx

The game layer stacks three canvases of the same size: the game canvas SDL draws into, the edge glow canvas, and the shadow casting canvas. `useCanvasDisplaySize` sets their CSS size, and sets it again one frame after the game starts running, because SDL and Emscripten strip inline styles while the WASM core initialises. `useCanvasBufferSize` reads the game canvas buffer back once the game runs, since SDL may resize it.

A fresh canvas element (a new `canvasKey`) is made when the game returns to idle after it has run once (a crash or a reset), never on first mount. Docked widgets shrink the game area through the exclusive insets store. The controller presence check waits `CONTROLLER_PRESENCE_DELAY_MS` after the game starts, so HID enumeration and gamepad activation have a moment to fill in. A pause whose name is empty or `Manual pause` shows the plain pause icon; any other name is a disconnected controller.

## GameLayer/behavior/useCanvasOverlayLoop.ts

The shared requestAnimationFrame lifecycle for a WebGL overlay driven off the game canvas (edge glow, shadow casting). Each feature supplies its async setup, its per-frame body and an optional teardown. The loop waits one frame before it starts, so SDL has set the canvas size, then matches the overlay buffer to the game buffer. Bumping `canvasKey` tears the loop down and starts it again.

## GameLayer/behavior/useEdgeGlowLoop.ts

The edge glow mirrors the screen edge into the extended viewport on the overworld (`OVERWORLD_MODULE`, game module 9). `locationModule` is the physical location, unaffected by text and menu overlays. Bounds are only updated on the overworld, so they freeze during text and events. A 240 line tall SNES screen counts as extended and gets a 16 pixel bottom margin.

A screen crossing shows as a jump of more than `SCREEN_CROSSING_JUMP_PX` in any black bound while on the overworld. The bottom bound counts too: a crossing between two areas of equal width moves neither horizontal bound, so without it an up or down crossing never tripped and the glow kept compositing the departing screen's edge. On a crossing the glow fades out fast (about 80 ms, `FADE_OUT_PER_SECOND`), because every frame of it shows the wrong picture, and fades back in over a quarter second once the bounds stop moving. Waiting for the fade to finish would hold the glow out while it is still on its way down.

The mirror pass uses a clean frame without the HUD. A pending save-state screenshot is taken from this visible frame, in the same turn, which avoids hidden canvas readback quirks.

## GameLayer/behavior/overworld-screen-id.ts

The overworld is an 8 by 8 grid of 512 pixel screens. The screen under the camera is found from the camera position plus half the view (128 by 112), divided by 512 and wrapped to the grid.

## GameLayer/behavior/useShadowCastingLoop.ts

The shadow project loads when the loop starts, then follows the editor store while the editor is open or dirty, so live edits show at once. The renderer gets the view origin every frame through the same helper the overlays use, and new screen data whenever the overworld screen changes or the editor is dirty.

## GameLayer/behavior/useControllerOverlay.ts

The overlay's mappings are recomputed when `paused` flips, so they reflect the bindings and profiles of that moment.

## GameLayer/behavior/useProfileSwitcher.ts

The profile switcher opens on an active profile change and hides itself after `AUTO_HIDE_MS`. With a single profile it never opens, because cycling never fires.

## GameLayer/sub-components/shadow-editor/gizmos

The transform gizmo of the shadow editor, in display pixels around the shape's center. The Y axis arrow points up. The uniform resize handle sits on the upper left diagonal. Vertex points are stored in the same local, unrotated space the hit test turns the mouse into. Shape rotation is stored in degrees and the gizmo works in radians.

## GameLayer/sub-components/ShadowEditorOverlay

The editor overlay draws only on the overworld and only with preview mode off. Hit testing works in world space: lights first (a small radius), then heightmap shapes, last drawn first. A freehand shape is hit inside its polygon or near an edge. Dragging a vertex of a regular polygon turns it into a freehand shape with those vertices. A right click during a drag puts the element back where the drag started. Keyboard shortcuts while the editor is open: Ctrl+Z undo, Ctrl+Y or Ctrl+Shift+Z redo, Delete or Backspace removes the selection, Ctrl+S saves, Escape returns to the select tool.

## GameLayer/sub-components/shadow-editor/NumberField.tsx

Escape calls `preventDefault` so the dismiss stack treats the key as consumed and leaves the surface the field sits on alone.

## GameLayer/sub-components/navigation-overlay

The navigation overlay draws the flood result over the game: reachable dots, the A* path preview, cliff and stair arrows, connections, ways on and off the screen, fall zones, pit stripes, annotations and the player debug boxes. Annotations draw last so locks, triggers and exits sit above the reachability art. The overlay and legend containers take no pointer events, so the overlay never eats a game click; each legend panel turns pointer events back on for its own collapse chevron. Each legend panel collapses on its own and remembers nothing. The chevron is large on purpose: at 9 pixels it vanished against the game art, and it is the only control on these panels.

Controls: hold the left button for a live A* path to the cursor, right click while holding to lock the target, release to clear the lock and the path, Shift and drag to copy a block of tiles to the clipboard. The copied block lists each tile as its hex attribute followed by `+` reachable, `~` traversal or `-` blocked.

## GameLayer/sub-components/navigation-overlay/annotation-style

One row per annotation kind, exhaustive by type, so a kind without a visual is a compile error. Colours are semantic: amber for a lock or gate, green for a pickup or check, red clay for a trigger, grey for information. Room-wide facts (room tags such as the kill trigger) have no meaningful tile, so they are `panelOnly` and show in the panel. Ways on and off the screen are a separate renderer (`draw-entrances.ts`) and never use this table. The on-screen legend lists only the kinds present, since a full key would dwarf the game view; a kind switched off in the navigation widget shows struck through.

## GameLayer/sub-components/navigation-overlay/DotLegend.tsx

The ring of a dot says which layer or layers the flood reached the tile on; the fill says what kind of result it was. Arrows have their own legend box because an arrow is an edge between tiles, not a property of one.

## GameLayer/sub-components/navigation-overlay/draw/draw-context.ts

Every draw function takes the same context. The view origin comes from `viewOrigin`, shared with every other overlay so they cannot drift apart: the camera, less the camera lock shift and the pixels the view adds on the left and on top. Indoors, the occupied room uses the live origin; any other room in the batch has no live position and falls back to `roomOrigin(screenIndex)` (see `room-entrances.ts`). Drawing other rooms at the primary room's origin once put them a full room width off.

## GameLayer/sub-components/navigation-overlay/draw/draw-dots.ts

The ring names the same layer the tooltip does. Outdoors is always the ground; a single-layer room takes the layer the flood started on. A dot ringed for both layers means the flood reached the tile on both; keying it off raw attribute content drew tiles that merely have geometry on the other layer as two-state dots.

A dot is judged by the attributes of the layer the tile is stood on. `attrGrid` is the upper layer, so testing it for a ground-only dot checks against the wall or ledge above and blanks every reachable tile beside a raised walkway. Do not collapse this back to a single `attrGrid` read: that regression has happened twice. Ledge traversal states (2 to 9) and stairs get arrows, not dots. Hookshot targets are ordinary dots; the tile tooltip reports hookshot use. The flood start is a black dot with a white outline.

## GameLayer/sub-components/navigation-overlay/draw/draw-annotations.ts

One marker shape for every annotation, differing only by glyph and colour, so the overlay reads at 8 pixel tiles. Open or done markers draw dimmed; a blocked one is struck through so it shows on the canvas and not only in the widget list.

Door-table kinds (`DOOR_KINDS`) are 4 by 4 tile blocks, wide along the wall and shallow through it (north and south doors are wide in columns, east and west wide in rows). The cell lock is not one: it is a keyhole plate (room object 0x18) with no door-table record and a dummy direction (see `getRoomDoors`), so it keeps the 2 by 2 size. Records name the top left tile of a block, so markers are nudged in by `ANCHOR_NUDGE_TILES` along their narrow axis: both axes for a 2 by 2 block, only the through-wall axis for a door. The nudge was measured from screenshots of room 0x71 and the jail cell, not derived; re-check it if the marker size changes.

## GameLayer/sub-components/navigation-overlay/draw/draw-cliff-arrows.ts

Both ends of a cliff arrow sit on a tile centre. Pulling the tail back half a tile made a jump look like it began a tile early and skewed diagonals away from 45 degrees.

## GameLayer/sub-components/navigation-overlay/draw/draw-player-debug.ts

Draws Link's 16 pixel box and the tiles under it, and outlines the solid blocker sprites in red: tutorial guards (0x3F), barriers (0x40) and the uncle (0x73) while his `e` value is 0. The same sprites stop the flood (`lib/game/flood/blockers.ts`).

## GameLayer/sub-components/navigation-overlay/draw/draw-pit-stripes.ts

Pit tiles (attribute 0x20) are striped only when they touch a reachable tile.

## GameLayer/sub-components/navigation-overlay/pathfinding

Link is a 2 by 2 tile body, so the path search works on 2 by 2 positions. Reach states: 0 unreachable, 1 reachable, 2 to 9 a ledge traversal in one direction (`TRAVERSAL_DIR_OFFSET`: south, north, east, west, then the four diagonals), 10 stairs (both ways). A body may only leave a ledge tile in the ledge's direction; stairs allow any direction. Goal finding uses the merged grid, so it can target either layer; routing is layer aware when dual-layer grids exist. On layer 0, stepping onto a ledge in its direction scans forward past the ledge tiles to the landing on layer 1, and the fall costs the tiles crossed. A stair tile on the merged grid lets the body swap layers in place. Link's position is read 8 pixels below `linkY`, at his feet.

## GameLayer/sub-components/navigation-overlay/tile-inspector-classification.ts

One hover's tooltip data: the room context and side tables are resolved once, then `classifyTile` runs per shown layer. Nothing here re-derives a fact `classifyTile` owns. `rawPalaceIndexX2` is the raw `cur_palace_index_x2` (0xFF means none), the shape `resolveRoomContext` expects. Dual mode falls back to a single column when either layer has no content of its own (attribute 0 and no reach). A staircase type of 2 means layer changes are blocked, so the tooltip locks to the start layer.

## GameLayer/sub-components/navigation-overlay/tile-inspector-tooltip

`computeCanPass` answers whether the current loadout passes an obstacle: `lift.1` always, `lift.2` with the Power Glove, `lift.3` with the Titan's Mitt, `hammer` when inventory slot 11 holds the hammer, and boots or flippers when owned. The tooltip is placed clear of the path line and its requirement label, trying positions around the cursor first and the four corners last.

## GameLayer/sub-components/navigation-overlay/tooltip

One tooltip layout for single, dual and locked modes: a header, one or two layer blocks, then the extra rows. The modes differ only in how many layer blocks render, and all five classification rows come from one `TileClassification`, each tagged with where its value came from (the grid, the attribute or a live side table). An unreached above-layer tile that is not a wall reads unsupported, not blocked: the tile is open, but nothing carries Link there. Outdoors the one surface is the ground, whatever number the walk's start layer has. Path requirements show only once a layer is reached. A collision row turns green or red only for an obstacle whose answer for the current loadout is known.

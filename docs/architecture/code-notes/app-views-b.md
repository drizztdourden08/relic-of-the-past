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

## InputTester/sub-components/InputCalibration.tsx

SDL3 is the only controller transport (the browser Gamepad API path is gone), so every card comes from its snapshot.

## InputTester/sub-components/useInputCalibration.ts

- The state for the InputCalibration page. Every controller is SDL3-claimed, so connect and disconnect events for the log come from the same SDL3 channels as everything else.
- The definitive "is a controller connected" answer is the same SDL3 snapshot the cards render from, with status `ready`. The input store's own tally counts only devices that have sent at least one input report, so an untouched pad already visible as a card would read as disconnected there.
- It subscribes to the input manager for all input state, to connect and disconnect events for immediate UI updates and the event log, and to a lightweight HID diagnostics listener with no input polling. The log scrolls itself to the newest entry.

## InputTester/sub-components/ControllerCard.tsx

- `busType` is reported by SDL3 (`controller:added` or the device snapshot) and is undefined without a snapshot entry.
- `onReportDevice` is raised, not handled in the card: the report releases SDL partway through, which unmounts the card, so the screen mounts the report dialog.
- The calibration target says what is being calibrated, and null means nothing is open.

## InputTester/sub-components/ControllerAxes.tsx

The axis panels are derived from the device's resolved axis controls (see `resolve-device.ts`), not a preset's axis list. A trigger reported as an axis still gets a grid cell, lit by the same threshold the trigger bar reads (`resolveLiveControlState` is the single source). It is appended so the grid order is untouched.

## InputTester/sub-components/input-cal-visuals

The visual pieces of the Input Calibration page: the controller silhouette icons, `AxisRecordButton`, `TriggerBar` and `StickCircle`. Static style literals live in the constants file and dynamic or animated styles stay inline. `TriggerBar`'s `pressed` mirrors `resolveLiveControlState`'s threshold read for the same trigger. A full press highlights the track exactly like a pressed button cell, so a trigger reads as working both as an axis and as a button with no second cell in the button grid.

## InputTester/sub-components/hid-calibration/hid-calibration.type.ts

The HID calibration map. A button mapping is a byte and a bit mask; an analog trigger used as a button adds `threshold` (the value above which it counts as pressed) and `restValue` (the byte at rest). An axis mapping carries `idle` once the axis has been read at rest: `drift` is the widest excursion from centre seen while untouched, which is the floor any deadzone must clear. Without `idle`, rest was never measured.

`devicePath` is the raw OS device path (for example from node-hid enumeration). `rawManufacturer`, `rawProduct` and `serialNumber` are the device's own strings, distinct from `name`, which is this app's display name. `platform` uses the same label as the debug-info block. `appVersion` keeps captures from different versions of the wizard's heuristics apart. `guid` is SDL's joystick GUID, the key of a gamecontrollerdb line, so a report without it cannot become one. `sdlMapping` is SDL's own line for that GUID when it has one, `sdlType` is SDL's gamepad family (not a model name), `sdlHasButton` and `sdlHasAxis` are what SDL says the device has by positional index, and `sdlVersion` is the SDL version the capture ran against. A trigger kind is analog (a swept range), digital (a single bit) or unknown until the recording shows which (see `trigger-classify.ts`).

## InputTester/sub-components/hid-calibration/connection-hint.ts

SDL reports the transport directly on the controller-added event and in the device snapshot (`busType`), so the connection hint is ground truth, not a guess. The function keeps its historical name and one-argument shape because it is still the one place `calibrationMap.connectionHint` is resolved.

## InputTester/sub-components/hid-calibration/hid-analysis

Byte-level analysis of raw HID reports. A changed byte is analog when it moved by at least `ANALOG_THRESHOLD_DELTA` and flipped more than three bits. A counter byte changes on more than 70 percent of reports, mostly by small steps (three or less, with wrap-around). When several bytes change at once, the likely answer is the digital change with the fewest bits, or failing that the analog byte that moved furthest from rest. An analog byte used as a button gets a threshold a third of the way from rest to pressed.

## InputTester/sub-components/hid-calibration/flaky-byte-detect

Finds bytes still changing while nothing is touched, the most common cause of a bad button capture per the wizard's own instructions. It runs right before button capture so the user can exclude them up front (`hooks/useFlakyByteWarning.ts` turns the result into a dialog). It samples for `FLAKY_SAMPLE_MS`; a wobble below `FLAKY_MIN_RANGE` is ordinary ADC noise. Excluded bytes are skipped, since they are already out of the capture's way.

## InputTester/sub-components/hid-calibration/noisy-bytes

Which byte positions keep moving on their own. A pad with motion sensors or analog sticks reports bytes that never hold still. The difference from a pressed input is frequency, not amount: a held button changes its byte once going down and once coming up, while a motion or analog byte changes on nearly every frame. Per byte, it counts how often the value differs from the previous frame over a window of about a second (`WINDOW_FRAMES`) and reports the ones that move in more than a quarter of it. This is kept apart from the excluded set and from byte statuses: a restless byte is not claimed for a stick and never recolours a cell; it is only ignored for detection.

## InputTester/sub-components/hid-calibration/stick-center

Records what a stick's bytes do while nobody touches it. Rest is not a single number: a real stick drifts, so the reading keeps the median and the extremes over a fixed stretch (`IDLE_SAMPLE_MS`) and never waits for the values to stop changing, which on a drifting stick never happens. The user starts it, because only they know when the stick is free; inferring it once produced a centre taken while the stick was still held. A byte that never repeats is not an axis at rest, it is a counter.

## InputTester/sub-components/hid-calibration/button-detection

Button capture: press once and the wizard moves to the next prompt, the same feel as positional capture. There is no confirm-frame wait and no release wait, so one frame is enough. What keeps a lingering previous press out of this item's answer is a snapshot of what already differs from rest when the item becomes active (`heldAtActivationRef`); a press is a bit that arrives, not a moment when the whole report falls silent. Waiting for silence cannot work: reports with a counter or timestamp byte never go quiet, and the capture would hang with no explanation. The first frame after activation only records that snapshot, and logs what the item compares against: a capture that seems to do nothing almost always has no baseline, the input's byte excluded, or the byte written off as restless. When bytes change but every one is filtered, that is logged at most once a second.

Axis capture keeps the two-step flow: push to the positive extreme, then the negative one, each confirmed over `CONFIRM_FRAMES` and followed by a release. The axis byte is the one with the widest difference between the two extremes. Restless bytes are ignored here too, because the release step only completes on a frame with no differences left.

## InputTester/sub-components/hid-calibration/trigger-classify

Whether a trigger is an axis or a switch has to be measured: both exist across pads. Range alone cannot tell them apart, because a switch reported as one bit of a shared button byte moves that byte by the bit's own value, so a high bit looks as wide as an analog sweep. What separates them is how many distinct values the byte takes while worked: an analog trigger passes through a continuum, a switch only reads pressed or released and differs from rest by a single bit. Every value seen must differ from rest by the same single bit for a switch; other bits of a shared byte belong to other buttons. Four distinct values or fewer cannot be a sweep; eight or more cannot be a switch; in between the answer stays unknown and sampling continues.

## InputTester/sub-components/hid-calibration/stick-gyro-reclaim

When a stick capture finds no sensible pair after `GYRO_RECLAIM_DELAY_MS`, it reconsiders the bytes the gyro step excluded (and only those: never a byte a stick or trigger step has since claimed). A real sweep makes a large coherent range, while gyro and accelerometer noise from waving the pad stays small, so a range of at least `GYRO_RECLAIM_MIN_RANGE` qualifies. At most a pair is reclaimed, once per capture, and each reclaim is logged.

## InputTester/sub-components/hid-calibration/report-processing

The trigger candidate floor is a range of 2, not 15: a switch reported as one bit moves its byte by only that bit's value, and the low bits count as much as the high ones. Which kind it is gets decided by classification, never by width. The trigger's kind is part of the stability key, since a byte that keeps changing its mind about what it is has not settled.

## InputTester/sub-components/hid-calibration/stick-trigger-handlers

A trigger that is a switch is recorded the way a button is, and its byte is not excluded or claimed: other bits in it belong to real buttons, and taking the whole byte would make them unmappable. The stick finaliser logs the two item ids it wrote, because the card decides it is done by finding those ids in its own list; when a capture seems to reset, that line shows whether the write landed.

## InputTester/sub-components/hid-calibration/wizard-helpers.ts

Holds only `getByteColor`. The file keeps this name because `eslint.config.mjs` lists this exact path among the raw-colour exceptions (categorical colours that encode byte roles). Renaming it needs that exception moved first.

## InputTester/sub-components/hid-calibration/hooks/useHidCalibration.ts

The core state machine of the HID calibration wizard. `setItems` updates `itemsRef` at call time, not inside the updater React runs later: everything in the wizard reads `itemsRef`, including the byte status computation finalisers call on the next line, so a late assignment left those reads one capture behind and a just-claimed byte kept the previous item's colour.

When a host already resolved the device and profile, the profile picker is skipped. `detectedProfile` resolves asynchronously, so the auto-confirm waits for it; firing on `selectedProfileId` alone would race into a null profile, permanently, since it only tries once. It runs as a layout effect so the picker never paints. Identity (vendor and product id) is filled from the chosen device as soon as it is known, not only from the devices that have reported: a device captured with SDL's hold released never appears there, which left the ids at 0 for the whole capture. The flaky-byte check gates the start of button capture without replacing the underlying action.

## InputTester/sub-components/hid-calibration/hooks/useCalibrationActions.ts

Button detection is a comparison against the resting report: `findButtonBits` walks the shorter of baseline and frame, so with no baseline it compares zero bytes and every press is silently dropped. Starting a capture therefore takes the baseline on demand. Clicking a byte cell is a two-state toggle whatever the byte was: the first click excludes it (clearing any stick, trigger or button claim so the exclusion shows), the next returns it to unregistered. It never cycles into a classification. The gyro step's exclusions are kept apart from `excludedRef` (`gyroExcludedBytesRef`) so a later stick capture can reconsider only what the gyro step flagged.

## InputTester/sub-components/hid-calibration/hooks/useCalibrationExport.ts

An axis item can carry either shape: a trigger that turned out to be a switch holds a bit mapping, not a range. The export reads the mapping, not the item kind; matching on kind once dropped those triggers from the report while the UI showed them captured. Identity and the SDL capability view come from the same captured entry, so a report always describes one observation.

## InputTester/sub-components/hid-calibration/hooks/useDeviceAutoDetect.ts

Builds the checklist the wizard calibrates against straight from SDL's live capability report (`hasButton`, `hasAxis`, `buttonLabels`); no per-model database is consulted. The manual override list is the small set of SDL gamepad families. A host that already read the layout hands it over, since by then the device is released and reports no capabilities. A host that resolved only an id gets the live profile when the device is claimed, and otherwise the family's full set. Auto-detect reads the live snapshot, so a connected device that has not sent a report yet (SDL emits state on change only) is still detected.

## InputTester/sub-components/hid-calibration/hooks/useDeviceRawInfo.ts

SDL's `busType` is ground truth for USB or Bluetooth. node-hid is gone, so path, manufacturer and serial have no source and stay null; the product name still comes through. Both this hook and `useWizardRawCapture` fall back to the first ready device in the live snapshot, not one that has reported input, so an untouched pad can still be picked.

## InputTester/sub-components/hid-calibration/hooks/useReportSubscription.ts

Two subscriptions while live: raw HID bytes (fanned out to gyro, stick, trigger and button processing) and the same input through the real shipped parser, for the live parser panel beside the byte grid. Restlessness is observed on every frame, whatever step runs, so it is known before the first capture. The report names its own device, so identity comes from it. An idle reading runs after a stick is mapped, so it takes frames ahead of every capture branch.

## InputTester/sub-components/hid-calibration/components/ByteChangeDot.tsx

How far a byte moved from its baseline, drawn on the top border of its cell. Not a fill, border or text colour: "changed" has to read on top of whatever state the cell already shows (picked, claimed, excluded), and it is what the exclude workflow is judged against. An axis byte grows from the centre toward the left for negative and the right for positive; a byte with no direction (a bitmask) grows both ways. Colour encodes magnitude, green through amber to red, with fixed data-viz hues. The width is floored so the smallest real change still shows. Only stick and trigger bytes are signed.

## InputTester/sub-components/hid-calibration/components/ButtonMapping.tsx

Hosts can override the step title, include stick and trigger items (the positional-capture step has no separate stick and trigger cards), and hide the two-part axis hint (positional capture asks about an axis in one shot).

## InputTester/sub-components/hid-calibration/components/StickCard.tsx

A mapped stick is only done once it has also been read at rest, a separate deliberate step started by hand because only the user knows the stick is free.

## InputTester/sub-components/hid-calibration/components/InstructionsPanel.tsx

Open by default (still collapsible) because most calibration mistakes come from skipping it.

## InputTester/sub-components/hid-calibration/components/LiveParserOutput.tsx

Shows what SDL3's own decoded state reports for the same live bytes the grid is diffing: ground truth from the transport. Every positional slot the device reports is shown, including ones with no default SNES mapping (Home, Capture, C, GL, anything past MISC1), under a neutral positional name.

## InputTester/sub-components/hid-calibration/components/FlakyByteWarningDialog.tsx

Every flagged byte starts checked, since excluding them all is the recommended action. The selection resets whenever a fresh check reopens the dialog. While open, each byte's live movement refreshes so the user sees whether it still misbehaves.

## InputTester/sub-components/hid-calibration/diagnostics

The gamepad diagnostics report: who the device is, what the input layer can say about it, and how it was identified. The wizard's byte capture and positional capture travel with the report as their own artefacts, each in its native shape, never flattened into the summary. Copy and save both report real success or failure. Two SDL3 captures run for the device: a raw HID byte capture (best effort, since SDL's own joystick handle can hold the device exclusively) and a joystick-level capture (needs an SDL joystick id, so only once SDL has claimed the device).

`mapping-parser` turns a gamecontrollerdb mapping line into lookups from a raw joystick control (button index, hat index and mask, axis index) back to the SDL gamepad key, the inverse of the line itself. The key lists follow the fixed order of `SDL_BUTTON` and `SDL_AXIS` in `shared/input/sdl-buttons.ts`. Direction and inversion prefixes are stripped; only which control fired matters. No caller uses it today.

## InputTester/sub-components/ControllerDeviceList.tsx

- SDL3 is the only controller transport, so every device group shows exactly once.
- `resolvedByKey` is keyed off `groups`, which changes only on a snapshot update, not on every `controllerStates` tick (up to 60 per second).
- A device with no state yet shows an idle state of 32 released buttons and 6 centred axes.

## InputTester/sub-components/AdapterControllerCard.tsx

One card with a port list for a multi-port adapter. Every port shows, occupied or not: there is no reliable way yet to tell an empty port from a resting controller.

## InputTester/sub-components/UnavailableControllerCard.tsx

A device the lister sees but SDL3 has not claimed. It has no live data, so the card shows only identity, status and remedies.

## InputTester/sub-components/ControllerRawBytes.tsx

A collapsible raw report byte grid for a controller card.

## InputTester/sub-components/RumbleStrengthControl.tsx

A per-device rumble multiplier on top of the family strength curve in `shared/input/family/vibration-shaping.ts`. It is neutral at 1 and persisted per device key.

## InputTester/sub-components/HidCalibrationWizard.tsx

- Byte-level HID calibration. The flow: profile, GYRO (manual start and stop), IDLE (a one-click baseline), STICKS (a full circle auto-detects the 2 widest-range bytes), BUTTONS (auto-detect on bytes that are not excluded).
- The device and layout are settled before the wizard mounts. The `select-profile` early return covers the one frame before the layout arrives.
- A controller held exclusively at a lower level has no raw HID bytes. The wizard still runs on gamepad and joystick data, so it shows a notice in place of an empty byte grid.

## InputTester/sub-components/HidCalibrationWizard.type.ts

- `hideOwnActions` suppresses the wizard's own Copy, Finish and Cancel row for a host that renders its own through `HidWizardHandle`.
- `onCapturedCountChange` fires whenever the captured count changes, so such a host can drive its own Finish button.
- `initialProfile` is a layout already read from the live device and is used as is, because a released device can no longer be asked. `capturedEntry` is the device entry it was read from, for the report's identity fields.
- `initialProfileId` skips the profile picker and starts live calibration against that profile. `initialHasGyro` goes with it and is ignored when `initialProfileId` is unset.
- `HidWizardHandle` is the imperative surface for a `hideOwnActions` host. `copyJson` resolves true on success and false on failure, for example a denied clipboard write.

## InputTester/sub-components/calibration-parts

The step indicator, header, sampling progress bar and deadzone slider that the stick and trigger calibration wizards share.

## InputTester/sub-components/stick-calibration/StickCalibrationWizard.tsx

A 3-step analog stick calibration. It records centre offsets at rest, then the per-axis minimum and maximum from a full rotation, then lets the user adjust deadzones and save. With no `target` it calibrates both sticks. `deviceKey` filters input to one device.

## InputTester/sub-components/stick-calibration/StickCircle.tsx

An SVG analog stick position visualizer.

## InputTester/sub-components/stick-calibration/useStickCalibration.ts

The state machine for the 3-step stick calibration. Raw stick values are 12-bit, centred at 2048 with a maximum of 4095. The range step completes once every calibrated axis has moved more than 500 raw units.

## InputTester/sub-components/trigger-calibration/TriggerCalibrationWizard.tsx

A 2-step analog trigger calibration: record the idle base value, then the fully pressed maximum. It saves a per-axis calibration of base, max and deadzone, then a review step tests the result.

## InputTester/sub-components/trigger-calibration/TriggerBar.tsx

A vertical fill bar showing an analog trigger value. It brightens above 90% and draws the deadzone line on the review step.

## InputTester/sub-components/trigger-calibration/useTriggerCalibration.ts

- The state for the 2-step trigger calibration.
- `step` and `restDone` are mirrored into refs so the input subscription callback always sees current values.
- Axes 4 and 5 also show their raw report bytes 61 and 62.

## InputTester/sub-components/controller-report/ControllerReportDialog.tsx

- One persistent dialog: the step content swaps inside a fixed header and footer shell. The diagnostic portion is the same `DiagnosticsFlowBody` and `DiagnosticsStepActions` that the standalone diagnostics dialog renders, so the report cannot drift from it.
- `window.open` on an external URL is routed to the system browser by the main process.

## InputTester/sub-components/controller-report/behavior/useControllerReportForm.ts

- The diagnostics run stays open through the review step. Closing and reopening it would re-run the wizard's first step, which releases the hold, and only the positional-capture step restores it.
- `backToDiagnostics` returns to the run's summary with both captures and the restored hold intact. Nothing is re-run.
- The report description holds only what the reporter wrote. Every captured artefact goes through the `controllerReport` field.

## InputTester/sub-components/controller-report/behavior/useDetectionContext.ts

What the app knows about a device for a report bundle: the remembered name, the SDL type, and the last 20 raw HID reports.

## InputTester/sub-components/controller-report/behavior/useReportDiagnostics.ts

- Wires the shared diagnostics wizard state machine into the report. The run stays closed, so SDL keeps its hold, until the diagnostics step, and it pre-selects the report's device. The wizard's byte capture is the calibration map, and nothing here derives it again.
- There is no per-model preset. SDL's own capability report, already in the calibration map, is the identity signal, so `resolvedPreset` always reads null.

## InputTester/sub-components/controller-report/report-step-labels

Merges the report's steps with the wizard's dynamic step list into one strip. The diagnostic labels come from the wizard (byte capture drops out without byte capability) and are never restated here.

## InputTester/sub-components/controller-report/sub-components

- `IntroStep` explains what the report does before asking for anything.
- `UserInfoStep` collects contact info plus the same auto-collected debug info the bug report attaches. When signed in, the account is the contact and the email and name fields go away.
- `ConfirmStep` reviews everything that will be sent. Dense sections stay collapsed, but nothing is left out.
- `ReportSection` is a collapsible text block, the same pattern as the bug report's debug info preview.
- `StepIndicator` is the persistent "where am I" strip across the report steps.

## InputTester/sub-components/diagnostics-wizard/positional-capture/positional-capture.type.ts

- A target is a fixed, ordered ask ("press A", "move the LEFT stick") built from SDL's own capability report for the connected device before any input arrives. A record is the outcome once the user answers it or skips it.
- The joystick-level index that actually fired is compared against the SDL position's own index, so a mismatch (something firing at a different raw index than the name SDL gave it) is visible in the recorded data.
- `expectedIndex` is the `SDL_BUTTON` index for a button target's own position, and null for an axis target, which has no comparable single index.
- `firedIndex` is the joystick-level button or axis index that fired, and `firedPositionalName` the positional name at that index (SOUTH, LEFT_TRIGGER, and so on). Both are null when skipped.
- `mismatch` is true only when `firedIndex` and `expectedIndex` are both known and disagree.
- `AxisRanges` is the per-axis travel seen so far while one target is being captured.

## InputTester/sub-components/diagnostics-wizard/positional-capture/build-positional-targets.ts

Builds the fixed, ordered list of inputs the positional-capture step asks about: every control the connected device's `ResolvedDevice` carries, in the same face, d-pad, shoulder, stick, system and axis order the calibration cards render. SDL's own capability report decides this list, never a preset's default mappings. A control missing from a preset used to mean the diagnostic never asked about it at all. The function is pure, and `usePositionalOneByOne` only reads live state to detect which control fired. A button's position is its expectation: a joystick-level press landing anywhere else means the raw index disagrees with what SDL reports at that name.

## InputTester/sub-components/diagnostics-wizard/positional-capture/positional-capture.constants.ts

- `AXIS_FIRED_THRESHOLD` (0.5) is the minimum axis delta from the baseline that counts as moved, not resting jitter.
- `AXIS_TRAVEL_THRESHOLD` (0.8) is how far an axis must travel end to end before its identity is trusted. A full stick sweep or a trigger pressed to the stop clears it, a knock or a resting drift does not.
- `REST_EPSILON` (0.25): within this of the baseline counts as back at rest.

## InputTester/sub-components/diagnostics-wizard/positional-capture/positional-detect

Pure functions for `usePositionalOneByOne`:

- `widestAxis` returns the axis that travelled furthest, once any has travelled far enough.
- `isAtRest` is true when no button is held that was not held at the baseline and every axis is back near its baseline value. Capturing only at rest stops one still-deflected stick from answering every remaining question.
- `detectFiredIndex` returns the first index that transitioned (a button pressed, or an axis moved past the threshold) relative to the baseline, or null while nothing new has fired.
- `trimTargetsToDevice` drops button targets whose expected index is past what the device reports. Axis targets have no expected index, so every one stays askable, and a device missing that control is answered with Skip.
- `instructionFor` phrases one target as a concrete action, with the same wording byte capture uses for a stick axis.
- `isTriggerTarget` tells triggers from sticks by id. Triggers travel one way and spring back, sticks sweep a circle, so the prompt and the completion rule differ.

## InputTester/sub-components/diagnostics-wizard/positional-capture/usePositionalOneByOne.ts

- Drives the positional-capture step with the same one-by-one interaction `ButtonMapping` renders for byte capture (prompt, wait, record, advance, skip, go back), from joystick-level samples instead of raw byte diffs. The ask list comes from the device's resolved controls. `trimTargetsToDevice` is a safety net against the first live sample.
- The ask list is built once per device and stays stable while the step is active.
- When a new item becomes active the controller is usually still moving from the previous answer. Nothing is accepted until it has come back to rest, then the baseline is taken again from that resting position, so one stick sweep cannot answer every remaining item in a single frame.
- It reads the same decoded gamepad layer the calibration screen uses, so a recorded position means what its name says. The joystick layer underneath numbers its buttons and axes differently, and naming those numbers with positional names produced records that disagreed with the rest of the app.
- An axis is identified by how far it travels, not by the first frame it moves. The answer lands once the control returns to rest.

## InputTester/sub-components/diagnostics-wizard/DiagnosticsWizardDialog.tsx

- Gamepad diagnostics as a modal wizard: shut SDL down, pick a controller, byte capture (byte-capable devices only), positional capture again after the hold is restored, then a summary.
- It cannot be dismissed by backdrop, Escape or close while a run is in progress, because this wizard owns whether SDL is up. Only its own Cancel, Restart and Close actions end it, and they always restore the hold.
- Cancel appears on every step so a misbehaving step is never a dead end.
- `onComplete` fires when the dialog closes with a byte capture on hand, mirroring what the standalone `HidCalibrationWizard` reported through its own `onComplete`.

## InputTester/sub-components/diagnostics-wizard/DiagnosticsFlowBody.tsx

Shared by the standalone diagnostics dialog and the controller report, so both render the same steps.

## InputTester/sub-components/diagnostics-wizard/behavior/build-chooser-profile.ts

The calibration profile view for a resolved device, shared by the live chooser candidate and the frozen post-capture candidate in `useDiagnosticsWizardState`, which otherwise built the same `DeviceProfile` shape twice from two vendor and product sources.

## InputTester/sub-components/diagnostics-wizard/behavior/chooser-devices.ts

Step 2's device list is the union of two sources, because neither alone is honest about what is connected:

- the raw HID enumeration, which works while SDL's gamepad backend is released (step 1 onward), though a controller read through XInput and not HID (most Xbox-style pads) never appears in it;
- the SDL-claimed snapshot taken before step 1 releases the hold, the only source that ever sees an XInput-only pad, since SDL's own gamepad backend claims those independently of HID.

Byte capability comes from membership in the first list, never from a vendor or product id: present there means a raw HID open can reach the device. A chooser device's `name` is present only for a device the controller layer claimed before the run released it, since the raw enumeration reports no name of its own. Its `mapping` was captured before the release, because the mapping table cannot be queried while the gamepad subsystem is down.

## InputTester/sub-components/diagnostics-wizard/behavior/useAddedDeviceNames.ts

Names for the devices offered by the choose-a-controller step. It reads the session-wide cache instead of subscribing. A device announces its name when it connects, and by the time this dialog opens the run has released every controller, so nothing announces itself again until step 4 restores them. A listener created here would see nothing and every row would read as unknown. Devices reached over a raw USB interface also report an empty OS product string, so the cache is the only place a real name is available for them.

## InputTester/sub-components/diagnostics-wizard/behavior/useDeviceEntry.ts

Resolves the full `DeviceEntry` (sdlId, guid, capability flags) for a device key, kept in sync with the live SDL3 snapshot. The positional step needs the sdlId to open a joystick-level capture. The byte-level step gets by on the device key alone.

## InputTester/sub-components/diagnostics-wizard/behavior/useDeviceMapping.ts

The gamecontrollerdb mapping line SDL already has loaded for a device's guid, so the choose-a-controller step shows what the real database (loaded into SDL at startup from `resources/gamecontrollerdb.txt`) knows, in place of a static lookup file this project no longer maintains.

## InputTester/sub-components/diagnostics-wizard/behavior/useHidListedDevices.ts

The raw HID enumeration for step 2, fetched once per wizard open. It needs no subscription: `enumerateHid` has no push side and is unaffected by the gamepad hold this wizard releases and restores.

## InputTester/sub-components/diagnostics-wizard/behavior/useHoldTransition.ts

Runs one async hold transition (release or restore) whenever `active` becomes true, and tracks it as a status line: pending while in flight, done once it resolves truthy, error otherwise. `run` is a module-level store function with a stable identity, so only `active` triggers it again.

## InputTester/sub-components/diagnostics-wizard/behavior/useLayoutCapture.ts

- Reads one controller's real control layout, which means briefly bringing SDL back up. Only a device SDL currently holds reports what buttons and axes it has, plus its display name and per-button labels. The rest of the run needs the subsystem down to read raw HID bytes, so the layout is fetched in a short window: restore the hold, wait for this device to be claimed and report its capabilities, then release again. The result is frozen for the rest of the run.
- Progress is reported as stages, because the window is long enough to see and a spinner with no explanation looks like a hang.
- On failure the hold is released anyway: the next step reads raw bytes and cannot while SDL holds the device.
- `awaitClaimedEntry` waits for the device to come back claimed and carrying its capabilities. Being listed is not enough: the entry appears before SDL has reported what the device can do, and reading it too early produced a control list padded with positions the pad does not have. It polls every 120 ms up to a 4000 ms cap, which exists only so a pad that never comes back cannot stall the wizard.

## InputTester/sub-components/diagnostics-wizard/behavior/useStep1Shutdown.ts

- Step 1's status line: it captures the SDL-claimed device snapshot before releasing the hold, then releases it. The capture has to finish first, because SDL closes every gamepad through the normal removed path while releasing, so a later read would see nothing SDL-claimed.
- The snapshot is settled, not read once. Devices are claimed one at a time, each on its own event, so a single read catches only what is ready at that instant. That cost a controller its gyro flag and, on a restart right after the hold came back, left a reconnecting pad out of the list. `settledReadyDevices` polls every 150 ms for up to 1500 ms and stops after two quiet polls in a row.
- Bumping `runGeneration` runs the capture and release again while `active` stays true, for the summary step's "Restart on another controller".

## InputTester/sub-components/diagnostics-wizard/behavior/useSummaryExport.ts

Copy to clipboard and debug folder save for the summary step's combined payload: the byte capture and the positional records together, exactly what the summary step displays.

## InputTester/sub-components/diagnostics-wizard/behavior/useWizardNavigation.ts

Which steps are visible for the selected controller, where the run sits in them, and how it moves. The list is derived per run, since a controller with no byte capability drops that step, so neither the indicator nor Next and Back may assume a static order.

## InputTester/sub-components/diagnostics-wizard/behavior/wizard-steps.ts

The fixed wizard steps, in order. Byte capture shows only for a controller the raw HID enumeration can see. A false `hasByteCapability` drops it, for an XInput-style controller.

## InputTester/sub-components/diagnostics-wizard/behavior/useDiagnosticsWizardState.ts

- The central state machine for the diagnostics wizard: the active step, the device it runs against, the hold release and restore transitions steps 1 and 4 wait on, and the two capture results the final step shows side by side.
- The step 1 shutdown fires once per dialog open and again per restart via `runGeneration`, not once per visit to step 1. Going Back to step 1 and forward again must not overwrite the frozen pre-release snapshot with an already-released one.
- The captured mapping line wins over the live one, because it was read while the subsystem was still up.
- `initialDeviceKey` preselects a device for a host (the controller report) that already knows it. It falls back to the first listed device when unset or gone. Only steps 1 and 2 auto-pick a device, so the hold releasing or restoring later cannot clear the selection under a running capture.
- `activeSdlId` prefers the live entry (the id SDL reassigned on restore) and falls back to the frozen chooser entry until the live entry catches up.
- `resolvedDevice` is SDL's capability report for the live, restored device, resolved through the family layer like the calibration cards. It is null until the live entry has resolved after the restore, which the positional step treats as nothing to ask yet. `profile` builds step 2's summary panel from it, never from a per-model database.
- `capturedProfile` is built from the layout read during the one deliberate SDL window, and is frozen on purpose.
- If the dialog closes before step 4 restores the hold, the hold is put back anyway so every other controller consumer keeps working.
- Leaving the chooser reads the selected controller's real layout first and advances only once it has one. After this point SDL is down, so it is the last moment anything can ask the device what it has.
- Restart puts the hold back before the next run. Step 1 snapshots the claimed devices and sees only what is currently claimed, so restarting while still released would list nothing and drop every capability flag a claimed device carries. Step 1 reports its own failure.
- `DiagnosticsWizardState` is the hook's return shape, shared by the standalone dialog and the controller report's embedded run.

## InputTester/sub-components/diagnostics-wizard/sub-components

- `IntroStep` (step 1) explains the run and shuts SDL's gamepad backend down right there, before any device list is shown, so step 2 lists a controller only through the raw HID enumeration or the SDL snapshot taken just before the release. Next and Back stay disabled in the footer until its status line reaches done.
- `ChooseControllerStep` (step 2) lists every controller the run can find, the union of the raw HID enumeration and the pre-release SDL snapshot, and lets the user pick the one the later steps run against. Sourced this way, the list is never empty just because SDL's backend is released, and it still includes an XInput-style controller the HID enumeration alone never sees.
- `MatchedEntryPanel` shows what the real database knows about the selected device: SDL's own name, the gamecontrollerdb mapping line loaded for its guid (or none), which calibration profile the run uses, and whether a byte capture can run for it.
- `ByteCaptureStep` (step 3) releases the exclusive hold, then runs the byte-level capture body against the controller and profile chosen in step 2. The body is the `HidCalibrationWizard`, driven straight into live calibration through `initialProfileId` and `initialHasGyro` without its own picker, since step 2 resolved both. `initialProfile` is the layout read during the chooser step's SDL window, preferred over deriving one again, which cannot see a released device.
- `PositionalCaptureStep` (step 4) restores the exclusive hold, then asks for every control SDL reports the device has, one at a time in a fixed order, reusing the byte-capture step's one-by-one `ButtonMapping` UI through its `includeStickTriggerIds`, `showAxisSubStep` and `stepTitle` options. Each answer pairs what was asked for with the joystick-level index that fired, so a mismatch between what SDL calls a position and what physically fires there shows in the record.
- `SummaryStep` shows the byte-level capture and the positional capture side by side. The byte column explains itself when the controller has no byte capability and that step never ran. The step's actions live in the dialog's own footer, where every other step's Back and Next buttons live.
- `DiagnosticsStepActions` is the Back and Next pair for the four sub-steps whose navigation never differs by host: intro, choose-controller, byte-capture and positional-capture. The summary ends the run differently per host (restart and loop for the standalone dialog, hand off to the report's review step for the controller report) and is built by the caller. `introBack` is the one seam between hosts: the standalone dialog has no earlier step, so it leaves this unset and shows no Back on the intro. The controller report passes a callback that leaves the diagnostic run.
- `HoldStatusLine` is the status line for a hold release or restore: a spinner while the native call is in flight, then a settled state.
- `LayoutCaptureOverlay` covers the step while the controller's layout is being read. The read needs SDL brought up and taken down again, which takes long enough to notice, so each stage is named, and the fetch line names the pad being read.

## InputTester stylesheets

- `ControllerReportDialog.css` and `DiagnosticsWizardDialog.css`: the header (title and step strip) and the footer (actions) stay put, and only the body scrolls.
- `DiagnosticsWizardDialog.css`: the title shares its row with a five-step strip, and the shared header style ellipsises the title when space runs short, which cut it to a single letter. The row wraps and the title keeps its natural width.
- `DiagnosticsWizardDialog.css`: the layout overlay covers the step instead of replacing it, so the choice stays visible behind the read and the dialog does not change size mid-transition.
- `InputCalibration.css`: the card shimmer runs continuously, so a stutter means the UI thread is blocked.
- `InputCalibration.hid.css`: the idle read is a real step, so its prompt carries the same weight as the live-capture readout. The change magnitude mark is drawn on the byte cell's top border so it can sit on top of any cell state, and its width and colour are set inline from the byte's own delta.

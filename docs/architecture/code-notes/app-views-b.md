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

## ProfileHub/ProfileHub.constants.ts

- `PROFILE_HUB_TABS` is the single registry of every ProfileHub tab: icons, label, and (when the tab is a SettingsLayout screen) the function that builds its sections from the current settings. It is a `Record<ProfileHubTab, ...>`, so adding a tab to the union without describing it here is a compile error. That keeps it in sync with the hub's nav, its search results and the search palette's catalog with no manual bookkeeping.
- `buildPerformanceSection` normally takes the live refresh rate and synced-rate status, which come from hooks and not settings. The search catalog only needs the section's labels and keywords for indexing, so it is built with the neutral `NEUTRAL_SYNCED_RATE` placeholder.
- The GBA tab is a read-only reference catalogue, not a SettingsLayout screen, so it has no sections to index.
- `PROFILE_HUB_NAV_GROUPS` are the nav's groups in order. Home is not in a group: it is pinned above them.

## ProfileHub/ProfileHub.type.ts

- The `settings` tab is Display: screen geometry and performance. The `online` tab is for Archipelago profiles only.
- `ProfileHubTabSpec`: `icon` is the emoji for the search palette's rows and `navIcon` the line icon for the hub's nav and page headers. `sections` is omitted for tabs with no SettingsLayout (Home, and the custom binding UI of Controls). `mobileOnly` tabs are listed only on the mobile form factor and `onlineOnly` tabs only for an online (Archipelago) profile.

## ProfileHub/behavior/is-hub-tab-shown.ts

Whether a tab is listed. The NavRail and the search catalog ask the same question.

## ProfileHub/ProfileHub.tsx

- The profile window's body. Its title bar belongs to the host layer, which shows the game controls there off the home tab.
- The per-profile notch preference is reflected on the html element whenever it changes.
- Search palette bridge: while this profile's hub is mounted it is the only reader and writer of GameSettings, so it registers them and lets the palette show and flip inline toggles.
- A pending tab switch (for example from a DisabledOverlay's "Open Settings" action) is consumed before the anchor effect runs, so the scroll happens on the tab it just landed on. A pending search deep link is consumed once the target tab's content is showing.

## ProfileHub/behavior/apply-settings-effects.ts

- The side effects of a settings change: persist, parent notifications, HUD sync, live push and toast. A failed save shows a toast so settings never fail to save silently.
- Changing the player sprite swaps the sheet in the running core so the choice shows without a restart.
- Control scheme and slot assignments go to the store and to the scheme runtime, which the per-frame router reads to turn a pressed button into an item id and the Y bit. Pushing here, not leaving it to the store's own game UI subscription, makes an assignment take effect the moment it is made: that subscription only ticks while the core runs.
- A host-drawn HUD style needs a 16:9 or wider display to have room for the HUD and the menu. If the ratio is narrowed while it is active, it drops back to the original style and says why, since a clipped menu would be worse than losing the style. The correction is queued, because this runs inside the `setSettings` updater and feeding a second change straight back would re-enter it. Shrinking the window can do the same with no settings change; that route raises the same request from GameOverlay, so the drop and its wording live in one place.
- When the game is running, settings are pushed live, and a change that needs a restart shows the restart toast once.

## ProfileHub/behavior/swap-player-sprite.ts

Applies a sprite choice to the running core and stages it again for the next boot. Staging matters even when the live swap succeeds, because the core reads the staged bytes again when the game restarts.

## ProfileHub/behavior/sync-hud-store.ts

Vanilla Safe brings the native HUD back in the core (its HudOverride bit is masked), so the host overlay has to stand down at the same moment. Locking the setting only greys the control out: the stored value stays enhanced, and the overlay would keep drawing over the native HUD the core just restored, which is the doubled HUD. Original is the stock HUD here. The saved preference is untouched, so it returns when Vanilla Safe goes off.

## ProfileHub/behavior/settings-effects.constants.ts

- `HUD_STORE_KEYS` are the keys the HUD render store mirrors. A change to any of them syncs it again.
- `CONTROL_STORE_KEYS` are the keys the control-scheme store and the per-frame input router are derived from. `syncControlSettings` gets the whole settings object, not a patch: the scheme and the takeover it arms are both derived from the HUD style, and Vanilla Safe strips them.
- `ASPECT_KEYS` are the keys that can change the display ratio a host-drawn style is measured against.

## ProfileHub/behavior/sync-dialog-store.ts

Mirrors the dialog settings into the overlay's store: the message box look, plus the pacing controls the button prompts describe. Vanilla Safe stands the overlay down the way it does the HUD: it masks the override the enhanced box hides the native one through, so the overlay reads original while the saved preference stays put. It masks the pacing gate too, so none of the pacing controls act and none are prompted.

## ProfileHub/behavior/sync-title-store.ts

Mirrors the title screen settings into the overlay's store. Vanilla Safe masks the bit the native title is hidden through, so the overlay reads original while the saved preference stays put.

## ProfileHub/behavior/useGamePause.ts

Tracks the running game's pause state from the InputManager and toggles it.

## ProfileHub/behavior/useProfileSettings.ts

- Settings load, persist and live push, and the restart toasts, for ProfileHub. Live settings are pushed when the game starts, and the restart toast clears when it stops.
- `loadedRef` says whether the profile's file has been read. Until then `settings` holds the app defaults, and applying a change would write those defaults over the whole file. So a change that arrives first (the launch's mute, pressed again after a reload) waits and lands on the file once it is loaded, through the latest handler.
- The change is logged outside `setSettings` to avoid setting state in another component during render.
- The master volume override comes from the title bar mute toggle.
- The HUD storage layer is told which profile this screen edits instead of inferring it: the layout editor opens from here, and this component holds the profile. The id is cleared on the way out so the inference chain (running game, pinned launch, last selected) takes over when no settings screen is mounted.
- On load the control-scheme store is synced too. It and the per-frame router are driven off a game UI store subscription that only ticks while the core runs, so without this the player's slot assignments would not reach them until a game started. The live push on load is a no-op when the module is not running. A failed read keeps the defaults.
- It listens for external settings change requests, for example from the debug widget.
- A host-drawn style that lost the width it needs is dropped here, whether a narrowed ratio or the overlay seeing the window shrink asked for it, so the style is dropped once and the notice worded once.

## ProfileHub/sub-components/audio-settings-sections.constants.ts

The Audio tab is ordered by what a person reaches for: levels first, then the music pack, and the device settings last. Those three are derived from the pack in Auto, so they are the ones a person should rarely need to open.

## ProfileHub/sub-components/haptics-settings-sections.constants.ts

The Haptics tab's keys use a dotted `haptics.*` path, because they live under `settings.haptics` and not at the top level, unlike every other tab.

## ProfileHub/sub-components/developer-settings-sections.constants.ts

`SANCTUARY_ACCOUNT_KEY` is the row DeveloperSettings swaps for the account card. It is not a GameSettings key and maps to no setting.

## ProfileHub/sub-components/gameplay-settings-sections.constants.ts

Save states and turbo share the Game Flow section: both act on the running game from outside its own rules, one moving where you resume, the other how fast it runs. Save states live in Gameplay, not a tab of their own, because they are part of how the game is played, not a property of the host. `GAME_FLOW_SECTION` is exported because its controls are rendered by `gameplay-settings-controls`.

## ProfileHub/sub-components/build-bug-fix-section.ts

The Bug Fixes section is generated from the registry (the 42 split bug fixes). It has no JSX and stays apart from `bugfix-settings-controls.tsx`, which renders the per-fix toggle, so non-React consumers (the search catalog) can import it. The widescreen corrections are not here: they are one switch on the Display tab, which covers the core bit and the fix split from that bundle together.

## ProfileHub/sub-components/legacy-master.ts

A fix with no explicit toggle inherits the legacy bundle master it came from.

## ProfileHub/sub-components/bugfix-settings-controls.tsx

Each fix is an opt-in toggle stored in `settings.bugFixToggles`. When a fix has no explicit override it inherits the legacy bundle master it was extracted from, so existing profiles keep their behaviour. This mirrors `buildFeatureWords` in the bridge (`live-settings-flags.ts`).

## ProfileHub/sub-components/build-window-section.ts

Pixel Perfect only has meaning under Letterbox. Fit and Stretch bypass the fit math entirely.

## ProfileHub/sub-components/refresh-advisory.ts

The game advances exactly 60 times a second, so a display running at a whole multiple of 60 shows every frame for the same length of time. One that does not holds some frames longer than others, and no pacing on our side can even that out. The V-Sync description says so and names the rate that would help, so the player is not left wondering why V-Sync did nothing.

## ProfileHub/sub-components/synced-rate-description.ts

The synced refresh rate switch describes what it will do, including handing the display back, because changing a system setting on someone's behalf should never be a surprise.

## ProfileHub/sub-components/build-performance-section.ts

The target refresh rate picker appears only once the switch is on and there is a real choice to make.

## ProfileHub/sub-components/SettingsView.constants.ts

- Shadow Casting (`postProcessingShadows`) is not exposed in the Enhancements section yet, because the subsystem is a work in progress.
- `REQUIRES_LINEAR` holds the wide presets that need Linear World Tilemap, `REQUIRES_ULTRAWIDE` the ones that also need Ultrawide, and `TALL_PRESET_VALUES` the tall presets shown only when Tall Rendering is on.

## ProfileHub/sub-components/SettingsView.display.ts

Builds the Display section from the current settings. With Extended Rendering on, the order is: capability toggles first (enable a capability, then the picker below reflects it), then the aspect ratio picker showing only the presets those capabilities unlocked, then sprite and enemy behaviour, which only matters past the original picture. Camera is a separate section behind the same Extended Rendering gate, all off by default.

## ProfileHub/sub-components/SettingsView.tsx

- How the game reaches the screen, drawn as three tabs that share one set of controls and cascades: Display (rendering geometry and frame pacing), Camera and Window. `part` says which of the three tabs this view is.
- `withAspectCascade` resets the ratio when a capability is turned off, so the active ratio stays valid.
- Pushing the synced rate preference also arms it for the session. The host applies it on the next fullscreen transition, not on this call.

## ProfileHub/sub-components/SettingsView.controls.tsx

The per-key control renderer for the Display tab: aspect ratio, window, viewport, off-screen behaviour and refresh rate. The off-screen behaviour description is shown under the control for whichever option is selected, so each option explains itself and the player does not have to guess what Idle does to an enemy they can see that is ignoring them. The `offscreenAI` setting key keeps its name, since it is part of the shared settings type.

## ProfileHub/sub-components/online-settings-sections.constants.ts

- The Online tab is for Archipelago profiles only.
- The session's switches live on the profile's connection, not in GameSettings, so their keys name no setting: a section reset and the search palette's inline toggle pass them by, and OnlineSettings draws them itself. A switch's `fallback` is the value a profile that never set it runs with.

## ProfileHub/sub-components/OnlineSettings.tsx

The Online tab: the session's two switches (DeathLink, tracking the other players), then which notices of an Archipelago session show as toasts. The switches belong to the profile's connection, not its settings, so they read and save through the profile (`useProfileConnection`), which reconnects a running session on the new values. The same component is the Online tab of the Randomizer page.

## ProfileHub/sub-components/audio-settings-controls.tsx

- The per-key control renderer for the Audio tab. The pack format, the output rate, the channel count and the buffer are technical values with one correct answer per pack, so in Auto they are shown as derived and locked. Manual unlocks every one of them and adds the warning that says when a combination is wrong.
- `MSU_OPTIONS` covers every pack shape: the four distributed formats, our layered one, and off.
- `AUTO_NOTE` is appended to a control whose value Auto chooses, so a locked row explains itself.
- A locked control shows the resolved value that will be used, not a stale one.
- Master, Music, Ambience and SFX are plain sliders of one shape, so they render in `audio-volume-sliders.tsx`.
- Replacement music has no gate-word bit of its own, so Vanilla Safe suppresses it in the playback plan whatever this control says, and the Pack Format control is locked the way a registered feature is.

## ProfileHub/sub-components/audio-settings-disabled.ts

- The pack-dependent switches only mean something while a pack plays at all. Only Manual mode's own switch can turn them off: in Auto, whether a pack plays is decided by the pack being assigned, so a stale `enableMSU` from a profile saved before that change must not grey them out.
- The Music, Ambience and SFX sliders only act once the independent-mix toggle is on.

## ProfileHub/sub-components/audio-volume-sliders.tsx

The volume group sliders: master, music, ambience and SFX. Master always applies. The three group sliders only act once the independent-mix toggle is on, so they render disabled until then. Ambience is app-mixed only: the sound chip cannot split its own ambience out of its mix, so that slider governs the replacement ambient bed a pack plays, never the original audio.

## ProfileHub/sub-components/BugFixesSettings.tsx

The bundle masters plus the 42 split per-fix toggles.

## ProfileHub/sub-components/DeveloperSettings.tsx

The account row is the one item on the Developer tab that is not a toggle.

## ProfileHub/sub-components/gameplay-settings-controls.tsx

Only the keys that need something other than a switch have a renderer. Every plain boolean (including `mapOnSelect`) falls through to SettingsLayout's own toggle, built from the section's label and description. The disabled rule is the one hook a plain boolean still gets.

## ProfileHub/sub-components/gameplay-settings-disabled.ts

Under Modern the map is a core verb of its own, so Open Map with Select has nothing to do. It is greyed and kept in place, like every other gated setting in the app: an option that vanishes when a neighbouring one changes reads as a bug.

## ProfileHub/sub-components/GraphicsSettings.tsx

How the picture is drawn: renderer, quality, post-processing effects and player appearance.

## ProfileHub/sub-components/graphics-settings-disabled.ts

- Pixel Perfect promises whole, identical source pixels, and bilinear interpolation would break that before anything else runs, so the core is handed Linear Filtering off and the control follows.
- Enhanced Mode 7 and No Sprite Limit are not registered feature definitions yet, so the DisabledOverlay lock (driven by `feature-registry.ts`) cannot reach them. They are locked by hand under Vanilla Safe, matching how `buildPpuFlags` forces both off. Optimized PPU stays enabled on purpose: it is a pure engine swap, not a divergence from stock rendering.

## ProfileHub/sub-components/haptics-settings-disabled.ts

Every haptic setting except the master switch is disabled while haptics is off.

## ProfileHub/sub-components/MobileSettings.tsx

Mobile and device-specific display options.

## ProfileHub/sub-components/hud-settings-controls.tsx

- The per-key control renderer for the HUD tab. The Title Screen and Dialog Box sections live in their own renderers to keep this file small.
- Enhanced and Modern are the host-drawn HUD plus the host-owned menu, so choosing either one also sets the overlay settings it depends on instead of leaving the user to find them. `mergeSettings` applies the same rule to a stored profile.

## ProfileHub/sub-components/hud-ratio-options.ts

Fixed HUD ratio presets wider than the screen are disabled, since the HUD clamps to the screen anyway. Match and Custom stay open.

## ProfileHub/sub-components/hud-settings-disabled.ts

The Title Screen and Dialog Box sections carry dependent rows. Every other HUD row is always live.

## ProfileHub/sub-components/hud-title-disabled.ts

Every title row but the switch describes the reimagined title, so the original one idles them.

## ProfileHub/sub-components/hud-dialog-controls.tsx

The Dialog Box section's renderer: the box, text and background rows live here, the border, texture and highlight rows in their own renderers.

## ProfileHub/sub-components/hud-dialog-disabled.ts

`EITHER_BOX_KEYS` act on both boxes, so the original box leaves them live. Every other row describes the enhanced box, so the original box idles them all.

## ProfileHub/sub-components/hud-dialog-border-disabled.ts

Thickness and colour describe a drawn line, so the game's tiles and no border leave them idle.

## ProfileHub/sub-components/hud-dialog-texture-disabled.ts

Only the rows the texture subsection owns get an answer. The Dialog Box section runs every one of its keys through this rule, so claiming a key that belongs to another subsection would idle that row too.

## ProfileHub/sub-components/hud-settings.constants.ts

`DIALOG_TEXTURE_SCALES` are the cell size multipliers the pattern Size slider offers.

## ProfileHub/sub-components/hud-dialog-highlight-controls.tsx

The Highlights subsection. Both boxes draw the highlights.

## ProfileHub/sub-components/TurboSpeedControl.tsx

The turbo rungs are not evenly spaced (1.25x to 10x, widening as they climb), so the range input walks the ladder by index and the label shows the multiplier at that rung.

## ProfileHub/sub-components/dialog-stop-slider.tsx

One slider over a ladder of stops. The stops are not evenly spaced (1x, 1.5x, 2x, then instant), so the range input walks the ladder by index and the label shows the stop at that index. An off-ladder stored value snaps to the nearest stop. `formatStop` defaults to the pacing form: Original, Instant, or "1.5x". Shared by the text speed, hold speed and font size rows.

## ProfileHub/sub-components/dialog-hold-row.tsx

The hold-to-accelerate row: one setting item with two values. The toggle on the left turns the hold on, and the slider to its right picks the speed the hold plays at, dimmed while the toggle is off.

## ProfileHub/sub-components/dialog-color-control.tsx

A settings row for one hex colour (`#rrggbb`): the label and description on the left, a swatch on the right that opens the colour picker beside it. `original` is the value a fresh profile carries, offered as the picker's reset target.

## ProfileHub/sub-components/AspectRatioControl.tsx

The aspect ratio picker has two modes. Legacy (HUD) passes `presetOptions` and shows a single Preset tab. Split (game) passes `widePresets` and/or `tallPresets` and shows Wide and Tall tabs (omit `tallPresets` when tall rendering is off). The other tabs (Auto, Screen, Custom) are always rendered from `options`. `descriptions` holds per-mode text, and `recommendedNote` appears in gold when the selected mode matches `recommendedValue`. The current value is resolved to the top-level tab it belongs to.

## ProfileHub/sub-components/HudStyleControl.tsx

- Original, Enhanced and Modern all rebuild the SNES HUD from the active ROM's extracted sprites, so all three are locked when none exist. The two app-drawn styles also need a 16:9 or wider display, because their groups and their host-drawn menu live in the side bands a narrower view does not have. Modern is Enhanced plus the modern control scheme, so it has exactly Enhanced's requirements. When sprites are missing a notice offers a one-click extract that unlocks every style once it succeeds.
- Availability is checked again on mount, since sprites may have been extracted from the Data Manager.
- The notice names only the condition the user can act on, one fix at a time: missing sprites is the blocking one (it locks all three styles), and the aspect rule is only raised once the sprites are there. When neither applies there is no notice.

## ProfileHub/sub-components/PlayerSpriteSelector.tsx

A card grid picker for the profile's player sprite. It reads the global player sprite library, and Original is the default. Each card is a `SpriteChoiceCard`.

## ProfileHub/sub-components/MsuDetectedSummary.tsx

The read-only Auto mode row of the Audio tab: the format read off the assigned pack, and the audio settings that follow from it. `pack` is null when no pack is assigned. `MODE_LABELS` names the pack formats the way the wider MSU community names them.

## ProfileHub/sub-components/pack-detail.ts

What else is true about the pack beyond its format name. A layered pack reports as MSUL, but its track numbering and audio format still matter and would otherwise go unmentioned.

## ProfileHub/sub-components/MsuMismatchCallout.tsx

Warns that manual audio settings disagree with the chosen pack format, so music will play at the wrong speed. The old core only ever reported this to stderr.

## ProfileHub/sub-components/useMsuPackProfile.ts

Detects the assigned MSU pack's contents for the Audio tab's Auto mode. It reads the profile fresh from storage instead of trusting the profile object passed down from the app shell, because that object is a snapshot from profile load time and a pack assigned in Data Manager afterwards never reaches it. AudioSettings mounts again on every tab activation, so the read is current whenever the tab opens. The manifest is read too, because it is what makes a pack layered: track names alone cannot tell a layered pack from a classic one.

## ProfileHub/sub-components/SanctuaryAccount.tsx

The Sanctuary account row of the Contributor tab: the shared account card, given the Sanctuary's wording and wired to the session store. `window.open` on an external URL is routed to the system browser by the main process.

## ProfileHub/sub-components/HubGameControls.tsx

The game controls: Play when stopped, otherwise Pause, Stop and Reset. On the home tab they sit in the hero under the mode, and on every other tab in the window's title bar (title bar buttons are small, the hero's are the regular size). Stop is slow (save on quit, then teardown), so it shows progress and ignores repeat clicks until the game has stopped.

## ProfileHub/sub-components/gba-settings/GbaSettings.tsx

The Game Boy Advance tab: everything the second cartridge changes. Every difference row is read-only reference material. The only interactive control is the Extra Dungeon toggle at the top, which is gated on the supplement being imported.

## ProfileHub/sub-components/gba-settings/GbaDifferenceRow.tsx

One read-only row of the difference catalogue: label, detail text and an evidence badge. Presentational only, with no data fetching and no state.

## ProfileHub/sub-components/gba-settings/group-differences.ts

Filters and groups the GBA difference catalogue for the settings list. Groups come out in the order `GBA_GROUP_ORDER` declares, so the list reads the same every time whichever rows survive the filter.

## ProfileHub/sub-components/gba-settings/behavior/useGbaAvailability.ts

Whether a Game Boy Advance supplement cartridge has been imported, so the Extra Dungeon toggle knows whether it has anything to gate.

## ProfileHub/sub-components/ProfileHubBody.tsx

- ProfileHub's nav and content pane. The pane shows the active tab as a page. While the search field has focus or holds text, no tab is selected and the pane shows the search: an empty state until something is typed, then every matching setting from every tab. Picking a tab (from the nav or a result), or leaving the field empty, ends the search.
- A profile switch away from Archipelago drops the Online tab, and its page goes with it.
- Mobile options have their own tab, shown only on mobile, and the Online tab only for Archipelago.
- `randomizerFrozenKeys` are the keys the profile's randomizer config pins. SettingsLayout locks those controls.
- `HEADER_HORIZON` is low because a page header is short, which keeps the castle in view.

## ProfileHub/sub-components/ProfileHubTabContent.tsx

The content of one hub tab, shared by the active page and the search results pane, which draws the same components through SettingsPageContext. The GBA tab is a reference page with its own layout, not a SettingsLayout, so the page draws its header. The Controls binding screen lays out and scrolls its own columns, so its page only draws the header.

## ProfileHub/sub-components/ControlsSettings.tsx

The full input mapping UI. The layout is a sidebar (profiles), a main column (the tabbed binding editor) and a devices column, plus the rebind listener and the confirm-preset and delete-profile dialogs. The logic lives in `useControlsSettings` and the columns in `controls/`. `useControlsSettings.ts` beside it re-exports the hook from `controls-settings/` so existing imports keep working.

## ProfileHub/sub-components/controls-settings/listening-label.ts

What the capture modal says it is listening for.

## ProfileHub/sub-components/controls-settings/build-modern-bindings.ts

- The modern bindings a profile starts with, for the device it is assigned to. It is one entry point for the two callers that need it (dropping a controller onto a profile while the modern scheme is active, and switching a profile to the modern scheme for the first time), so they can never disagree about what a fresh modern profile looks like.
- It returns null when there is nothing to build from: a gamepad profile whose device has never been seen (no live capabilities, no remembered SDL type) has no control list, and inventing one would fabricate buttons the pad may not have.
- It prefills two things together on purpose: the slot list and the HUD layout this scheme wears. A dropped controller with a slot list but no layout would have working buttons with nowhere on screen to see them.
- What lands on disk is a prefill, and from then on it is the slot list: every reader reads it back as written (`effectiveSlots`), and the player adds to it, removes from it and binds it again on the controls screen. Nothing derives it again behind them. That is what makes the list open-ended, and it is the reversal contract section 19 records.

## ProfileHub/sub-components/controls-settings/controls-settings.constants.ts

`FAMILY_ICON_MAP` holds one brand silhouette per controller family, shared by the required-inputs strip and the per-binding device glyph so both show the same icon for a family. The drag data keys match the ones `controls/device-drag-data.ts` writes.

## ProfileHub/sub-components/controls-settings/family-icon-map.ts

`resolveLiveFamilyIcon` resolves which family a vid:pid belongs to, preferring this session's remembered SDL type and falling back to a connected device's own live family, the same precedence the required-inputs strip used before it was shared.

## ProfileHub/sub-components/controls-settings/live-device.ts

"Is the pad this binding came from plugged in right now?" for the controls screen. It is shared because several lenses ask it for the same reason: a live device carries an `sdlType`, and that lets `resolveIconByVidPid` answer for a pad this session's family cache has never seen. The SNES mapping rows and the core verb rows both resolve their glyph that way.

## ProfileHub/sub-components/controls-settings/modern-slots.ts

- Slot list presentation for the controls screen. Identity is a number now (contract section 19) and `slotName` in `@shared/input/scheme` spells it, so the old `slotIdLabel`, which unpicked a position out of a `slot:NORTH` string, is gone with the ids.
- What remains is the one thing only this screen can answer: when the player binds a slot to a different control, which picture the slot should now wear. `position` and `icon` are display only, so they have to follow the binding or the row keeps drawing the artwork of a button that no longer does anything. The live control list is the only place that artwork exists.
- A pad control the device reports brings its own position, artwork and name. A key or a control this pad does not report brings none of the three, on purpose: the glyph chain then draws the binding (a key cap, or the generic button art), which is the control the player presses. Every row still shows a glyph, since `binding-display.ts` has no text-only branch for a bound control.

## ProfileHub/sub-components/controls-settings/profile-controls.ts

"What does this profile's device physically have?" for the controls screen. The modern scheme prefills its slot list from the device's resolved control list, so the screen needs that list for the profile being edited even while the pad is unplugged, or the slot list would empty itself the moment a controller sleeps. Three sources, in order:

1. A live SDL entry for the profile's assigned vid:pid, which carries the real hasButton and hasAxis, so only what the unit reports appears.
2. This session's remembered SDL type for that vid:pid, expanded through the same synthetic "assume every position present" list the saved binding icon lookup uses. A disconnected pad keeps its slots. The identity's own `sdlType` is the fallback when the cache has none.
3. Nothing, for a keyboard profile (SDL never enumerates one) or a profile with no device assigned. The keyboard's modern bindings come from `keyboardModernBindings()`, which needs no control list.

## ProfileHub/sub-components/controls-settings/useBindingState.ts

Rebind listening, capture and clear logic for SNES button mappings, function action mappings, and (under the modern scheme) the ten core verbs and the player's numbered slots. Core and slot captures go straight to useModernScheme's writers: this hook owns what is being listened for, never the shape of what a modern profile stores.

## ProfileHub/sub-components/controls-settings/useControlsSettings.ts

- A thin orchestrator composing the focused hooks. Order matters in one place: the resolved control list for the active profile's device feeds both the scheme hook (which owns the slot list) and the drag and drop hook (which builds a dropped device's modern bindings), so it is computed once.
- The HUD layout is a property of the scheme, so it is edited beside the slot list and not in the HUD settings. Switching control profile switches the arrangement with the buttons.
- Both binding tabs draw the core verbs, so each verb's glyph is resolved here and not inside either tab.
- Each scheme greys out the other's binding tab, so a HUD style change (which is what moves the scheme) while that tab is open moves to its counterpart instead of leaving the screen on a disabled tab.

## ProfileHub/sub-components/controls-settings/useCoreIcons.ts

- Resolves the device glyph for each of the ten core verbs. The SNES mapping rows have carried a resolved icon since the family layer landed, the core verb rows never did, and passing no icon is not neutral: `getBindingIconUrl` ends its chain on a generic keyed off the binding's shape alone, so on a pad every core button row drew the same generic button. Pause, Map, Confirm, Cancel and the two screen verbs were six identical circles, one tab away from the same buttons drawn as real artwork.
- So this resolves through the same `resolveIconByVidPid` that tab uses (device override, then family, then generic, plus `resolveStickDirectionIcon` for an axis, so the four movement rows get four different glyphs).
- A core binding carries no source vid:pid of its own, so the profile's assigned device supplies it: the same device `controlsForProfile` prefills the slot list from, so the two lists on this tab cannot disagree about which pad they describe.
- Keyboard and unbound verbs resolve to null on purpose: a keyboard glyph comes from its key code further down `getBindingIconUrl`'s chain, and `none` draws nothing.

## ProfileHub/sub-components/controls-settings/useDeviceSync.ts

Detects and tracks connected input devices. `devices` and `filteredDevices` stay sourced from the InputManager, because drag and drop preset assignment, haptics and the display mappings lookup all key off that shape. `controllerGroups` is the newer SDL3 device list the device column renders gamepads from (ready or unavailable status, adapter grouping, capabilities), sourced separately so none of the other consumers had to change.

## ProfileHub/sub-components/controls-settings/useDisplayMappings.ts

- Derived display data: the required inputs strip and the display mappings.
- When more than one physical controller feeds the profile's bindings, each binding row also shows which one it came from. A single-controller profile never needs that.
- Every binding shape is resolved again, axes included. A stored axis icon can only be a stick's neutral base key, because a family declares one key per stick shared by its X and Y, so honouring it drew the same undeflected stick on all four movement rows. Only `resolveIconByVidPid` knows which end of the axis the binding is, and it reaches `resolveStickDirectionIcon`. `build-console-defaults` no longer stores one, and this also fixes the profiles that already have one.

## ProfileHub/sub-components/controls-settings/useDragDrop.ts

- Drag over and drop handling, and applying console defaults. A dropped device carries only its sdlType (plus vid and pid), and there is no per-model preset. The keyboard is the one sentinel case (sdlType `keyboard`, see `device-detector.ts`) still resolved from its hand-authored `KEYBOARD_DEFAULT`. Every gamepad's defaults come from the family layer's console defaults through `buildConsoleDefaultMappings`.
- The dragged card carries its own resolved name (`device-drag-data.ts`). Only a legacy drag source without one falls back to the device list.
- Icons are never stored on a freshly applied binding, since they resolve live from the source vid and pid plus the binding's index, like any other saved binding.
- Under the modern scheme the same drop also gives the profile its modern bindings, derived from what SDL says the dropped device has. A device with nothing to resolve from yields null and keeps whatever the profile had. The classic console default mappings are written either way: the two live side by side on the profile, so switching schemes back never has to rebuild the other one.

## ProfileHub/sub-components/controls-settings/useHapticsToggle.ts

The profile-level haptics switch. When on, every controller the profile uses receives rumble. There is no per-device list to curate here: the routing in `lib/input/haptic-bridge.ts` reads the profile's own device set live.

## ProfileHub/sub-components/controls-settings/useModernScheme.ts

- The scheme half of the controls screen. The slot list is the player's, and this is where they build it. It is stored on the profile, prefilled from the device the first time one is dropped on, and from then on added to, removed from and bound here. There is one row per slot, numbered Slot 1, Slot 2 and so on, with no cap and no category filter, so a thirty-button pad is thirty rows and a keyboard is as many as the player wants (contract section 19).
- That reverses the old rule, which derived the list on every read from the live device filtered to two categories. Deriving made the list uneditable: anything the player added was recomputed away on the next render, and anything the device did not report could never be added.
- The HUD layout this scheme wears sits on the same profile beside the slot list (`modern.layoutId`) and is edited by `useSchemeLayout`. Every write here carries it through untouched, so a slot edit can never move the player's HUD back to the default.
- What a slot fires lives in settings (`modernScheme.assignments`), keyed by slot number, and is never pruned here. Removing a slot closes the gap, so the assignments below it move up with the numbering. `remapAssignments` is that move, which is why a removal writes both halves in one call, so the items can never end up one button out of step.
- The scheme is read, never set. It is derived from the HUD style (`controlSchemeOf`), so there is no setter and no moment at which switching to Modern builds a profile's modern bindings. `coreBindings` falls back to the device's defaults and `effectiveSlots` prefills the list from the device, so a profile that never carried a `modern` block lists its slots the first time it is opened.
- With no stored core, the core is the device's defaults. A gamepad with no control list resolves to an all-unbound core instead of borrowing the keyboard's, because an empty list means the pad is unknown.
- A profile written before section 19 still carries `slot:NORTH` ids and an assignment table keyed by them. `migrateScheme` keys both again together, in slot order, and throws instead of dropping anything it cannot read. It is idempotent.
- `effectiveSlots` is the same function the runtime lens resolves through (`lib/input/resolve-bindings.ts`), so this screen and the HUD cluster read one list.
- An absent assignment sits on a number the current list does not reach. It is kept, never deleted: a layout may still draw slot 7 for a scheme with five.
- `hasSlotSource` is true once there is anything to build a list from.
- A core rebind writes only the core. Slots no longer move with it: binding a gameplay verb onto a control a slot also reads leaves both rows on screen, so the clash is visible and removing the slot is one click.
- A slot rebind keeps the slot's number and moves only what fires it, and its picture follows the new control. A new slot has a number and no binding, which is what a free button looks like.

## ProfileHub/sub-components/controls-settings/useProfileActions.ts

Input profile loading, create, rename, delete, selection and persistence. Loading migrates to numbered slots, or logs a loud console error and leaves that profile out (see `migrate-profiles.ts`), never a silent half load. The profile cycle shortcut (PageUp and PageDown) is reflected into the UI and the settings.

## ProfileHub/sub-components/controls-settings/useSchemeLayout.ts

- The HUD layout this control scheme wears, and the list of layouts to choose from (shipped first, then the player's own). It lives on the input profile beside the slot list, not in a global HUD setting, because it is a property of the scheme: switching the active control profile from the keyboard to a pad swaps the slot list, the assignments and the HUD arrangement in one step.
- Two schemes may name the same layout. Editing it edits it for both, and "save a copy" in the editor is how one of them forks. The id is the only join, as the slot number is on the other half of the screen.
- A profile that names nothing reads as the shipped default, so nothing on disk needs migrating.
- The layout is written to the profile, so it travels with the control profile. The live HUD follows because the layout store subscribes to the resolved bindings. A profile with no modern block yet is left alone: the scheme is built in `build-modern-bindings`, and a layout without a slot list would be a scheme that draws nothing.

## ProfileHub/sub-components/controls/controls.constants.ts

- The ten core verbs fall in three groups because they answer three questions: where do I walk, what opens the two screens, and what drives the menu once one is open. The four menu verbs are live only while the pause menu is open, so they do not take a button out of circulation (contract section 11), and the same physical button can be both a menu verb and a gameplay slot in the Modern Controls tab.
- `SDL_TYPE_ICON` maps a specific SDL type to a more accurate icon than its family default.
- `CANCEL_ARM_DELAY_MS` and `LISTEN_ARM_DELAY_MS` keep the binding listener from capturing stale input right after it opens.

## ProfileHub/sub-components/controls/device-drag-data.ts

Sets the drag payload a device card uses to hand itself to the binding editor. `useDragDrop` reads the same keys back, and both take them from `controls-settings.constants.ts`, so DeviceCard and AdapterDeviceCard agree on the wire format.

## ProfileHub/sub-components/controls/AbsentAssignments.tsx

Lists assignments on a slot number the list does not reach. A number can outrun the list: remove slots until there are four and an assignment on slot seven has nowhere to sit. It is kept anyway, and adding three slots back reattaches it, because assignment and slot are joined by the number alone (contract section 19). They are shown, muted, not hidden: an assignment that exists but does nothing is the kind of state a settings screen should not keep secret.

## ProfileHub/sub-components/controls/BindingListHeader.tsx

The five-cell header the four binding lists share. Only the middle column differs (the console button on the classic list, the group on the core list, the assignment on the slot list), so it is the only label a caller passes, and it is omitted for lists whose middle cell stays empty.

## ProfileHub/sub-components/controls/BindingRow.tsx

One input mapping row (SNES buttons, shortcuts, cheats): action label, optional middle icon and label, binding icon and binding label. The whole row is clickable to start rebinding. The source controller icon shows only when the profile mixes more than one controller.

## ProfileHub/sub-components/controls/BindingListener.tsx

- A modal that captures the next key or gamepad button press through the InputManager's raw input events, so every source (keyboard, Web Gamepad API, SDL3 controllers) works the same everywhere. Escape cancels, Delete or Backspace clears the binding, and a bare modifier press waits for the real key.
- The one-shot `captured` guard is a synchronous local, not React state. A stick pushed slightly off-axis crosses two axes' thresholds in the same frame, and the dispatcher fires one event per crossing before React can apply the first capture. Without the flag the second event (often incidental drift on the other axis) overwrites the first, which is how a rebind could point at the wrong axis or two actions end up bound the same.

## ProfileHub/sub-components/controls/HapticsToggle.tsx

One switch for the profile's rumble: when on, every controller assigned to the profile receives it. It sits top right of the mapping heading row because it is a property of the profile's mapping, not of one device. State lives in `useHapticsToggle`.

## ProfileHub/sub-components/controls/SchemeBanner.tsx

Shown on the Controls screen while the profile is on the Classic scheme. There is no scheme control: the scheme follows the HUD style, and the Modern style turns it on. A control here would be a second switch for one fact that changed the HUD without saying so, so the banner says where the switch is and deep links there (`SETTINGS_TARGETS.hudStyle`, the same link the Cheats lock uses). Under Modern nothing is drawn.

## ProfileHub/sub-components/controls/ShortcutsTab.tsx

The app-level shortcut bindings, plus the one reserved key (Esc opens the menu and cannot be rebound).

## ProfileHub/sub-components/controls/CheatBindingsTab.tsx

The cheat bindings, scrimmed while the master cheats toggle is off, since they do nothing then. The overlay is `contained` because the bindings container clips overflow and the header sits flush above it, so the default overhang would bleed onto it or be clipped.

## ProfileHub/sub-components/controls/ControlsSidebar.tsx

The left column: the input profile list, which collapses to an icon strip for quick selection.

## ProfileHub/sub-components/controls/ControlsMain.tsx

The centre column: a banner where the scheme control used to be, plus the tabbed binding editor. The scheme is derived from the HUD style, so under Classic the screen says so once and links to where it is set, and under Modern it says nothing. The two binding tabs gate each other by scheme: the inactive one stays visible and greyed with its reason.

## ProfileHub/sub-components/controls/ControlsTabs.tsx

The tab strip, with disabled tabs. Greyed, not removed, is the agreed behaviour, because a tab that vanishes reads as the screen having lost something. The reason shows under the strip and on the tab's tooltip. The design system TabBar has no disabled state and belongs to another owner, so the strip is built from Button primitives.

## ProfileHub/sub-components/controls/CoreBindingsGroup.tsx

The ten core verbs, grouped and rebindable, shown in both binding tabs on purpose: the menu verbs drive the pause menu under either scheme, and movement, pause and map are what the modern scheme subtracts from the slot list. `icons` is not decoration: a row given no icon resolves one from the binding's shape alone, which on a pad is the same generic circle for every button. The device's real artwork comes from `useCoreIcons`.

## ProfileHub/sub-components/controls/SchemeLayoutRow.tsx

Which HUD arrangement this control scheme wears. It sits on the controls screen because the layout is a property of the scheme. Two schemes may name the same layout, and the picker allows it: editing a shared layout edits it for both, and "save a copy" forks one. It is disabled while the profile has no modern block, since there is no scheme to hang a layout on.

## ProfileHub/sub-components/controls/SlotRow.tsx

One numbered slot under the modern scheme. The row is named for its number because that is the slot's whole identity (contract section 19). The binding is shown as a glyph, never bare text, and an unbound slot draws none. What a slot fires is chosen in the pause menu, so the assignment cell is display only and the row click rebinds. A slot with its binding cleared still exists and keeps its number: an empty numbered slot is how a player sees a free button. Only the remove button takes one out. `assignmentLabel` uses neutral wording, since the item's own name belongs to the data layer and is shown by the pause menu.

## ProfileHub/sub-components/controls/GameControlsTab.tsx

The classic per-button mapping list. It carries the core verbs too, because the menu verbs drive the pause menu under the classic scheme as well.

## ProfileHub/sub-components/controls/ModernControlsTab.tsx

- The player's own slot list plus the core verbs. The list is built here, not derived: Add slot appends an empty numbered slot, and the minus on a row removes one and closes the gap. There is no cap and no category filter (contract section 19). An empty slot is a row on purpose: it has a number and draws in the HUD.
- The HUD layout sits at the foot of the list because it belongs to the scheme.
- The component name keeps "Modern", the name of the control scheme.

## ProfileHub/sub-components/controls/ControlsDevices.tsx

The right column: detected input devices, draggable or clickable to assign. Gamepads render from the SDL3 controller snapshot (ready or unavailable, adapter grouping), and the keyboard entry still comes from the InputManager's device list.

## ProfileHub/sub-components/controls/DeviceCard.tsx

A detected input device. The controller icon on the left is the status light and the assign button, the label and capabilities are on the right. An unavailable gamepad shows the same explain and remedy notice as the Input Calibration page and cannot be dragged or assigned: SDL3 never opened it.

## ProfileHub/sub-components/controls/AdapterDeviceCard.tsx

One card for a device that presents one entry per port (for example a 4-port wired adapter). Assigning applies to the adapter as a whole, since every port shares one vendor:product id, so the drag and click live on the card and the port rows are informational. Its stylesheet is `DeviceCard.css`, loaded by DeviceCard, which ControlsDevices imports first.

## ProfileHub/sub-components/controls/AssignedControllerCard.tsx

The controller assigned to the active profile: connection and activation status, controller info and an unassign button.

## ProfileHub/sub-components/controls/InputProfileList.tsx

The saved input profiles, with the active one highlighted, and create, delete, select and rename. A newly created profile opens straight into rename. Escape in the rename field is consumed there, so the dismiss stack leaves the page alone.

## ProfileHub/sub-components/RefreshRateControl/RefreshRateControl.tsx

- The target refresh rate picker, plus the display's state right now and a way to change it for good. Two routes to the same end are kept side by side on purpose: the fullscreen toggle above borrows the rate only while fullscreen and hands it back, while "Change refresh rate" sets it and leaves it. Players who dislike the blink on entering fullscreen want the second, players who want their desktop untouched want the first.
- `detectedHz` is the rate detected now, which may be finer grained than what the OS reports. `value` is the stored preference, where 0 means the highest multiple of 60 available.
- A stored rate the display no longer offers would leave nothing selected, so the highest is used, which is also what 0 resolves to.
- The detected value leads the readout: it comes from the shared store, which is read again after a switch, so it is the only one of the three guaranteed to match the display now. The host status behind it is fetched only when the preference changes and goes stale once the rate is changed from here.

## ProfileHub/sub-components/RefreshRateControl/sub-components/ChangeRefreshRateDialog.tsx

Confirms changing the display's refresh rate for good. It gets a dialog because it reaches outside the game and changes a system setting. The wording covers what a player needs before saying yes: it lasts, how to undo it, and that a temporary alternative exists.

## ProfileHub/sub-components/RefreshRateControl/behavior/useApplyRefreshRate.ts

Applies a refresh rate for good and reports the host's verdict, including any failure reason. Afterwards every readout of the display is stale (the panel's detected line, the title bar counter and its incompatible-rate tag), so it reads the rate again once the switch settles: a mode change is not instant, and measuring mid-switch would sample the old rate. When the host cannot be reached at all, the previous status stays showing.

## ProfileHub/sub-components/hub-search/HubSearchResults.tsx

The hub's search pane: every setting matching the query, from every tab, with its real control. Each tab draws its own rows in results mode (through SettingsPageContext), grouped under the tab's name with a way to open it.

## ProfileHub/sub-components/hub-search/match-tabs.ts

What a hub search matches, per tab: how many setting rows (by the same filter the settings pages use, so a count always equals the rows drawn), and the tabs whose own name matches even when no row does (Controls has no rows at all). `withRows` is in nav order.

## ProfileHub/sub-components/home-tab/home-tab.type.ts

- `randomizer` is frozen at profile creation, and its presence marks a randomized playthrough.
- `SummaryFact` is one label and value cell of the home summary, and `title` is the full value for the tooltip when the cell truncates.
- `SaveFileChecks` is the offline checks readout for one battery save file (labelled slot + 1). `name` is the player name stored in the file, null when blank.

## ProfileHub/sub-components/home-tab/home-tab.constants.ts

- `BOOT_WAIT_MS` is the ceiling on waiting out a boot. It is long because a first run extracts assets before the core starts.
- `SRAM_BYTES` is the cartridge's fixed SRAM size (`core/zelda3/src/zelda_rtl.c`, line 1345).
- `IMPORT_CONFIRM_WORD` is typed, not the filename, so importing is a deliberate action and not a memory test.
- `RUN_OF_MODE` is the run a profile mode reads its saves as. Vanilla Safe reads none.

## ProfileHub/sub-components/home-tab/ensure-game-running.ts

Resolves once the core can take a command, booting it first if nothing is on its way. `isGameRunning` is the caller's view flag: it says the game view has its asset blob, which happens about two seconds before the core exists. Trusting it let a load fire into a null module and be dropped, so the boot went ahead with no state loaded. The bridge's own state decides here, and the flag only answers whether a boot has been asked for, so a second one is not started.

## ProfileHub/sub-components/home-tab/capture-canvas-screenshot.ts

Captures the rendered game frame as a PNG buffer, the same path quick saves use.

## ProfileHub/sub-components/home-tab/fetch-quick-slots.ts

The Home tab's data fetchers (quick slots, normal saves, auto saves) each return null on error, so the caller keeps its previous state.

## ProfileHub/sub-components/home-tab/build-summary-facts.ts

The home hero's fact rows: the profile row (ROM, dates) and, for a randomized profile only, the run row (seed, connection, session status) in `build-randomizer-facts.ts`, with the per-save-file strips beside it. The mode is the hero's title, so it is not a fact. Checks progress is not a fact either: the live subscription is empty with no game running, so the per-save-file strips carry it from the save on disk.

## ProfileHub/sub-components/home-tab/compute-save-file-checks.ts

The per-save-file checks readout, computed offline from the profile's battery save on disk, with the same taken, available and left counts the Checks widget derives. One row per save file holding a valid game. A seed's saves are rated against its frozen placement and a plain game's against the placement where nothing moved (`normal-placement.ts`), so both go through the same availability snapshot. An online run has no placement on disk, so it shows nothing.

## ProfileHub/sub-components/home-tab/derive-profile-mode.ts

Which play mode a profile is in, for the home summary's badge. The randomizer config wins (it is frozen at creation and cannot be turned off), and the Vanilla Safe setting splits the rest into safe and plain vanilla.

## ProfileHub/sub-components/home-tab/useHomeTabSaves.ts

All Home tab save and session state, data loading and action handlers. The timer writes auto saves while the tab is open, so the hook follows it and the newest one is listed the moment it exists.

## ProfileHub/sub-components/home-tab/useHomeTabSramImport.ts

Picks, validates and imports a raw SRAM save into the profile's `sram.dat`.

## ProfileHub/sub-components/home-tab/useHomeTabToasts.ts

The Home tab's own toast queue, separate from ProfileHub's so the two features never share mutable state.

## ProfileHub/sub-components/home-tab/useHomeRandomizerStatus.ts

Live randomizer session status for the home summary. It is a pure subscription: the session store pushes status changes, so the hook adds no polling. Checks progress no longer comes from here, because the live completed-checks subscription is empty while no game runs and showed a false zero.

## ProfileHub/sub-components/home-tab/useHomeSaveFileChecks.ts

The per-save-file checks readout for the home hero, computed offline from the battery save on disk, so it never shows the live subscription's false zero. Off for Vanilla Safe. The file on disk is the last in-game save, so reading it mid-session is safe. It is computed again on mount (each time the hub opens), on a profile or mode change, and when a session starts or ends.

## ProfileHub/sub-components/home-tab/HomeTabColumns.tsx

The Home tab's two columns: quick saves and play sessions on the left, normal and auto saves on the right.

## ProfileHub/sub-components/home-tab/HomeTabDialogs.tsx

The create, overwrite, delete and SRAM import confirmation dialogs for the Home tab.

## ProfileHub stylesheets

- `ProfileHub.css`: the gap between the nav and the content leaves room for the nav's round toggle, which straddles its right edge. The `.settings-tab` rules are the generic settings tab layout used by the Audio, Gameplay and Controls tabs, and `.hub-game-controls` is the game controls group rendered in the window title bar.
- `BindingListener.css`: the backdrop opts back into pointer events, because the Portal layer is click-through.
- `SchemeBanner.css`: the banner keeps the box the old scheme notice used. One row, the text taking the slack and the button pinned to the end. It sits directly in the controls column above the tab strip, not as a container inside a container.
- `ControlsSettings.css`: collapsed columns show only the device icon strip (profiles) or the card icons (devices) and turn the column title vertical. On a short viewport (landscape phones) the bottom Required Inputs summary and the Button Mappings header are dropped to reclaim vertical space. The heading and the haptics toggle share one row, with the toggle at the far end.
- `dialog-hold-row.css`: the toggle and its speed slider each take half the row, and the slider never collapses.
- `HomeTab.css`: the hero sits flush with the top of the nav. The folder button sits in the info card row and matches the cards' height, not its own. The columns collapse to one when there is no room for two.
- `HubSearchResults.css`: the search pane uses the same card as a settings page, so switching between a tab and its search feels like one surface. With nothing typed the empty state fills the card, centred.
- `RefreshRateControl.css`: detection and the action share a row so the block stays short, and the warning wraps below.

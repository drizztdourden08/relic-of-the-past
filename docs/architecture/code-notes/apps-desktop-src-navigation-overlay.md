<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/navigation-overlay

Facts about `apps/desktop/src/navigation-overlay/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/navigation-overlay/

The navigation overlay draws the flood result over the game: reachable dots, the A* path preview, cliff and stair arrows, connections, ways on and off the screen, fall zones, pit stripes, annotations and the player debug boxes. Annotations draw last so locks, triggers and exits sit above the reachability art. The overlay and legend containers take no pointer events, so the overlay never eats a game click; each legend panel turns pointer events back on for its own collapse chevron. Each legend panel collapses on its own and remembers nothing. The chevron is large on purpose: at 9 pixels it vanished against the game art, and it is the only control on these panels.

Controls: hold the left button for a live A* path to the cursor, right click while holding to lock the target, release to clear the lock and the path, Shift and drag to copy a block of tiles to the clipboard. The copied block lists each tile as its hex attribute followed by `+` reachable, `~` traversal or `-` blocked.

## apps/desktop/src/navigation-overlay/annotation-style/

One row per annotation kind, exhaustive by type, so a kind without a visual is a compile error. Colours are semantic: amber for a lock or gate, green for a pickup or check, red clay for a trigger, grey for information. Room-wide facts (room tags such as the kill trigger) have no meaningful tile, so they are `panelOnly` and show in the panel. Ways on and off the screen are a separate renderer (`draw-entrances.ts`) and never use this table. The on-screen legend lists only the kinds present, since a full key would dwarf the game view; a kind switched off in the navigation widget shows struck through.

## apps/desktop/src/navigation-overlay/draw/draw-annotations.ts

One marker shape for every annotation, differing only by glyph and colour, so the overlay reads at 8 pixel tiles. Open or done markers draw dimmed; a blocked one is struck through so it shows on the canvas and not only in the widget list.

Door-table kinds (`DOOR_KINDS`) are 4 by 4 tile blocks, wide along the wall and shallow through it (north and south doors are wide in columns, east and west wide in rows). The cell lock is not one: it is a keyhole plate (room object 0x18) with no door-table record and a dummy direction (see `getRoomDoors`), so it keeps the 2 by 2 size. Records name the top left tile of a block, so markers are nudged in by `ANCHOR_NUDGE_TILES` along their narrow axis: both axes for a 2 by 2 block, only the through-wall axis for a door. The nudge was measured from screenshots of room 0x71 and the jail cell, not derived; re-check it if the marker size changes.

## apps/desktop/src/navigation-overlay/draw/draw-cliff-arrows.ts

Both ends of a cliff arrow sit on a tile centre. Pulling the tail back half a tile made a jump look like it began a tile early and skewed diagonals away from 45 degrees.

## apps/desktop/src/navigation-overlay/draw/draw-context.ts

Every draw function takes the same context. The view origin comes from `viewOrigin`, shared with every other overlay so they cannot drift apart: the camera, less the camera lock shift and the pixels the view adds on the left and on top. Indoors, the occupied room uses the live origin; any other room in the batch has no live position and falls back to `roomOrigin(screenIndex)` (see `room-entrances.ts`). Drawing other rooms at the primary room's origin once put them a full room width off.

## apps/desktop/src/navigation-overlay/draw/draw-dots.ts

The ring names the same layer the tooltip does. Outdoors is always the ground; a single-layer room takes the layer the flood started on. A dot ringed for both layers means the flood reached the tile on both; keying it off raw attribute content drew tiles that merely have geometry on the other layer as two-state dots.

A dot is judged by the attributes of the layer the tile is stood on. `attrGrid` is the upper layer, so testing it for a ground-only dot checks against the wall or ledge above and blanks every reachable tile beside a raised walkway. Do not collapse this back to a single `attrGrid` read: that regression has happened twice. Ledge traversal states (2 to 9) and stairs get arrows, not dots. Hookshot targets are ordinary dots; the tile tooltip reports hookshot use. The flood start is a black dot with a white outline.

## apps/desktop/src/navigation-overlay/draw/draw-pit-stripes.ts

Pit tiles (attribute 0x20) are striped only when they touch a reachable tile.

## apps/desktop/src/navigation-overlay/draw/draw-player-debug.ts

Draws Link's 16 pixel box and the tiles under it, and outlines the solid blocker sprites in red: tutorial guards (0x3F), barriers (0x40) and the uncle (0x73) while his `e` value is 0. The same sprites stop the flood (`packages/navigation/src/flood/blockers`).

## apps/desktop/src/navigation-overlay/pathfinding/

Link is a 2 by 2 tile body, so the path search works on 2 by 2 positions. Reach states: 0 unreachable, 1 reachable, 2 to 9 a ledge traversal in one direction (`TRAVERSAL_DIR_OFFSET`: south, north, east, west, then the four diagonals), 10 stairs (both ways). A body may only leave a ledge tile in the ledge's direction; stairs allow any direction. Goal finding uses the merged grid, so it can target either layer; routing is layer aware when dual-layer grids exist. On layer 0, stepping onto a ledge in its direction scans forward past the ledge tiles to the landing on layer 1, and the fall costs the tiles crossed. A stair tile on the merged grid lets the body swap layers in place. Link's position is read 8 pixels below `linkY`, at his feet.

## apps/desktop/src/navigation-overlay/tile-inspector-classification.ts

One hover's tooltip data: the room context and side tables are resolved once, then `classifyTile` runs per shown layer. Nothing here re-derives a fact `classifyTile` owns. `rawPalaceIndexX2` is the raw `cur_palace_index_x2` (0xFF means none), the shape `resolveRoomContext` expects. Dual mode falls back to a single column when either layer has no content of its own (attribute 0 and no reach). A staircase type of 2 means layer changes are blocked, so the tooltip locks to the start layer.

## apps/desktop/src/navigation-overlay/tile-inspector-tooltip/

`computeCanPass` answers whether the current loadout passes an obstacle: `lift.1` always, `lift.2` with the Power Glove, `lift.3` with the Titan's Mitt, `hammer` when inventory slot 11 holds the hammer, and boots or flippers when owned. The tooltip is placed clear of the path line and its requirement label, trying positions around the cursor first and the four corners last.

## apps/desktop/src/navigation-overlay/tooltip/

One tooltip layout for single, dual and locked modes: a header, one or two layer blocks, then the extra rows. The modes differ only in how many layer blocks render, and all five classification rows come from one `TileClassification`, each tagged with where its value came from (the grid, the attribute or a live side table). An unreached above-layer tile that is not a wall reads unsupported, not blocked: the tile is open, but nothing carries Link there. Outdoors the one surface is the ground, whatever number the walk's start layer has. Path requirements show only once a layer is reached. A collision row turns green or red only for an obstacle whose answer for the current loadout is known.

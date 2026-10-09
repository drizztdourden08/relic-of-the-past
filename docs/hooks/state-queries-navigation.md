<!-- @layer docs @kind doc -->
# State Queries for Navigation Tables

Static game tables exposed for the navigation/minimap system: entrance positions, fall-hole landings,
the exit-to-screen mapping, and overworld area heads. These read ROM/asset tables, not live RAM, so
they're stable across frames. All return `HEAPU8` pointers.

**Source:** `core/game-hooks/state_queries_tables.c` · **Bridge:** `packages/game-core/src/bridge/nav-tables/`

All multi-entry buffers start with a 2-byte little-endian count (`countLo, countHi`), then fixed-size entries.

---

## WasmGetOverworldEntrances

`int WasmGetOverworldEntrances(void)` returns the count plus up to 129 × 5 bytes:
`[areaLo, areaHi, posLo, posHi, id]`. Maps overworld entrance tiles to their entrance id.

## WasmGetFallHoles

`int WasmGetFallHoles(void)` returns the count plus up to 19 × 5 bytes:
`[areaLo, areaHi, posLo, posHi, entranceId]`. Where overworld pits/holes drop Link, and which entrance they resolve to.

## WasmGetExitScreenMap

`int WasmGetExitScreenMap(void)` returns the count plus up to 128 × 3 bytes: `[roomLo, roomHi, screenIndex]`.
Maps a dungeon room's exit to the overworld screen it lands on. Big (2×2) screens are resolved to the
sub-screen the exit's X/Y falls in, measured against the area head.

## WasmGetAreaHeads

`int WasmGetAreaHeads(void)` returns a pointer to a fixed 64-byte array. `g_area_heads[i]` is the head
(top-left) screen index of the area screen `i` belongs to; when `g_area_heads[i] == i` the screen is
its own head, and may be a big screen.

## WasmGetEntranceRooms

`int WasmGetEntranceRooms(void)` returns the count plus up to 133 × 2 bytes: `[roomLo, roomHi]`.
Maps each entrance id to its destination dungeon room.

## WasmGetEntranceSpawns

`int WasmGetEntranceSpawns(void)` returns the count plus up to 133 × 5 bytes:
`[playerXLo, playerXHi, playerYLo, playerYHi, startingBg]`. Link's spawn position and starting
background for each entrance.

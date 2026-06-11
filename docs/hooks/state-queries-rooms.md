<!-- @layer docs @kind doc -->
# State Queries — Rooms & Collision

Collision grids, room geometry, doors, stairs, and dungeon-map placement: the data the
[navigation engine](../architecture/navigation.md) consumes. All return `HEAPU8` pointers.

**Sources:** `state_queries.c`, `state_queries_grids.c`, `state_queries_rooms.c`, `state_queries_room_exits.c`
**Bridge:** `lib/game/bridge/room-grids.ts`, `room-layout.ts`, `room-doors.ts`

---

## Collision attributes

### WasmGetIndoorAttrTable
`int WasmGetIndoorAttrTable(void)` → pointer to `dung_bg2_attr_table` (8 KB). `0x0000–0x0FFF` =
upper-layer attrs, `0x1000–0x1FFF` = lower-layer attrs (64×64 tiles per layer).

### WasmGetLinkIsOnLowerLevel
`int WasmGetLinkIsOnLowerLevel(void)` → `1` if Link is on the lower layer, else `0`.

### WasmGetRoomCollisionType
`int WasmGetRoomCollisionType(void)` → current room's collision type (`dung_hdr_collision`), or
`-1` if outdoors.

### WasmGetRoomCollisionTypeForRoom
`int WasmGetRoomCollisionTypeForRoom(int room_id)` → collision type `(hdr[0] >> 2) & 7` read
straight from the ROM header for any room id (0–0x127); headless-safe. Returns `-1` if out of range.

### WasmBuildOverworldAttrGrid
`int WasmBuildOverworldAttrGrid(int screen_idx)` → builds a 64×64 collision-attr grid for an
overworld screen on demand and returns its pointer (row stride 64). Decodes Map16→Map8→attr and
propagates the deep-grass/water priority bit.

### WasmBuildRoomAttrGrid
`int WasmBuildRoomAttrGrid(int room_id)` → loads `room_id` into the dungeon tilemap, rebuilds the
collision attr table, restores the previous room, and returns the `dung_bg2_attr_table` pointer
(read 64×64, `+0x1000` for the lower layer). This is heavy: it runs the real room loader, so call it off the hot path.

### WasmGetToggleFloorPositions
`int WasmGetToggleFloorPositions(void)` → buffer populated during `WasmBuildRoomAttrGrid`:
`[count, pad]` then up to 16 × `[posLo, posHi, row, col]`.

## Room geometry

### WasmGetRoomLayoutInfo
`int WasmGetRoomLayoutInfo(void)` → 8-byte buffer (zeroed if outdoors):

| Off | Field | Off | Field |
|----:|-------|----:|-------|
| 0 | layout index 0–7 | 3 | Link quadrant X (0/1) |
| 1 | quadrant fullsize X (0=normal, 2=merged) | 4 | Link quadrant Y (0/2) |
| 2 | quadrant fullsize Y | 5–7 | pad |

### WasmGetDungeonMapPosition
`int WasmGetDungeonMapPosition(void)` → 12-byte buffer giving the room's footprint in the 5×5 dungeon
map grid (zeroed for caves/houses):

| Off | Field | Off | Field |
|----:|-------|----:|-------|
| 0 | map col | 5 | found (0/1) |
| 1 | map row | 6 | effective width (cells) |
| 2 | current floor | 7 | effective height (cells) |
| 3 | # above-ground floors | 8 | origin col (= map col) |
| 4 | # basement floors | 9 | origin row (= map row) |

### WasmGetRoomDoorBoundaryTiles
`int WasmGetRoomDoorBoundaryTiles(void)` → `[count, pad]` then up to 16 × 5 bytes:
`[direction, tileCol, tileRow, doorType, isOpen]`. direction 0=N 1=S 2=W 3=E. For N/S doors `tileCol`
is the leftmost of the 4-tile opening; for W/E, `tileRow` is the topmost.

## Exits, stairs & inter-room links

### WasmGetRoomExitDoors
`int WasmGetRoomExitDoors(void)` → `[count, pad]` then up to 8 × `[tileCol, tileRow, direction]`
(exit-to-overworld doors + entrance-type doors). Empty if outdoors.

### WasmGetRoomStairInfo
`int WasmGetRoomStairInfo(void)` → `[count, pad]` then up to 4 × `[destRoom, tileRow, tileCol, direction]`.
direction: `0`=up, `4`=down (attr bit 2). Found by scanning attr tiles `0x30–0x37` (low 2 bits = stair index).

### WasmGetRoomTravelDestinations
`int WasmGetRoomTravelDestinations(void)` → **5 bytes** from the room header:
`[0]`=pit/block destination, `[1..4]`=stair destinations for stair indices 0–3. Zeroed if outdoors.

### WasmGetStaircaseType
`int WasmGetStaircaseType(void)` → `kind_of_in_room_staircase`: `0`=intra-room stairs (layer change +
room shift), `1`=layer stairs, `2`=pseudo/water/none (layer changes are blocked). `-1` if outdoors.

### WasmGetRoomWalkBoundaries
`int WasmGetRoomWalkBoundaries(void)` → `[count, pad]` then up to 4 × `[destRoomLo, destRoomHi, tileRow, tileCol]`:
palace toggle-door passages where walking through switches rooms (e.g. Castle→Sewer). Destination is
inferred from the edge the toggle sits on.

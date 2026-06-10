<!-- @layer docs @kind doc -->
# State Queries — Sprites

Live sprite slots and the subset that physically gate navigation (Uncle indoors, guards outdoors).
The engine has **16 sprite slots** (`0–15`); these queries scan them. All return `HEAPU8` pointers,
each buffer prefixed with a 1-byte `count`.

**Sources:** `core/game-hooks/state_queries_sprites.c`, `core/game-hooks/state_queries_grids.c`
**Bridge:** `lib/game/bridge/sprites-blockers.ts`

---

### WasmGetLiveSprites
`int WasmGetLiveSprites(void)` → `[count]` then up to 16 × **10 bytes**:

| Off | Field | Off | Field |
|----:|-------|----:|-------|
| 0 | slot (0–15) | 5 | `sprite_E` |
| 1 | type | 6–7 | X (u16: xLo, xHi) |
| 2 | state | 8–9 | Y (u16: yLo, yHi) |
| 3 | subtype | | |
| 4 | subtype2 | | |

Only slots with non-zero `sprite_state` are included.

### WasmGetNavigationBlockers
`int WasmGetNavigationBlockers(void)` → `[count]` then up to 16 × `[xLo, xHi, yLo, yHi]`. The sprites
that block routes for flood-fill: **indoors**, Uncle (`type 0x73`, `sprite_E == 0`); **outdoors**, the
guard/barrier family (`0x3F, 0x40, 0x41, 0x45–0x4B`).

### WasmGetIndoorUncleBlockers
`int WasmGetIndoorUncleBlockers(void)` → `[count]` then up to 2 × `[xLo, xHi, yLo, yHi]` — just the
early-game Uncle blocker (indoors only). A narrower sibling of the query above.

### WasmGetOverworldGuardSpawns
`int WasmGetOverworldGuardSpawns(void)` → `[count]` then up to 16 × `[xLo, xHi, yLo, yHi]`. Unlike the
live queries, this reads **static spawn data** (`sprite_where_in_overworld`) so flood-fill sees guard
positions even when the sprites haven't proximity-loaded yet (tutorial guards `0x3F`/`0x40`). Empty if indoors.

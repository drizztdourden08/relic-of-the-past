<!-- @layer docs @kind doc -->
# State Queries — Inventory & Progress

Read-only snapshots of Link's items, vitals, dungeon progress, and the full UI state. Each returns a
pointer into `HEAPU8`; read the documented bytes immediately. See [Overview](overview.md) for the
buffer convention.

**Sources:** `core/game-hooks/state_queries.c`, `core/game-hooks/ui_state.c`
**Bridge:** `lib/game/bridge/progress.ts`, `lib/game/bridge/ui-state.ts`, `lib/game/tracker/bridge.ts`, `lib/game/tracker/flag-polling.ts`

---

### WasmGetInventoryState
`int WasmGetInventoryState(void)` → pointer to a 40-byte buffer (bytes 0–33 used).

| Off | Field | | Off | Field |
|----:|-------|-|----:|-------|
| 0–22 | item slots: bow, boomerang, hookshot, bombs, mushroom, fire rod, ice rod, bombos, ether, quake, torch, hammer, flute, bug net, book, cane of somaria, cane of byrna, cape, mirror, gloves, boots, flippers, moon pearl || 26–29 | bottle slots 0–3 (`link_bottle_info`) |
| 23 | sword type || 30 | pendants bitmask |
| 24 | shield type || 31 | crystals bitmask |
| 25 | armor || 32 | heart pieces |
| | || 33 | health capacity |

### WasmGetRoomFlags
`int WasmGetRoomFlags(void)` → pointer to `save_dung_info`, the saved dungeon room-flag bitset holding
per-room chest/enemy/event progress. Read as needed; it's the live SRAM array.

### WasmGetLiveRoomFlags
`int WasmGetLiveRoomFlags(void)` → 4-byte buffer for the room Link is currently in:

| Off | Field |
|----:|-------|
| 0–1 | current `dungeon_room_index` (u16) |
| 2–3 | live state bits = `dung_savegame_state_bits >> 4` (u16) |

### WasmGetOverworldFlags
`int WasmGetOverworldFlags(void)` → pointer to `save_ow_event_info` (bit-packed overworld event flags).

### WasmGetProgressFlags
`int WasmGetProgressFlags(void)` → 19-byte buffer (bytes 0–18 used). The three room words at
9–11 only fit their low byte there; bytes 16–18 carry the matching high byte, since a room
word's bits span all 16 bits:

| Off | Field | Off | Field |
|----:|-------|----:|-------|
| 0 | `sram_progress_indicator` | 10 | `save_dung_info[0x123]` low byte |
| 1 | `sram_progress_flags` | 11 | `save_dung_info[0x11E]` low byte |
| 2 | `sram_progress_indicator_3` | 12 | `player_sleep_in_bed_state` |
| 3 | flippers | 13 | `follower_indicator` |
| 4 | boots | 14 | `link_num_keys` |
| 5 | bug net | 15 | `link_bigkey` |
| 6 | mirror | 16 | `save_dung_info[0x109]` high byte |
| 7 | quake medallion | 17 | `save_dung_info[0x123]` high byte |
| 8 | magic consumption | 18 | `save_dung_info[0x11E]` high byte |
| 9 | `save_dung_info[0x109]` low byte | | |

### WasmGetViewportInfo
`int WasmGetViewportInfo(void)` → 20-byte buffer holding camera and Link world position plus module:

| Off | Field | Off | Field |
|----:|-------|----:|-------|
| 0 | `main_module_index` | 10 | locationModule (menu overlays resolve to the saved gameplay module) |
| 1 | `submodule_index` | 11 | locationType: 0=overworld/other, 1=house/cave, 2=dungeon |
| 2 | PPU `extraLeftRight` | 12–13 | camera X (BG2 scroll, world coords, u16) |
| 3 | PPU `extraLeftCur` | 14–15 | camera Y (u16) |
| 4 | PPU `extraRightCur` | 16–17 | Link X (u16) |
| 5 | PPU `extraBottomCur` | 18–19 | Link Y (u16) |
| 6–7 | viewport width (u16) | | |
| 8–9 | viewport height (u16, 224 or 240) | | |

### WasmGetGameUIState
`int WasmGetGameUIState(void)` → 256-byte buffer (bytes 0–124 used). This is the all-in-one frame
snapshot the React HUD overlay polls every `requestAnimationFrame`. Layout by byte range:

| Bytes | Group | Bytes | Group |
|------:|-------|------:|-------|
| 0–2 | game mode: main / sub / subsub module | 61–68 | text/dialogue (message idx u16, render state, countdown u16…) |
| 3–14 | HUD vitals: health, capacity, magic, rupees (u16 actual+goal), bombs, arrows, keys, cur item | 69–79 | map state: ow map state, dungmap floor/idx, palace idx, room idx, cur floor |
| 15–17 | extended slots: X / L / R items | 80–83 | floor timer, ability flags, saved menu module, progress indicator |
| 18–21 | animated fillers: hearts, magic, bomb, arrow | 84–107 | inventory order (24 bytes) |
| 22–41 | item slots (20 bytes) | 108 | overlay-mode echo |
| 42–45 | bottle contents 0–3 | 109–114 | location: ow screen idx (u16), indoors, dark world, area idx, heart pieces |
| 46–52 | equipment: sword, shield, armor, gloves, boots, flippers, moon pearl | 115–118 | player action state (for haptics): handler state, running, dash ctr, anim steps |
| 53–60 | dungeon progress: pendants, crystals, map/compass/bigkey (u16 each) | 119–124 | extended location: which entrance, lower level, Link X/Y (u16) |

> The exact per-byte assignment lives in `ui_state.c` (lines 18–155). Treat that file as the source of
> truth if you extend the parser in `lib/game/bridge/ui-bridge-parser.ts`.

### WasmGetUIOverlayMode / WasmSetUIOverlayMode
`int WasmGetUIOverlayMode(void)` · `void WasmSetUIOverlayMode(int mode)` — get/set an overlay
bitmask used to suppress native rendering when the React overlay takes over (echoed at UI-state
byte 108).

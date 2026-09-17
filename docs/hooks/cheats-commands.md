<!-- @layer docs @kind doc -->
# Cheats & Commands

Functions that change game state: pause/reset, the cheat menu, and the check/NPC triggers that
power the delivery queue and randomizer. Most are `void` and take effect on the next frame.

**Sources:** `core/game-hooks/cheats.c`, `core/game-hooks/cheat_inventory.c`, `core/game-hooks/cheat_capacity.c`, `core/game-hooks/check_triggers.c`, `core/wasm-build/emscripten_api.c`
**Bridge:** `lib/game/cheats.ts`, `lib/game/delivery-queue.ts`, `lib/game/bridge/commands.ts`

---

## Game commands (`emscripten_api.c` · `bridge/commands.ts`)

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmSetPaused` | `void(int paused)` | Pause (1) / resume (0). |
| `WasmGetPaused` | `int(void)` | Current pause state. |
| `WasmTogglePause` | `void(void)` | Flip pause. |
| `WasmReset` | `void(int warm)` | Wraps `ZeldaReset`. `warm=1` keeps SRAM, `0` is a cold reset. |
| `WasmCheat` | `void(int cmd)` | Runs a built-in `PatchCommand` byte (engine debug cheats). |
| `WasmSetHideSpaceBeyondWalls` | `void(int enable)` | Records the request; `hide_space_beyond_walls.c` hands the PPU the ceiling tiles on every frame that shows a house, a cave or the sanctuary, and they draw black. |

## Item cheats (`cheats.c` · `cheats.ts`)

| Function | Signature | Notes |
|----------|-----------|-------|
| `WasmCheatGiveItem` | `void(int item_id)` | Plays the standing receipt animation. `item_id` must be 0-75 (0x4B); higher ids corrupt `g_ram`. No-op outside gameplay modules (7/9). Does not mark a check done. |
| `WasmCheatSetHealth` | `void(int value)` | Clamped to `[0, capacity]`; cancels pending heal. |
| `WasmCheatSetMaxHealth` | `void(int value)` | Heart capacity, clamped `[8, 160]` (1-20 hearts; 8 units/heart). |
| `WasmCheatSetRupees` | `void(int value)` | Sets the rupee goal (the counter animates), clamped `[0, 999]`. |
| `WasmCheatSetBombs` | `void(int value)` | Clamped `[0, 99]`. |
| `WasmCheatSetArrows` | `void(int value)` | Clamped `[0, 99]`. |
| `WasmCheatSetMagic` | `void(int value)` | Magic meter, clamped `[0, 0x80]`; cancels a pending refill. The meter capacity is fixed, so there is no max-magic setter. |
| `WasmCheatRefillMagic` | `void(void)` | Magic to full (`0x80`), same as `WasmCheatSetMagic(0x80)`. |
| `WasmCheatSetMaxBombs` | `void(int capacity)` | Bomb capacity. Takes a wanted count and snaps to the nearest upgrade tier (10/15/20/25/30/35/40/50); trims the carried count to the new cap. |
| `WasmCheatSetMaxArrows` | `void(int capacity)` | Arrow capacity, same contract as `WasmCheatSetMaxBombs` (tiers 30/35/40/45/50/55/60/70). |
| `WasmCheatSetBottle` | `void(int slot, int contents)` | `slot` 0-3. contents: `0x00` no bottle, `0x02` empty, `0x03/04/05` red/green/blue potion, `0x06` fairy, `0x07` bee, `0x08` good bee. Keeps the bottle index pointing at a held bottle, and clears the pause slot when none is left. |
| `WasmCheatSetInventorySlot` | `void(int slot, int value)` | Writes one inventory byte: the remove and downgrade path. `slot` 0-19 is the pause menu save order (15 = bottle index), 20-26 gloves, boots, flippers, moon pearl, sword, shield, armor, 27-29 pendant bits, crystal bits, heart pieces. Redoes the gear palettes, the ability flags and the HUD item box the way a receipt would. |
| `WasmCheatSetSmallKeys` | `void(int count)` | The live small-key count, clamped `[0, 99]`. Refused outside a dungeon. |
| `WasmCheatSetDungeonItem` | `void(int kind, int palace_x2, int on)` | Toggles a dungeon's big key (1), map (2) or compass (3) bit. `palace_x2` is the doubled palace index. |
| `WasmCheatCapacityRungCap` | `int(int kind, int rung)` | The cap of a capacity rung in the current mode (kind 0 bombs, 1 arrows, 2 meter, 3 wallet), or `-1` when the ladder does not offer that rung. A vanilla file offers the native grid; a capacity profile offers its own ladder, empty rung included. The meter answers with a level code (0 none, 1 full, 2 half, 3 quarter). |
| `WasmCheatCapacityRung` | `int(int kind)` | The rung a family stands on. |
| `WasmCheatSetCapacityRung` | `void(int kind, int rung)` | Lands a family on a rung, clamped to the offered ladder, and trims what it holds to the new cap. A vanilla wallet has no rung to set. |
| `WasmCheatKillAllEnemies` | `void(void)` | Kills active/stunned hostile sprites; skips friendlies and fully-immune sprites. |
| `WasmCheatSetDamageMultiplier` | `void(int mult)` | Outgoing damage ×`mult`, clamped `[1, 255]`. Read back in `sprite.c` via `GameHook_GetDamageMultiplier`. |
| `WasmCheatSetExtraArmorPct` | `void(int pct)` | Extra incoming-damage reduction `[0, 100]%`, stacks with armor. Read via `GameHook_GetExtraArmorPct`. |
| `WasmCheatStartTrace` | `void(int frames)` | Logs an engine trace for N frames (console). `frames<1` → 60. |

## Delivery & checks (`cheats.c` + `check_triggers.c` · `delivery-queue.ts`)

| Function | Signature | Notes |
|----------|-----------|-------|
| `WasmCanReceiveItem` | `int(void)` | `1` only when safe to deliver: gameplay module (7/9), `submodule==0`, not immobilized, not mid-item-use. The delivery queue gates on this. |
| `WasmTriggerCheck` | `void(int room_id, int chest_index, int item_id)` | Marks a chest check done (sets the room state bit; updates SRAM for remote rooms), visually opens the chest if Link is in that room, then delivers the item. `chest_index` 0-5. |
| `WasmTriggerNpcCheck` | `void(int flag_type, int flag_mask, int item_id, int sprite_type_id, int post_gfx)` | Sets a progress flag (`flag_type` 0=`sram_progress_flags`, 1=`sram_progress_indicator`, 2=`sram_progress_indicator_3`), advances the matching NPC sprite to its post state, and delivers `item_id` (`0xFF` = none). Special-cases Uncle (`0x73`), magic-bat (`0x3A`), and others. |

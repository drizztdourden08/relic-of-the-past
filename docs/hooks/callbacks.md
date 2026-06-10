<!-- @layer docs @kind doc -->
# Callbacks (C→JS events)

The other direction: functions the **game core** calls at gameplay events. There are **14**
`GameHook_*` callbacks. Two of them surface to the renderer via `EM_ASM` → a `window.__on*` callback;
the rest are C→C (engine-internal accessors and the wrappers invoked by the `Wasm*` exports).

**Sources:** `haptic_events.c`, `game_hooks.c`, `check_triggers.c`, `item_overrides.c`, `cheats.c`

---

## JS-facing events (register `window.__on*`)

The renderer installs these globals; the core calls them when something happens.

### `window.__onItemReceived(itemId, method)`
Fired by `GameHook_NotifyItemReceived(item_id, method)` whenever Link receives an item (chest, NPC,
drop). `method` distinguishes receipt styles. Drives the inventory/checks trackers.

### `window.__onHapticEvent(type, param)`
Fired by the eight haptic hooks in `haptic_events.c`. `type` is the event enum below; `param` carries
intensity-ish data (damage, item id, swing type) or `0`. The renderer maps these to controller
rumble — see [Haptics](../user-guide/haptics.md). `type` **must** match `HapticEventType` in the JS
`haptics` module.

| `type` | Hook | `param` |
|------:|------|---------|
| 0 | `GameHook_NotifySwordSwing` | swing type |
| 1 | `GameHook_NotifySwordHitEnemy` | damage dealt |
| 2 | `GameHook_NotifySwordClink` | 0 |
| 3 | `GameHook_NotifyDamageTaken` | damage amount |
| 4 | `GameHook_NotifyItemUsed` | item id |
| 5 | `GameHook_NotifyEnvironmentalEvent` | event subtype (fall, landing, bomb, water, mirror, quake, boss…) |
| 6 | `GameHook_NotifyHookshotWall` | 0 |
| 7 | `GameHook_NotifyBoomerangCatch` | 0 |

## C→C callbacks (no JS event)

These are called from the vendored game code or from the `Wasm*` wrappers — useful to know when
tracing behavior, but you don't register anything for them.

| Callback | Called from | Purpose |
|----------|-------------|---------|
| `GameHook_OverrideChestItem(room, orig)` | chest-open in `player.c` | Returns the randomizer replacement item (see [Item Overrides](item-overrides.md)). |
| `GameHook_GetDamageMultiplier()` | `sprite.c` damage calc | Returns the cheat outgoing-damage multiplier. |
| `GameHook_GetExtraArmorPct()` | `player.c` damage reduction | Returns the cheat extra-armor %. |
| `GameHook_TriggerCheck(room, chest, item)` | `WasmTriggerCheck` wrapper | Marks a chest check + delivers the item. |
| `GameHook_TriggerNpcCheck(...)` | `WasmTriggerNpcCheck` wrapper | Sets a progress flag, advances the NPC, delivers the item. |

## Adding a new event

A new C→JS event mirrors an export's 2-place rule but in reverse: add the `GameHook_*` function
(declared in `game_hooks.h`), `EM_ASM` a `window.__on*` call, insert the call-site in the vendored
core at the right gameplay event, and register the handler in the renderer. See the `add-wasm-function`
skill and [Adding a WASM Function](../contributing/adding-a-wasm-function.md).

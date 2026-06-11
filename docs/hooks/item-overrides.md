<!-- @layer docs @kind doc -->
# Item Overrides

The randomizer primitive: replace the item a given chest yields. JS registers `(room, originalItem)
→ newItem` mappings; the game core consults the table when a chest opens.

**Source:** `core/game-hooks/item_overrides.c` · **Bridge:** `lib/game/randomizer.ts`

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmSetItemOverride` | `void(int room_id, int original_item, int new_item)` | Add or update an override. Matches on `(room_id, original_item)`; updates `new_item` if the pair already exists. Table holds up to 256 entries. |
| `WasmClearItemOverrides` | `void(void)` | Empty the override table. |

## How it's applied (C → C, no JS event)

When a chest opens, the vendored game code calls the callback `GameHook_OverrideChestItem(room_id,
original_item)`. It scans the override table and returns the replacement item id, or the original if
none matches. This is a pure C→C hook; see [Callbacks](callbacks.md) for the full callback surface.

```mermaid
flowchart TD
    JS["JS: WasmSetItemOverride(room, orig, new)"] --> T["g_overrides[] table"]
    CHEST["chest opens in core"] --> HOOK["GameHook_OverrideChestItem(room, orig)"]
    HOOK -->|"looks up"| T
    HOOK --> RET["returns new (or orig)"]
```

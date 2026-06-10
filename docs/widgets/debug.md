<!-- @layer docs @kind doc -->
# Debug Widget

A live read-out of the game's internal state — useful for troubleshooting and for understanding what
the engine is doing frame to frame.

## Shows

- **Mode** — main/sub/subsub module (where the game is in its state machine).
- **HUD vitals** — health, magic, rupees, bombs, arrows, keys.
- **Inventory & equipment** — current item slots, sword/shield/armor, abilities.
- **Dungeon progress** — pendants, crystals, maps, compasses, big keys.
- **Text / map state** — dialogue render state, overworld/dungeon map state.
- Toggle buttons for the **Enhanced HUD** parts (main HUD, pause menu).

## Data source

Reflects the full per-frame snapshot from `WasmGetGameUIState` (parsed in
`lib/game/bridge/ui-bridge-parser.ts`, held in `stores/game-ui-store.ts`). The byte layout is
documented under [Inventory & Progress hooks → WasmGetGameUIState](../hooks/state-queries-inventory.md).

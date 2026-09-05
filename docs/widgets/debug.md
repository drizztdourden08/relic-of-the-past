<!-- @layer docs @kind doc -->
# Debug Widget

A live read-out of the game's internal state. It's useful for troubleshooting and for seeing what the
engine is doing frame to frame.

## Shows

- **Mode:** the main, sub, and subsub module, so you can see where the game sits in its state machine.
- **HUD vitals:** health, magic, rupees, bombs, arrows, and keys.
- **Inventory and equipment:** current item slots, sword, shield, armor, and abilities.
- **Dungeon progress:** pendants, crystals, maps, compasses, and big keys.
- **Text and map state:** dialogue render state and the overworld/dungeon map state.
- Toggle buttons for the Enhanced HUD parts, namely the main HUD and pause menu.

## Data source

This reflects the full per-frame snapshot from `WasmGetGameUIState`, parsed in
`lib/game/bridge/ui-bridge-parser.ts` and held in `stores/game-ui-store.ts`. The byte layout is
documented under [Inventory & Progress hooks → WasmGetGameUIState](../hooks/state-queries-inventory.md).

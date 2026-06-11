<!-- @layer docs @kind doc -->
# Inventory Widget

A live grid of the items Link currently owns. Items show up as you collect them.

- View modes let you pick between different grid sizes and groupings.
- Sprites are pulled straight from your ROM, so they match the game ([Sprite Tools](../user-guide/sprite-tools.md)).
- It's handy for tracking completion and planning routes.

## Data source

The widget polls the live inventory each frame through the tracker bridge (`WasmGetInventoryState` and
`WasmGetGameUIState`); see the [Inventory & Progress hooks](../hooks/state-queries-inventory.md). State
lives in `stores/game-ui-store.ts`.

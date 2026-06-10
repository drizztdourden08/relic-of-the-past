<!-- @layer docs @kind doc -->
# Inventory Widget

A live visual grid of the items Link currently owns. Items appear as they're collected.

- **View modes** — selectable layouts (grid sizes / groupings).
- **Accurate sprites** — uses sprites extracted from your ROM ([Sprite Tools](../user-guide/sprite-tools.md)).
- Useful for tracking completion and planning routes.

## Data source

Polls the live inventory each frame via the tracker bridge (`WasmGetInventoryState` /
`WasmGetGameUIState`) — see [Inventory & Progress hooks](../hooks/state-queries-inventory.md). State is
held in `stores/game-ui-store.ts`.

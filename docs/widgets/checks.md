<!-- @layer docs @kind doc -->
# Checks Widget

Tracks every collectible **check** (item location) in the game — the foundation for randomizer
support. It records *which locations have been checked*, independent of what was found there.

## Features

- **Status** — done / available / blocked, per location.
- **Grouping** — by location, dungeon, area, or type.
- **Filtering** — by status, by tag (multi-select), or by a specific item.
- **Search** — fuzzy name search.
- **View modes** — list / compact / grid, with a summary (total, completed, available, blocked).

## Data source

Completed checks are derived from the live progress/room flags through the tracker bridge
(`WasmGetRoomFlags`, `WasmGetProgressFlags`, `WasmGetLiveRoomFlags`, `WasmGetOverworldFlags`) — see the
[Inventory & Progress hooks](../hooks/state-queries-inventory.md). The check list and tracker layout
persist per profile.

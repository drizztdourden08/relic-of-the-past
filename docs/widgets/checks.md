<!-- @layer docs @kind doc -->
# Checks Widget

Tracks every collectible check, meaning every item location in the game. This is the foundation for
randomizer support. It records which locations you've checked, regardless of what was found there.

## Features

- Per-location status: done, available, or blocked.
- Grouping by location, dungeon, area, or type.
- Filtering by status, by tag (you can select several), or by a specific item.
- Fuzzy name search.
- List, compact, and grid view modes, with a summary of the totals: completed, available, and blocked.

## Data source

Completed checks are derived from the live progress and room flags through the tracker bridge
(`WasmGetRoomFlags`, `WasmGetProgressFlags`, `WasmGetLiveRoomFlags`, `WasmGetOverworldFlags`); see the
[Inventory & Progress hooks](../hooks/state-queries-inventory.md). The check list and tracker layout
are saved per profile.

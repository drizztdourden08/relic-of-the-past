<!-- @layer docs @kind doc -->
# Navigation & Minimap

A pathfinding and minimap system that shows where Link can reach from where he's standing and how
screens and rooms connect. You get to it through the Navigation widget and an on-canvas overlay.

> This is an active, in-progress area. For how it's built, see
> [Architecture → Navigation](../architecture/navigation.md).

## The overlay

Toggle the navigation overlay and it draws several things on top of the game:

- Reachability, a flood fill from Link's tile that marks every reachable tile and what's blocked.
- Connections, drawn as arrows and lines to adjacent screens, plus internal links like stairs, falls, and layer changes.
- Entrances and respawn points, shown as door and entrance markers sorted by type.
- Fall zones, marking where pits drop Link and where he lands.
- Link debug, with position, layer, and collision info. Hover a tile for a tooltip.

## The Navigation widget

A floating panel ([widgets overview](../widgets/overview.md)) with:

- Overworld and indoor minimaps, with connections drawn in.
- Flood controls to run the flood fill on demand or have it follow Link as he moves.
- Connection, entrance, and staircase info for the current screen, plus Link's state.
- Connection and screen editors for development, used to author or correct screen connections and room properties.
- Dataset status, showing coverage metrics like screens covered and entrances mapped, along with validation and export.

## Data behind it

The overlay and widget pull collision grids, doors, stairs, and navigation tables from the game core
through the bridge. See the [room/collision](../hooks/state-queries-rooms.md),
[navigation table](../hooks/state-queries-navigation.md), and [sprite](../hooks/state-queries-sprites.md)
hooks. Offline analysis runs headlessly via `--dump-nav` (see [Developer Tools](developer-tools.md)).

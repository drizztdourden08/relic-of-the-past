<!-- @layer docs @kind doc -->
# Navigation & Minimap

A pathfinding/minimap system that shows where Link can reach from his current position and how screens
and rooms connect. It's exposed through the **Navigation widget** and an on-canvas overlay.

> This is an active, in-progress area. For how it's built, see
> [Architecture → Navigation](../architecture/navigation.md).

## The overlay

Toggle the navigation overlay to draw, on top of the game:

- **Reachability** — a flood fill from Link's tile marking every reachable tile (and what's blocked).
- **Connections** — arrows/lines to adjacent screens, plus internal links (stairs, falls, layer changes).
- **Entrances & respawn points** — door/entrance markers, classified by type.
- **Fall zones** — where pits drop Link and where he lands.
- **Link debug** — position, layer, and collision info; hover a tile for a tooltip.

## The Navigation widget

A floating panel ([widgets overview](../widgets/overview.md)) with:

- **Minimaps** — overworld and indoor minimaps with connections drawn in.
- **Flood controls** — run the flood fill on demand or auto-run as Link moves.
- **Connections / entrance / staircase info** — the current screen's links and Link's state.
- **Connection & screen editors** (dev) — author/correct screen connections and room properties.
- **Dataset status** — coverage metrics (screens covered, entrances mapped) and validation/export.

## Data behind it

The overlay/widget pull collision grids, doors, stairs, and navigation tables from the game core
through the bridge — see the [room/collision](../hooks/state-queries-rooms.md),
[navigation table](../hooks/state-queries-navigation.md), and [sprite](../hooks/state-queries-sprites.md)
hooks. Offline analysis runs headlessly via `--dump-nav` (see [Developer Tools](developer-tools.md)).

<!-- @layer docs @kind doc -->
# Widgets Overview

Widgets are overlay panels that show information and tools while you play. Open them from the title
bar or Menu → **Widgets**, and you can have several open at once.

## Layout

- Dock a widget to any screen edge, or let it float freely.
- Drag the edges to resize, and adjust opacity to see the game underneath.
- The `WidgetManager` remembers each widget's position, size, dock state, and opacity between sessions.

## The widgets

| Widget | Purpose |
|--------|---------|
| [Inventory](inventory.md) | Live grid of the items Link currently owns. |
| [Checks](checks.md) | Tracker for every collectible check, with status, grouping, filtering, and search. |
| [Cheats](cheats.md) | Give items and edit stats/combat/bottles in real time. |
| [Navigation](navigation.md) | Minimaps, flood-fill pathfinding, connection/screen editors, dataset status. |
| [Debug](debug.md) | Live read-out of game state (mode, HUD, inventory, dungeon progress, and so on). |
| [Logs](logs.md) | Real-time app/game/input log viewer. |

> Widget data comes from the running game through the bridge ([game hooks](../hooks/overview.md)) and
> the Zustand stores in `apps/web/src/stores/`.

<!-- @layer docs @kind doc -->
# Widgets — Overview

Widgets are overlay panels that provide information and tools while you play. Open them from the title
bar or Menu → **Widgets**; multiple can be open at once.

## Layout

- **Dock** to any screen edge, or **float** freely.
- **Resize** by dragging edges; adjust **opacity** to see the game underneath.
- Layout (position, size, dock state, opacity) is **saved and restored** between sessions, managed by
  the `WidgetManager`.

## The widgets

| Widget | Purpose |
|--------|---------|
| [Inventory](inventory.md) | Live grid of the items Link currently owns. |
| [Checks](checks.md) | Tracker for every collectible check — status, grouping, filtering, search. |
| [Cheats](cheats.md) | Give items and edit stats/combat/bottles in real time. |
| [Navigation](navigation.md) | Minimaps, flood-fill pathfinding, connection/screen editors, dataset status. |
| [Debug](debug.md) | Live read-out of game state (mode, HUD, inventory, dungeon progress…). |
| [Logs](logs.md) | Real-time app/game/input log viewer. |

> Widget data comes from the running game through the bridge ([game hooks](../hooks/overview.md)) and
> the Zustand stores in `apps/desktop/src/stores/`.

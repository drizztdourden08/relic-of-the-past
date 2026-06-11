<!-- @layer docs @kind doc -->
# Navigation Widget

> [!WARNING]
> **Heavy development — not meant for normal play.** This widget is tooling for **randomizer development**: mapping screens, connections, and pathfinding data. It isn't built for in-game use and changes often.

The control surface for the [navigation/minimap system](../user-guide/navigation-minimap.md): minimaps,
pathfinding, and (dev) editors.

## Panels

- **Minimaps** — overworld and indoor minimaps with screen connections drawn in.
- **Flood controls** — run the reachability flood fill on demand, or auto-run as Link moves; toggle the
  on-canvas overlay.
- **Link / game state** — current position, layer, collision info, and the screen's connections,
  entrances, and staircases.
- **Connection editor** & **screen editor** (dev) — author/correct screen-to-screen connections and
  room properties; saved via the Electron `connections` / `screen-editor` domains.
- **Dataset status** — coverage metrics (screens covered, entrances mapped) plus validation and
  export/import.

## Behind it

Pulls collision grids, doors, stairs, and navigation tables from the core through the bridge (see the
[rooms](../hooks/state-queries-rooms.md), [navigation tables](../hooks/state-queries-navigation.md), and
[sprites](../hooks/state-queries-sprites.md) hooks). Pure logic lives in `shared/game/navigation/` —
[Architecture → Navigation](../architecture/navigation.md). Overlay state:
`stores/navigation-overlay-store.ts`.

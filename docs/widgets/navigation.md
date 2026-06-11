<!-- @layer docs @kind doc -->
# Navigation Widget

> [!WARNING]
> **Heavy development — not meant for normal play.** This widget is tooling for **randomizer development**: mapping screens, connections, and pathfinding data. It isn't built for in-game use and changes often.

The control surface for the [navigation/minimap system](../user-guide/navigation-minimap.md). It covers
minimaps, pathfinding, and the dev editors.

## Panels

- **Minimaps** — overworld and indoor minimaps with screen connections drawn in.
- **Flood controls** — run the reachability flood fill on demand or auto-run it as Link moves, and
  toggle the on-canvas overlay.
- **Link / game state** — current position, layer, and collision info, plus the screen's connections,
  entrances, and staircases.
- **Connection editor** and **screen editor** — the dev tools for authoring and correcting
  screen-to-screen connections and room properties. These save through the Electron `connections` and
  `screen-editor` domains.
- **Dataset status** — coverage metrics like screens covered and entrances mapped, alongside validation
  and export/import.

## Behind it

The widget pulls collision grids, doors, stairs, and navigation tables from the core through the bridge.
See the [rooms](../hooks/state-queries-rooms.md), [navigation tables](../hooks/state-queries-navigation.md),
and [sprites](../hooks/state-queries-sprites.md) hooks. The pure logic lives in `shared/game/navigation/`
([Architecture → Navigation](../architecture/navigation.md)), and overlay state is in
`stores/navigation-overlay-store.ts`.

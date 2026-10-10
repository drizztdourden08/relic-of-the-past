<!-- @layer docs @kind doc -->
# Navigation Architecture

The pathfinding/minimap system computes where the player character can reach and how screens and rooms
connect. The pure logic lives in the `@rotp/navigation` package (`packages/navigation/src/`); it has no
React or Node and runs in a plain test process. The renderer draws the overlay, and the
[game hooks](../hooks/state-queries-rooms.md) feed it collision data.

> User-facing behavior: [Navigation & Minimap](../user-guide/navigation-minimap.md).

## Data sources

Collision grids and room geometry come from the WASM core on demand:

- `WasmBuildOverworldAttrGrid(screen)` / `WasmBuildRoomAttrGrid(room)` return 64×64 attr grids.
- `WasmGetRoomDoorBoundaryTiles`, `...StairInfo`, `...ExitDoors`, `...WalkBoundaries`, `...TravelDestinations`.
- Navigation tables (`WasmGetOverworldEntrances`, `...FallHoles`, `...ExitScreenMap`, `...AreaHeads`,
  `...EntranceRooms`, `...EntranceSpawns`): static, fetched once.
- Sprite blockers (`WasmGetNavigationBlockers`, `...OverworldGuardSpawns`).

## The flood facade

`packages/navigation/src/flood/` is the facade that pulls those queries through the bridge.
It is the single source for grids (`screen-grids.ts`), flood options (`flood-options.ts`), the indoor
entrance list (`room-entrances/`), screen origins (`world-origin/`) and the screen annotations the
overlay draws (`annotate-screen.ts`). All three consumers (the navigation widget, the simulator and the
`--dump-nav` dumper) go through it, which is why they report the same reachability for a given screen.

## Modules (`packages/navigation/src/pathfinding/`)

| Path | Role |
|------|------|
| `tile-attrs/` · `tile-classification/` · `overworld-attrs.ts` | Turn raw attr bytes into walkable/blocked/special tile classes. |
| `core/` | The generic traversal primitives: `bfs-engine`, `priority-queue`, the grid helpers, `inventory`. |
| `flood-fill/` | Reachability: single-screen, single/dual-layer, path extraction, entrance usability. |
| `strategies/` | Layer strategies (single vs dual-layer dungeon rooms). |
| `screen-data/` | Collision-grid assembly + cliff preprocessing. |
| `screen-bundles.ts` · `connection-names.ts` | Group multi-screen areas; name connections. |
| `analysis/` | Offline analysis: `global-flood`, `entrance-resolver`, `requirement-detector`, `connection-updater`, `screen-updater`. |

## Screen annotations

`ScreenAnnotations` (`packages/navigation/src/simulation/annotations.type.ts`) is the one description
of what is on a screen and what state it is in: a list of `{ kind, tile, label, state, detail, requires }`
items, the check tallies for the minimap badge, and the decoded room tags.

`packages/navigation/src/flood/annotate-screen.ts` derives it from the **same reads the simulator gates
its targets on**: locks and gates, sprites with their key-carrier markers, chests (named after what
they will yield) and room tags. Each family maps through `annotate/`. The flood runs first
and decides which items the player can touch, so the overlay, both minimaps and the widget's "On this
screen" panel cannot disagree with the run.

Ways on and off a screen are **not** annotations. Entrances, doors, stairs, holes, teleports and
walkable screen edges come from `packages/navigation/src/crossings/`, which resolves each one's
destination, tile and availability in one place; they draw through their own icon renderer and list in
the widget's Connections panel.

The annotation kinds are exhaustive by type: `annotation-style/` must register a style, glyph and
legend for every kind in the union, an unmapped kind still draws as a neutral marker, and
`apps/desktop/tests/simulation/annotation-coverage.keep.test.ts` makes a gap a test failure. A new mechanic cannot
ship invisible.

## Renderer side

| Path | Role |
|------|------|
| `apps/desktop/src/views/GameLayer/sub-components/navigation-overlay/` | Canvas overlay: draws reachability, connections, entrances, fall zones, path, player debug; tile inspector tooltips; `annotation-style/`; `pathfinding/` (A* 2×2, layer helpers). |
| `apps/desktop/src/widgets/navigation.widget.tsx` · `apps/desktop/src/nav-widget/` | The [Navigation widget](../user-guide/navigation-minimap.md): minimaps, flood controls, connection/screen editors, the Dataset status panel. |
| `apps/desktop/src/stores/navigation-overlay-store/` | Overlay visibility, flood results, connections, locked target tile, screen annotations, per-kind marker visibility. |

## Offline tooling

The `--dump-nav=<slot|name>` flag exports navigation data for a save state to
`debug-output/dump-nav.json`, so the analysis can run headless. The dump includes the flood, the
connections and the screen annotations with their reachability. See
[Developer Tools](../user-guide/developer-tools.md).

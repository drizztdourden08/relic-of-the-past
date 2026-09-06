<!-- @layer docs @kind doc -->
# Navigation Architecture

The pathfinding/minimap system computes where the player character can reach and how screens and rooms
connect. The pure logic lives in `shared/game/navigation/`; it has no React or Node and runs in a plain
test process. The renderer draws the overlay, and the [game hooks](../hooks/state-queries-rooms.md) feed
it collision data.

> User-facing behavior: [Navigation & Minimap](../user-guide/navigation-minimap.md).

## Data sources

Collision grids and room geometry come from the WASM core on demand:

- `WasmBuildOverworldAttrGrid(screen)` / `WasmBuildRoomAttrGrid(room)` → 64×64 attr grids.
- `WasmGetRoomDoorBoundaryTiles`, `...StairInfo`, `...ExitDoors`, `...WalkBoundaries`, `...TravelDestinations`.
- Navigation tables (`WasmGetOverworldEntrances`, `...FallHoles`, `...ExitScreenMap`, `...AreaHeads`,
  `...EntranceRooms`, `...EntranceSpawns`): static, fetched once.
- Sprite blockers (`WasmGetNavigationBlockers`, `...OverworldGuardSpawns`).

## The flood facade

`apps/web/src/lib/game/flood/` is the renderer-side facade that pulls those queries through the bridge.
It is the single source for grids (`screen-grids.ts`), flood options (`flood-options.ts`), the indoor
entrance list (`room-entrances.ts`), screen origins (`world-origin.ts`) and the screen annotations the
overlay draws (`annotate-screen.ts`). All three consumers (the navigation widget, the simulator and the
`--dump-nav` dumper) go through it, which is why they report the same reachability for a given screen.

## Modules (`shared/game/navigation/`)

| Path | Role |
|------|------|
| `tile-attrs.ts` · `tile-classification/` · `interior-attrs.ts` · `overworld-attrs.ts` | Turn raw attr bytes into walkable/blocked/special tile classes. |
| `core/` | The generic traversal primitives: `bfs-engine`, `priority-queue`, `grid-utils`, `inventory`. |
| `flood-fill/` | Reachability: single-screen, single/dual-layer, path extraction, entrance usability. |
| `strategies/` | Layer strategies (single vs dual-layer dungeon rooms). |
| `screen-data/` | Collision-grid assembly + cliff preprocessing. |
| `screen-bundles.ts` · `connection-names.ts` | Group multi-screen areas; name connections. |
| `analysis/` | Offline analysis: `global-flood`, `entrance-resolver`, `requirement-detector`, `connection-updater`, `screen-updater`. |
| `hub-navigation.ts` | High-level routing between known hubs. |

## Screen annotations

`ScreenAnnotations` (`shared/game/simulation/annotations.ts`) is the one description of what is on a
screen and what state it is in: a list of `{ kind, tile, label, state, detail, requires, target }`
items, the check tallies for the minimap badge, and the decoded room tags.

`apps/web/src/lib/game/flood/annotate-screen.ts` derives it from the **same reads the simulator gates
its targets on**: doors and cell locks, sprites with their key-carrier markers, chests (named after
what they will actually yield), room tags and detected exits. Each family maps through `annotate/`.
The flood runs first and decides which items are actually touchable, so the overlay, both minimaps and
the widget's "On this screen" panel cannot disagree with the run.

The annotation kinds are exhaustive by type: `annotation-style.ts` must register a style, glyph and
legend for every kind in the union, an unmapped kind still draws as a neutral marker, and
`tests/simulation/annotation-coverage.keep.test.ts` makes a gap a test failure. A new mechanic cannot
ship invisible.

## Renderer side

| Path | Role |
|------|------|
| `ui/.../GameLayer/sub-components/navigation-overlay/` | Canvas overlay: draws reachability, connections, entrances, fall zones, path, player debug; tile inspector tooltips; `pathfinding/` (A* 2×2, layer helpers). |
| `ui/domains/widgets/navigation/` | The [Navigation widget](../user-guide/navigation-minimap.md): minimaps, flood controls, connection/screen editors, the Dataset status panel. |
| `stores/navigation-overlay-store.ts` | Overlay visibility, flood results, connections, locked target tile, screen annotations, per-kind marker visibility. |

## Offline tooling

The `--dump-nav=<slot|name>` flag exports navigation data for a save state to
`debug-output/dump-nav.json`, so the analysis can run headless. The dump includes the flood, the
connections and the screen annotations with their reachability. See
[Developer Tools](../user-guide/developer-tools.md).

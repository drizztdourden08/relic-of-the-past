<!-- @layer docs @kind doc -->
# Navigation Architecture

The pathfinding/minimap system computes where Link can reach and how screens and rooms connect. The pure
logic lives in `shared/game/navigation/`; it has no React or Node and runs in a plain test process. The
renderer draws the overlay, and the [game hooks](../hooks/state-queries-rooms.md) feed it collision data.

> This is an active area of work. Design notes live in `shared/game/navigation/plan/PLAN.md` and
> `REFACTOR-PLAN.md`. User-facing behavior: [Navigation & Minimap](../user-guide/navigation-minimap.md).

## Data sources

Collision grids and room geometry come from the WASM core on demand:

- `WasmBuildOverworldAttrGrid(screen)` / `WasmBuildRoomAttrGrid(room)` → 64×64 attr grids.
- `WasmGetRoomDoorBoundaryTiles`, `…StairInfo`, `…ExitDoors`, `…WalkBoundaries`, `…TravelDestinations`.
- Navigation tables (`WasmGetOverworldEntrances`, `…FallHoles`, `…ExitScreenMap`, `…AreaHeads`,
  `…EntranceRooms`, `…EntranceSpawns`) — static, fetched once.
- Sprite blockers (`WasmGetNavigationBlockers`, `…OverworldGuardSpawns`).

`lib/game/flood/` is the renderer-side facade that pulls these through the bridge. It is the single
source for grids (`screen-grids.ts`), flood options (`flood-options.ts`), the indoor entrance list
(`room-entrances.ts`), screen origins (`world-origin.ts`) and the screen annotations the overlay draws
(`annotate-screen.ts`). Everything that floods — the navigation widget, the simulator and the
`--dump-nav` dumper — goes through it, so all three report the same reachability for a given screen.

## Modules (`shared/game/navigation/`)

| Path | Role |
|------|------|
| `tile-attrs.ts` · `tile-classification.ts` · `interior-attrs.ts` · `overworld-attrs.ts` | Turn raw attr bytes into walkable/blocked/special tile classes. |
| `core/` | `bfs-engine`, `priority-queue`, `grid-utils`, `inventory` — the generic traversal primitives. |
| `flood-fill/` | Reachability: single-screen, single/dual-layer, path extraction, entrance usability. |
| `strategies/` | Layer strategies (single vs dual-layer dungeon rooms). |
| `screen-data/` | Collision-grid assembly + cliff preprocessing. |
| `screen-bundles.ts` · `connection-names.ts` | Group multi-screen areas; name connections. |
| `analysis/` | Offline analysis: `global-flood`, `entrance-resolver`, `requirement-detector`, `connection-updater`, `screen-updater`. |
| `hub-navigation.ts` | High-level routing between known hubs. |

## Renderer side

| Path | Role |
|------|------|
| `ui/.../GameLayer/sub-components/navigation-overlay/` | Canvas overlay: draws reachability, connections, entrances, fall zones, path, Link debug; tile inspector tooltips; `pathfinding/` (A* 2×2, layer helpers). |
| `ui/domains/widgets/navigation/` | The [Navigation widget](../user-guide/navigation-minimap.md): minimaps, flood controls, connection/screen editors, the Dataset status panel. |
| `stores/navigation-overlay-store.ts` | Overlay visibility, flood results, connections, locked target tile, screen annotations, per-kind marker visibility. |

## Offline tooling

The `--dump-nav=<slot|name>` flag exports navigation data for a save state to
`debug-output/dump-nav.json`, so the analysis can run headless. The dump includes the flood, the
connections and the screen annotations with their reachability. See
[Developer Tools](../user-guide/developer-tools.md).

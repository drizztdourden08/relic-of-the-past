<!-- @layer docs @kind doc -->
# Navigation Architecture

The pathfinding/minimap system computes where Link can reach and how screens/rooms connect. The pure
logic lives in `shared/game/navigation/` (no React/Node — it runs in a plain test process); the
renderer draws the overlay; the [game hooks](../hooks/state-queries-rooms.md) feed it collision data.

> This is an **active area of work**. Design notes: `shared/game/navigation/plan/PLAN.md` and
> `REFACTOR-PLAN.md`. User-facing behavior: [Navigation & Minimap](../user-guide/navigation-minimap.md).
>
> **Not-yet-wired building blocks.** `floodFillWorld` (`flood-fill/`) and
> `buildFloodFillSession` (`session/`) are intentional WIP with no live caller yet —
> registered in [Codebase Audit](codebase-audit.md) so dead-code sweeps skip them.

## Data sources

Collision grids and room geometry come from the WASM core on demand:

- `WasmBuildOverworldAttrGrid(screen)` / `WasmBuildRoomAttrGrid(room)` → 64×64 attr grids.
- `WasmGetRoomDoorBoundaryTiles`, `…StairInfo`, `…ExitDoors`, `…WalkBoundaries`, `…TravelDestinations`.
- Navigation tables (`WasmGetOverworldEntrances`, `…FallHoles`, `…ExitScreenMap`, `…AreaHeads`,
  `…EntranceRooms`, `…EntranceSpawns`) — static, fetched once.
- Sprite blockers (`WasmGetNavigationBlockers`, `…OverworldGuardSpawns`).

`lib/game/navigation-data-source.ts` is the renderer-side adapter that pulls these through the bridge.

## Modules (`shared/game/navigation/`)

| Path | Role |
|------|------|
| `tile-attrs.ts` · `tile-classification.ts` · `interior-attrs.ts` · `overworld-attrs.ts` | Turn raw attr bytes into walkable/blocked/special tile classes. |
| `core/` | `bfs-engine`, `priority-queue`, `grid-utils`, `inventory` — the generic traversal primitives. |
| `flood-fill/` | Reachability: single-screen, multi-screen, single/dual-layer, path extraction. |
| `strategies/` | Layer strategies (single vs dual-layer dungeon rooms). |
| `screen-data/` | Collision-grid assembly + cliff preprocessing. |
| `screen-bundles.ts` · `connection-names.ts` | Group multi-screen areas; name connections. |
| `analysis/` | Offline analysis: `global-flood`, `entrance-resolver`, `requirement-detector`, `connection-updater`, `screen-updater`. |
| `session/` | A navigation session: builds the working set for the current location. |
| `hub-navigation.ts` | High-level routing between known hubs. |

## Renderer side

| Path | Role |
|------|------|
| `ui/.../GameLayer/sub-components/navigation-overlay/` | Canvas overlay: draws reachability, connections, entrances, fall zones, path, Link debug; tile inspector tooltips; `pathfinding/` (A* 2×2, layer helpers). |
| `ui/domains/widgets/navigation/` | The [Navigation widget](../user-guide/navigation-minimap.md): minimaps, flood controls, connection/screen editors, the Dataset status panel. |
| `stores/navigation-overlay-store.ts` | Overlay visibility, flood results, connections, locked target tile. |

## Offline tooling

`scripts/analyze-navigation.ts` plus the `--dump-nav=N` flag export navigation data for a save state
(`debug-output/dump-nav.json`) so the analysis can run headless. See [Developer Tools](../user-guide/developer-tools.md).

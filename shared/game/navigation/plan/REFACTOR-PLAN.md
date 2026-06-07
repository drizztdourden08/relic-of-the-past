<!-- @layer shared-game @kind doc -->
# Navigation System Refactor Plan

## Principle

The zelda3 C code (compiled to WASM) is the **only** source of truth for game data.
`shared/game/data/` (regions + connections) is the **only** dataset for navigation graph.
No ROM loading. No extraction. No duplication. Everything live from the game or derived from data/.

---

## Phase 1: WASM Exports

Add C functions to `core/game-hooks/state_queries.c` exposing game tables:

| Function | Source Table (in zelda3 C) | Purpose |
|----------|---------------------------|---------|
| `WasmGetOverworldEntrances()` | `kOverworld_Entrance_Area[129]`, `kOverworld_Entrance_Pos[129]`, `kOverworld_Entrance_Id[129]` (assets 124-126) | Entrance positions on overworld screens |
| `WasmGetFallHoles()` | `kFallHole_Area[19]`, `kFallHole_Pos[19]`, `kFallHole_Entrances[19]` (assets 127-129) | Pit/hole entrance positions |
| `WasmGetExitScreenMap()` | `kExitDataRooms[]`, `kExitData_ScreenIndex[]` (assets 130-131) | Indoor room → OW screen mapping |
| `WasmGetAreaHeads()` | `kOverworldAreaHeads[64]` (static in overworld.c) | Big screen grouping |
| `WasmGetEntranceRooms()` | `kEntranceData_rooms[]` (asset 11) | Entrance ID → dungeon room |

Rebuild WASM after.

---

## Phase 2: TypeScript Bridge

Add to `apps/desktop/src/lib/game/wasm-bridge.ts`:

- `wasmGetOverworldEntrances()` → `{ area: number, pos: number, id: number }[]`
- `wasmGetFallHoles()` → `{ area: number, pos: number, entranceId: number }[]`
- `wasmGetExitScreenMap()` → `Map<number, number>` (roomId → screenIndex)
- `wasmGetAreaHeads()` → `Uint8Array` (64 entries)
- `wasmGetEntranceRooms()` → `Uint16Array` (entranceId → roomId)

---

## Phase 3: Refactor Orchestrator (Remove ROM)

Rewrite `shared/game/navigation/flood-fill/orchestrator.ts`:

- Remove `rom: RomData` from `floodFillScreen()` signature
- Remove `initEngine()`, `getEngine()`, `cachedEngine`
- Remove `applyNarrowGapFilter()` (redundant — BFS already has `getClearanceRequirement`)
- `rawAttrGrid` becomes REQUIRED parameter (no optional override, it IS the grid)
- Accept `entrances` and `exitScreenByRoom` as params (caller provides from WASM)
- ONE code path: `buildCollisionGridFromRawAttr` → cliff processing → entrance detect → BFS
- `getBigScreenGroup()` uses WASM area heads (passed in or called directly)

New signature:
```ts
floodFillScreen(rawAttrGrid: number[][], screenIndex: number, options: {
  tileContext: TileAttrContext;
  inventory?: Set<string>;
  startPos?: GridPos;
  dynamicBlockers?: GridPos[];
  entrances?: OverworldEntrance[];
  exitScreenByRoom?: Map<number, number>;
  variant?: ScreenVariant;
})
```

---

## Phase 4: Move Flood Fill to Renderer

- NavigationWidget calls orchestrator DIRECTLY (no IPC to Electron main)
- NavigationWidget calls `wasmBuildOverworldAttrGrid(screen)` for outdoor screens
- NavigationWidget calls `wasmGetIndoorAttrGrid()` for indoor (already does this)
- NavigationWidget calls `wasmGetOverworldEntrances()` for entrance data
- Remove `connectionReview:floodFill` IPC handler from `apps/desktop/electron/connections/ipc-handlers.ts`
- Remove `loadRom()` from that file
- Remove `romFile` state from NavigationWidget
- Keep other IPC handlers (review save/load, bigScreenGroup) if they serve non-flood-fill purposes

---

## Phase 5: Consolidate Data Sources

| File | Action | Reason |
|------|--------|--------|
| `screen-names.ts` | DELETE | Redundant — callers use `ALL_REGIONS` / `REGION_BY_ID` lookup directly |
| `entrance-names.ts` | DELETE | Entirely redundant — `data/connections/` already has entrance names as the `entrance` field on every connection, and tags encode type (`transit:door`, `transit:hole`, etc.) |
| `screen-bundles.ts` | MOVE → `shared/game/data/regions/bundles.ts` | Bundle definitions are region metadata, not navigation logic. Uses WASM area heads for grouping. |

### NavigationWidget Migration

- `SCREEN_NAMES[idx]` → `REGION_BY_ID.get('lw-' + idx.toString(16))?.name` or fallback
- `ENTRANCE_NAMES[id]` → look up connection from `ALL_CONNECTIONS` by entrance index
- `classifyEntrance(id)` → derive from connection `tags` (`transit:door`→`'door'`, `transit:hole`→`'hole'`, `transit:cave`→`'cave'`, etc.)
- `buildScreenBundle()` → import from `@shared/game/data/regions/bundles`
- `EntranceType` → local type derived from connection tags, or keep in `data/connections/tags.ts`

---

## Phase 5.5: Data Model Enrichment

The types `RegionNavData` and `ConnectionNavData` already exist in
`plan/navigation-data.types.ts` and are imported into `shared/game/types.ts` (the `nav?`
field on both `RegionDefinition` and `RegionConnection`). But the analysis script that
**populates** these fields was never implemented.

### What to build:

| Component | Location | Purpose |
|-----------|----------|---------|
| `analyze-navigation.ts` | `scripts/` | Entry point. Runs offline flood fill for every screen/room. |
| `analysis/global-flood.ts` | `shared/game/navigation/analysis/` | Orchestrates BFS across all screens, collects reachable tiles per requirement set |
| `analysis/border-bundles.ts` | (existing) | Already computes two-sided overlap — wire output into `ConnectionNavData.overlapTiles` + `fromPoint`/`toPoint` |
| `analysis/entrance-resolver.ts` | `shared/game/navigation/analysis/` | Uses WASM entrance tables to identify connection points for doors/holes |
| `analysis/requirement-detector.ts` | `shared/game/navigation/analysis/` | Runs BFS with increasing item sets to determine which items gate which connection points |
| `analysis/region-updater.ts` | `shared/game/navigation/analysis/` | Writes computed `RegionNavData` back into region `.ts` files |
| `analysis/connection-updater.ts` | `shared/game/navigation/analysis/` | Writes computed `ConnectionNavData` back into connection `.ts` files |

### Output format:

Each region gets `nav: { totalTiles, freeTileCount, maxReachableTileCount, connectionPointIds, obstacles, features, variants }`.

Each connection gets `nav: { transitType, requirements, bidirectional, fromPoint, toPoint, overlapTiles, weight, validAfter }`.

See `plan/navigation-data.examples.ts` for concrete before/after examples.

### Constraint:

This phase runs WASM headlessly (no Electron). The analysis script is node + WASM only.
It reads game data from the live WASM build, not from ROM. The offline analysis is the ONE
place where we exercise the full game simulation to extract navigation truth.

---

## Phase 6: Delete Dead Code

### Delete entire folders:
- `temp-scripts/` (10 dead debug files)
- `shared/game/navigation/providers/` (5 files — rom-grid-provider, cached-grid-provider, grid-provider interface, headless-wasm-provider, index)

### KEEP: `shared/game/navigation/plan/`
This folder is the plan archive. Keep PLAN.md (old plan), REFACTOR-PLAN.md (this plan), and the
type/example files as reference for the data model enrichment work (Phase 5.5).

### Delete from `scripts/`:
- `debug-flood.ts`
- `extract-screen-connectivity.ts`
- `extract-sprites.ts`
- `flood-fill-connectivity.ts`
- `flood-graph.json`
- `generate-flood-html.ts`
- `generate-flood-svg.ts`
- `lw-flood-map.html`
- `lw-flood-map.svg`
- `test-headless-wasm.ts`
- `trace-interior-rooms.ts`
- `trace-output.txt`
(Keep only `analyze-navigation.ts`)

### Delete from `shared/game/navigation/analysis/`:
- `interior-flood.ts` (dead stub)
- `region-updater.ts` (dead stub)
- `connection-updater.ts` (dead stub)
- `requirement-detector.ts` (never called)

### Move to `shared/game/navigation/analysis/` (offline-only, ROM ok for scripts):
- `screen-data/decompression.ts`
- `screen-data/rom-addresses.ts`

### Remove from `shared/game/navigation/screen-data/collision-grid.ts`:
- Delete `buildCollisionGrid()` (ROM Map16 decompression path)
- Keep only `buildCollisionGridFromRawAttr()`

### Remove from `shared/game/navigation/index.ts` exports:
- `initEngine`
- `RomGridProvider`
- `CachedGridProvider`
- `MetadataProvider` type
- `buildGridFromRawAttr` (providers-only helper)

### Remove from `apps/desktop/src/lib/navigation/`:
- `wasm-grid-provider.ts` (provider pattern is dead — WASM bridge is called directly)

---

## Phase 7: Rewrite Tests

11 of 14 navigation tests use `loadRom()`. Rewrite them to use:
- Headless WASM (`WasmBuildOverworldAttrGrid`/`WasmBuildRoomAttrGrid`) for integration tests
- Inline mock grids (number[][]) for unit tests
- No `loadRom()` anywhere

Delete diagnostic tests that are just one-off explorations:
- `entrance-area-decoding.test.ts`
- `entrance-table-decoder-diag.test.ts`
- `entrance-tile-diag.test.ts`
- `entrance-root-cause-diag.test.ts`
- `desert-internal.test.ts`

Keep and rewrite:
- `tile-classification.test.ts` (no ROM, already clean)
- `event-overlays.test.ts` (no ROM, already clean)
- `navigation.test.ts` (uses data/, already clean)
- `route-planner.test.ts` (rewrite to use WASM grids)
- `border-bundles.test.ts` (rewrite to use WASM grids)
- `secret-passage-from-link.test.ts` (rewrite to use WASM grids)
- `bush-corridor-diag.test.ts` (rewrite to use mock grid)
- `desert-maze.test.ts` (rewrite to use WASM grids)
- `desert-path-check.test.ts` (rewrite to use WASM grids)

---

## Phase 8: Verify

- Re-read this plan
- Check every phase was completed
- Run full test suite
- Grep for `loadRom` in live code (should only appear in `shared/asset-extraction/` and `analysis/`)
- Grep for `RomData` in live code (should only appear in `analysis/`)
- Grep for `rom:` parameter in navigation/ (should be zero)
- Confirm flood fill works in-app (indoor + outdoor)
- List any remaining issues

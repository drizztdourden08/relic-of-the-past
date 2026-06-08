<!-- @layer root-config @kind doc -->
# Navigation Architecture Plan — Unified Engine

## Executive Summary

The current navigation system reads raw bytes from a `.sfc` ROM binary at hardcoded SNES addresses.
Meanwhile, the project has a **fully decompiled C source** (`core/zelda3/`) and **structured YAML data files** (`core/zelda3/assets/dungeon/`, `core/zelda3/assets/overworld/`).

This plan eliminates the `.sfc` ROM dependency from the navigation engine by using the decompiled data directly.

---

## Current Data Flow (What We Have)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          CURRENT ARCHITECTURE                                 │
└──────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   .sfc ROM Binary    │  ← THE PROBLEM
                    │  (1 MB SNES image)   │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼───────────────────────┐
           │                   │                        │
           ▼                   ▼                        ▼
    ┌──────────────┐   ┌──────────────────┐   ┌───────────────────┐
    │ compile_      │   │ TS Navigation    │   │ compile_          │
    │ resources.py  │   │ Engine (shared/) │   │ resources.ts      │
    │ (Python)      │   │ ROM.getByte()    │   │ (TS port)         │
    └──────┬───────┘   └────────┬─────────┘   └────────┬──────────┘
           │                    │                       │
           ▼                    │                       ▼
    ┌──────────────┐            │              ┌───────────────────┐
    │ zelda3_      │            │              │ zelda3_assets.dat │
    │ assets.dat   │            │              │ (binary blob)     │
    └──────┬───────┘            │              └────────┬──────────┘
           │                    │                       │
           ▼                    │                       ▼
    ┌──────────────┐            │              ┌───────────────────┐
    │ WASM Module  │            │              │ WASM Module       │
    │ (runs game)  │            │              │ (runs game)       │
    └──────┬───────┘            │              └───────────────────┘
           │                    │
           ▼                    ▼
    ┌──────────────┐   ┌──────────────────┐
    │ Live attr    │   │ Offline attr     │
    │ grid (widget)│   │ grid (IPC call)  │
    └──────────────┘   └──────────────────┘
              │                    │
              ▼                    ▼
         DIFFERENT CODE PATHS ← THE OTHER PROBLEM
```

### Problem 1: ROM as Data Source

The TS navigation engine reads from SNES addresses:

- `ADDR_MAP32_0..3` (0x838000) — Map32→Map16 lookup
- `ADDR_MAP16_TO_MAP8` (0x8F8000) — Map16→Map8 lookup
- `ADDR_MAP8_TO_ATTR` (0x8E9459) — Map8→collision attribute
- `ADDR_HI_PTRS/LO_PTRS` — compressed overworld tilemaps
- `ADDR_OW_ENTRANCE_*` — entrance tables
- `ADDR_EXIT_*` — exit tables

### Problem 2: Two Divergent Paths

- **Widget** (live): Gets `dung_bg2_attr_table` from WASM memory via `WasmGetIndoorAttrTable()`
- **Offline** (IPC): Has NO way to get indoor attr grids — can only do overworld

---

## Available Data Sources (What We Actually Have)

### A. YAML Files (Fully Structured, Human-Readable)

| Data | Source | Entries |
|------|--------|---------|
| Overworld entrances | `overworld-*.yaml` → `Entrances[]` | 129 |
| Fall holes | `overworld-*.yaml` → `Holes[]` | 19 |
| Overworld exits | `overworld-*.yaml` → `Exits[]` | 79 |
| Bird travel points | `overworld-*.yaml` → `Travel[]` | ~17 |
| Room objects (all layers) | `dungeon-*.yaml` → `Layer1/2/3[]` | 320 rooms |
| Room headers | `dungeon-*.yaml` → `Header{}` | 320 rooms |
| Dungeon entrances | `dungeon-*.yaml` → `Entrances[]` | 133 |
| Room door data | `dungeon-*.yaml` → `Layer3.doors[]` | per-room |

### B. Text Files (Static Lookup Tables)

| Data | Source | Size |
|------|--------|------|
| Map32→Map16 | `map32_to_map16.txt` | 8,872 entries × 4 map16 IDs |

### C. Static ROM Tables (Version-Independent, Extract-Once)

| Data | ROM Address | Size | Purpose |
|------|-------------|------|---------|
| `kMap16ToMap8` | 0x8F8000 | 15,008 uint16 | Map16 tile → 4 Map8 tile IDs |
| `kMap8DataToTileAttr` | 0x8E9459 | 512 bytes | Map8 tile → collision attribute |
| `kSomeTileAttr` | 0x9BF110 | 3,824 bytes | Dungeon tile attr lookup |
| Compressed tilemaps | via pointer tables | ~160 screens | Per-screen Map32 layout |

### D. Compiled Binary (`zelda3_assets.dat`)

Already contains ALL of the above baked into a single file — this is what the WASM module loads.
Built by `compile_resources.py` (Python) or `compile-resources.ts` (TS port).

---

## Key Insight: What Can Never Be Pure TypeScript

**Indoor room attr grids** (`dung_bg2_attr_table[4096]`) are built by `Dungeon_LoadRoom()` in `dungeon.c`:

- Processes room objects (Layer1, Layer2, Layer3) through 500+ lines of draw handlers
- Applies floor layouts, door configurations, torch positions, movable blocks
- Uses lookup tables (`kDungAttrsForTile`, offsets) for object-to-tile-attr conversion
- Result: 64×64 uint8 collision grid per room

This logic is **deeply embedded in the C code** (~2000 lines of `dungeon.c`). Reimplementing it
in TypeScript would be massive, fragile, and a maintenance nightmare.

**Overworld attr grids** ARE pure functions:

```
compressed_tilemap → Map32 IDs → Map16 tiles → Map8 tiles → collision attr
```

Each step is a simple table lookup. This is already implemented in TS (`decompressScreen()` + `buildCollisionGrid()`).

---

## Proposed Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          PROPOSED ARCHITECTURE                                 │
└──────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────────────────────────────────┐
     │           WASM MODULE (single source of truth for ALL grids)      │
     │           Already loads zelda3_assets.dat with ALL game data      │
     ├─────────────────────────────────────────────────────────────────┤
     │                                                                  │
     │  WasmBuildOverworldAttrGrid(screenIdx)  → ptr to 64×64 uint8    │
     │  WasmBuildRoomAttrGrid(roomId)          → ptr to 64×64 uint8    │
     │                                                                  │
     │  Uses the SAME C code the game uses:                             │
     │    • Overworld: decompress → map32 → map16 → map8 → attr        │
     │    • Indoor: Dungeon_LoadRoom() → dung_bg2_attr_table            │
     │                                                                  │
     └──────────────────────────────────┬──────────────────────────────┘
                                        │
                                        ▼
     ┌─────────────────────────────────────────────────────────────────┐
     │                   UNIFIED NAVIGATION ENGINE                      │
     │                   shared/game/navigation/                        │
     │                                                                  │
     │  ┌────────────────────────────────────────────────────────────┐  │
     │  │   GridProvider (interface)                                   │  │
     │  │   getGrid(target: ScreenTarget): Uint8Array (64×64)         │  │
     │  │                                                             │  │
     │  │   Implementations:                                          │  │
     │  │     • WasmGridProvider — calls WASM exports (production)    │  │
     │  │     • CachedGridProvider — loads pre-built grids (tests)    │  │
     │  └────────────────────────────────────────────────────────────┘  │
     │                                                                  │
     │  ┌────────────────────────────────────────────────────────────┐  │
     │  │   MetadataProvider (interface)                               │  │
     │  │   getEntrances(): OverworldEntrance[]                       │  │
     │  │   getExitScreenMap(): Map<number, number>                   │  │
     │  │   getRoomHeader(roomId): RoomHeader                         │  │
     │  │                                                             │  │
     │  │   Implementations:                                          │  │
     │  │     • YamlMetadataProvider — parses YAML at build time      │  │
     │  │     • WasmMetadataProvider — reads from WASM memory tables  │  │
     │  └────────────────────────────────────────────────────────────┘  │
     │                                                                  │
     │  ┌────────────────────────────────────────────────────────────┐  │
     │  │              floodFillScreen() — SINGLE ENTRY POINT         │  │
     │  │              Takes a grid + metadata, does BFS              │  │
     │  │              Doesn't know or care where the grid came from  │  │
     │  └────────────────────────────────────────────────────────────┘  │
     └─────────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌─────────────┐ ┌──────────┐ ┌─────────────────┐
   │  Widget     │ │  Tests   │ │  Scripts/CLI    │
   │  (renderer) │ │  (node)  │ │  (node)         │
   └─────────────┘ └──────────┘ └─────────────────┘
```

### Why WASM for BOTH (not just indoor)

1. **The C code IS the game** — guaranteed byte-for-byte identical collision behavior
2. **No parallel reimplementation** — delete 200+ lines of TS decompression/map32/map16/map8 logic
3. **No static data extraction** — WASM already has `zelda3_assets.dat` with everything baked in
4. **Future-proof** — if collision logic changes (overlay patches, event flags), it's updated in one place (C)
5. **Overworld overlays** — the C code already handles rain states, special transitions, etc.

---

## Implementation Plan

### Phase 1: WASM Grid Exports (C Side)

**Goal**: The WASM module can produce a 64×64 collision attr grid for ANY screen or room on demand.

#### 1a. `WasmBuildOverworldAttrGrid(screenIdx)` in `core/game-hooks/state_queries.c`

The C code already has the full pipeline:

- `Overworld_DecompressAndDrawScreen()` → builds `overworld_tileattr[]` (the Map16 buffer)
- `GetMap16toMap8Table()` → `kMap16ToMap8` (Map16 → 4 Map8 tiles)
- `GetMap8toTileAttr()` → `kMap8DataToTileAttr` (Map8 → collision byte)

New export builds a 64×64 grid by walking each 8×8 sub-tile:

```c
static uint8 g_overworld_attr_grid[64 * 64];

EMSCRIPTEN_KEEPALIVE
int WasmBuildOverworldAttrGrid(int screen_idx) {
  // Decompress the screen's tilemap into overworld_tileattr[]
  Overworld_DecompressScreen(screen_idx);

  // Walk 32×32 Map16 tiles, each splits into 2×2 = 64×64 Map8 cells
  const uint16 *map16ToMap8 = GetMap16toMap8Table();
  const uint8 *map8ToAttr = GetMap8toTileAttr();

  for (int row16 = 0; row16 < 32; row16++) {
    for (int col16 = 0; col16 < 32; col16++) {
      uint16 tile16 = overworld_tileattr[row16 * 32 + col16];
      int base = tile16 * 4;
      int gr = row16 * 2, gc = col16 * 2;
      g_overworld_attr_grid[(gr+0)*64 + gc+0] = map8ToAttr[map16ToMap8[base+0] & 0x1FF];
      g_overworld_attr_grid[(gr+0)*64 + gc+1] = map8ToAttr[map16ToMap8[base+1] & 0x1FF];
      g_overworld_attr_grid[(gr+1)*64 + gc+0] = map8ToAttr[map16ToMap8[base+2] & 0x1FF];
      g_overworld_attr_grid[(gr+1)*64 + gc+1] = map8ToAttr[map16ToMap8[base+3] & 0x1FF];
    }
  }
  return (int)g_overworld_attr_grid;
}
```

#### 1b. `WasmBuildRoomAttrGrid(roomId)` in `core/game-hooks/state_queries.c`

```c
EMSCRIPTEN_KEEPALIVE
int WasmBuildRoomAttrGrid(int room_id) {
  uint16 saved_room = dungeon_room_index;
  dungeon_room_index = (uint16)room_id;
  memset(dung_bg2_attr_table, 0, 0x2000);
  Dungeon_LoadRoom();
  dungeon_room_index = saved_room;
  return (int)dung_bg2_attr_table;
}
```

#### 1c. Rebuild WASM, verify both exports work

---

### Phase 2: TS GridProvider Interface

**Goal**: Abstract where grids come from so the flood fill engine is grid-source-agnostic.

#### 2a. `GridProvider` interface

```typescript
// shared/game/navigation/grid-provider.ts

export type ScreenTarget =
  | { type: 'overworld'; screenIdx: number; variant?: ScreenVariant }
  | { type: 'indoor'; roomId: number; layer?: 'upper' | 'lower' };

export interface GridProvider {
  getGrid(target: ScreenTarget): Uint8Array | null;  // 64×64 flat
}
```

#### 2b. `WasmGridProvider` implementation

```typescript
// apps/desktop/src/lib/game/wasm-grid-provider.ts

export class WasmGridProvider implements GridProvider {
  constructor(private mod: EmscriptenModule) {}

  getGrid(target: ScreenTarget): Uint8Array | null {
    if (target.type === 'overworld') {
      const ptr = this.mod.ccall('WasmBuildOverworldAttrGrid', 'number', ['number'], [target.screenIdx]);
      return new Uint8Array(this.mod.HEAPU8.buffer, ptr, 64 * 64).slice();
    } else {
      const ptr = this.mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [target.roomId]);
      const offset = target.layer === 'lower' ? 0x1000 : 0;
      return new Uint8Array(this.mod.HEAPU8.buffer, ptr + offset, 64 * 64).slice();
    }
  }
}
```

#### 2c. `CachedGridProvider` for tests (loads from snapshot files, no WASM needed)

---

### Phase 3: Refactor `floodFillScreen()` to Accept `GridProvider`

```typescript
// Before: floodFillScreen(rom, screenIndex, inventory, ...)
// After:  floodFillScreen(grid, metadata, screenIndex, inventory, ...)

export function floodFillScreen(
  gridProvider: GridProvider,
  metadata: MetadataProvider,
  screenIndex: number,
  inventory: Set<string>,
  startPos?: GridPos,
  variant?: ScreenVariant,
): FloodFillResult { ... }
```

The function:

1. Calls `gridProvider.getGrid(...)` to get the 64×64 attr grid
2. Runs BFS flood fill on it (existing logic, unchanged)
3. Uses `metadata` for entrance/exit positions

**Delete**: `loadMap32Tables()`, `loadMap16ToMap8()`, `loadMap8ToAttr()`, `decompressScreen()` from the navigation engine (move to legacy/test-only if needed).

---

### Phase 4: Metadata from YAML (No ROM for Entrance/Exit Tables)

Entrances, exits, fall holes — all structured in YAML files. Parse at build time or app startup:

```typescript
// shared/game/navigation/yaml-metadata-provider.ts

export class YamlMetadataProvider implements MetadataProvider {
  private entrances: OverworldEntrance[];
  private exitMap: Map<number, number>;

  constructor(overworldYamls: OverworldYaml[], dungeonYamls: DungeonYaml[]) {
    this.entrances = parseEntrancesFromYaml(overworldYamls);
    this.exitMap = parseExitsFromYaml(overworldYamls);
  }

  getOverworldEntrances() { return this.entrances; }
  getExitScreenMap() { return this.exitMap; }
}
```

This eliminates ALL ROM address reads (`ADDR_OW_ENTRANCE_*`, `ADDR_EXIT_*`, etc).

---

### Phase 5: Wire Everything Together

- **Widget**: `WasmGridProvider` + `WasmMetadataProvider` (reads tables from WASM memory)
- **IPC handler**: Same `WasmGridProvider` (WASM module loaded headlessly in main process)
- **Tests**: `CachedGridProvider` + static metadata
- **Scripts**: Either headless WASM or `CachedGridProvider`

---

## Current File Tree (The Mess)

```
shared/game/navigation/            ← 30+ files, unclear boundaries
├── index.ts                       ← barrel that re-exports everything
├── types.ts                       ← mixed: grid types + result types + engine cache
├── tile-attrs.ts                  ← collision byte → passability map
├── tile-classification.ts         ← thin wrapper over tile-attrs (redundant?)
├── entrance-names.ts              ← static string array
├── screen-names.ts                ← derived from regions
├── screen-bundles.ts              ← groups screens for UI
├── hub-navigation.ts              ← region-graph BFS (depends on regions/connections)
├── point-navigation.ts            ← A* on 64×64 grid
├── route-planner.ts               ← combines everything into start→end route
├── screen-hop.ts                  ← Dijkstra on 8×8 overworld grid
├── flood-fill/
│   ├── orchestrator.ts            ← ENGINE INIT + ROM LOADING + flood dispatch (GOD OBJECT)
│   ├── single-screen.ts           ← BFS core (pure)
│   ├── multi-screen.ts            ← cross-screen propagation
│   └── index.ts
├── screen-data/                   ← ROM decompression (BEING DELETED)
│   ├── decompression.ts           ← TS reimplementation of C decompression
│   ├── collision-grid.ts          ← builds grid from raw Map8 attrs
│   ├── cliff-preprocessing.ts    ← marks cliff edges with directional data
│   ├── event-overlays.ts         ← dark world / event patches
│   ├── rom-addresses.ts          ← hardcoded SNES addresses
│   └── index.ts
├── analysis/                      ← world-scale analysis (7 files!)
│   ├── global-flood.ts           ← floods entire world from Link's House
│   ├── border-bundles.ts         ← detects border crossing regions
│   ├── entrance-resolver.ts      ← maps entrance tiles → rooms
│   ├── interior-flood.ts         ← STUB (empty)
│   ├── requirement-detector.ts   ← diffs floods with/without items
│   ├── connection-updater.ts     ← writes nav data to connection files
│   ├── region-updater.ts         ← writes nav data to region files
│   └── index.ts
├── core/                          ← generic algorithms
│   ├── grid-utils.ts             ← DIRECTIONS, inBounds, manhattan
│   ├── inventory.ts              ← canPass(), unmetRequirements()
│   ├── path-reconstruct.ts       ← parent-map backtracking
│   ├── priority-queue.ts         ← binary min-heap
│   └── index.ts
└── plan/                          ← documentation types (unused at runtime?)
    ├── navigation-data.types.ts
    ├── navigation-data.examples.ts
    └── PLAN.md

scripts/                           ← mix of CLI tools + dead experiments
├── analyze-navigation.ts          ← master CLI (imports from navigation/)
├── debug-flood.ts                 ← one-off debug trace
├── extract-screen-connectivity.ts ← standalone ROM reader (duplicates nav code)
├── flood-fill-connectivity.ts     ← another BFS variant
├── trace-interior-rooms.ts        ← room graph builder
├── generate-flood-html.ts         ← visualization
├── generate-flood-svg.ts          ← visualization
├── flood-graph.json               ← output artifact
├── lw-flood-map.html              ← output artifact
└── lw-flood-map.svg               ← output artifact

temp-scripts/                      ← experimental prototypes (10 files)
├── multi-screen-bfs.ts            ← old prototype (superseded by flood-fill/multi-screen)
├── test-flood-fill.ts             ← tile identification test
├── debug-entrance-position.ts     ← ROM encoding reverse-engineering
├── diag-borders.ts                ← border diagnostics
└── ... 6 more debug scripts
```

### Problems with Current Structure

1. **`orchestrator.ts` is a god object** — init, cache, ROM loading, entrance loading, exit loading, big screen detection, AND flood dispatch all in one file
2. **`screen-data/` is about to be deleted** — WASM replaces all of it, but its responsibilities (grid building, cliff detection, overlays) still need a home
3. **`analysis/` mixes algorithms with file I/O** — `global-flood` is an algorithm; `connection-updater` writes to disk
4. **`core/` is too generic** — `priority-queue.ts` and `grid-utils.ts` are reusable utilities that don't belong inside navigation
5. **`scripts/` has dead output artifacts** — `.html`, `.svg`, `.json` files mixed with source
6. **`temp-scripts/` should not exist** — either promote to `scripts/` or delete
7. **`plan/` is dead documentation** — types are unused, examples are stale
8. **Two tile classification files** — `tile-attrs.ts` and `tile-classification.ts` do the same thing
9. **No clear separation between "engine" (computes grids) and "pathfinding" (uses grids)**

---

## Proposed File Tree (After Reorganization)

```
shared/game/
│
├── index.ts                            ← Public API barrel
├── types.ts                            ← Shared types: RegionDefinition, RegionConnection, etc.
│
├── data/                               ← SOURCE OF TRUTH (game world model)
│   ├── index.ts                        ← Barrel: ALL_REGIONS, ALL_CONNECTIONS, lookups
│   │
│   ├── regions/                        ← WHAT EXISTS (graph nodes)
│   │   ├── index.ts                    ← ALL_REGIONS, REGION_BY_ID
│   │   ├── bundles.ts                  ← Screen bundles (logical groups: big screens, named areas)
│   │   ├── detection.ts               ← resolveCurrentRegion() (runtime: which region is Link in?)
│   │   ├── tags.ts                    ← Tag types + metadata
│   │   ├── light-world/
│   │   │   ├── index.ts
│   │   │   ├── overworld.ts           ← 64 LW screen regions (lw-00..lw-3f)
│   │   │   ├── overworld-areas.ts     ← Logical sub-areas (ledges, isolated spots)
│   │   │   ├── houses.ts             ← Interior house regions
│   │   │   ├── caves.ts              ← Cave interior regions
│   │   │   ├── shops.ts              ← Shop interior regions
│   │   │   ├── fairy.ts              ← Fairy fountain regions
│   │   │   ├── wells.ts              ← Well interior regions
│   │   │   ├── passages.ts           ← Passage regions (Old Man Cave, etc.)
│   │   │   ├── special.ts            ← Unique regions (Master Sword pedestal, etc.)
│   │   │   ├── gamble.ts             ← Gamble game regions
│   │   │   ├── hints.ts              ← Hint tile rooms
│   │   │   └── dungeons/             ← Dungeon region definitions
│   │   └── dark-world/
│   │       ├── (same structure as light-world)
│   │       └── ...
│   │
│   └── connections/                    ← HOW THINGS CONNECT (graph edges)
│       ├── index.ts                   ← ALL_CONNECTIONS, DUNGEON_CONNECTIONS
│       ├── tags.ts                    ← Connection tag types
│       ├── light-world/
│       │   ├── index.ts
│       │   ├── houses.ts             ← OW screen ↔ house interior
│       │   ├── caves.ts              ← OW screen ↔ cave interior
│       │   ├── shops.ts
│       │   ├── fairy.ts
│       │   ├── wells.ts
│       │   ├── passages.ts
│       │   ├── special.ts
│       │   ├── gamble.ts
│       │   ├── hints.ts
│       │   ├── dungeons/             ← Dungeon internal connections
│       │   └── overworld/            ← Screen-to-screen walking connections
│       │       ├── index.ts
│       │       ├── central-hyrule.ts
│       │       ├── death-mountain.ts
│       │       ├── desert.ts
│       │       ├── east-hyrule.ts
│       │       ├── hyrule-castle.ts
│       │       ├── kakariko.ts
│       │       ├── lake-hylia.ts
│       │       ├── lost-woods.ts
│       │       ├── south-hyrule.ts
│       │       └── screen-adjacency.ts
│       └── dark-world/
│           ├── (same structure)
│           └── ...
│
├── navigation/                         ← ENGINE (computes reachability, updates data/)
│   ├── index.ts                        ← Public API: floodFillScreen, planRoute, etc.
│   ├── types.ts                        ← Nav-specific types: GridPos, FloodResult, ScreenTarget
│   │
│   ├── providers/                      ← WHERE GRIDS + METADATA COME FROM
│   │   ├── grid-provider.ts            ← GridProvider interface
│   │   ├── metadata-provider.ts        ← MetadataProvider interface
│   │   └── yaml-metadata.ts            ← Parses overworld/dungeon YAMLs
│   │
│   ├── tiles/                          ← TILE KNOWLEDGE (pure data, zero I/O)
│   │   ├── attrs.ts                    ← Collision byte → {passability, requirement, label}
│   │   ├── classification.ts           ← canPass(), unmetRequirements()
│   │   └── cliff-edges.ts             ← Cliff direction detection
│   │
│   ├── flood/                          ← BFS FLOOD FILL (pure algorithms)
│   │   ├── single-screen.ts            ← 64×64 BFS with 0-1 deque
│   │   ├── multi-screen.ts             ← Cross-screen propagation
│   │   ├── global.ts                   ← World-scale flood from Link's House
│   │   └── interior.ts                 ← Indoor room flooding via WASM grids
│   │
│   ├── pathfinding/                    ← GRAPH ALGORITHMS
│   │   ├── tile-astar.ts               ← A* on 64×64 grid
│   │   ├── screen-dijkstra.ts          ← Dijkstra on 8×8 overworld grid
│   │   ├── region-bfs.ts               ← Region graph BFS (uses data/connections)
│   │   └── route-planner.ts            ← Full route: region → screen → tile
│   │
│   ├── analysis/                       ← ANALYSIS (pure computation → feeds back into data/)
│   │   ├── border-bundles.ts           ← Contiguous border region detection
│   │   ├── entrance-resolver.ts        ← Entrance tile → room mapping
│   │   └── requirement-detector.ts     ← Inventory-gated border detection
│   │
│   └── util/                           ← GENERIC UTILITIES (no game knowledge)
│       ├── grid.ts                     ← DIRECTIONS, inBounds, neighbors, manhattan
│       ├── priority-queue.ts           ← Binary min-heap
│       └── path-reconstruct.ts         ← Parent-map backtracking
│
├── items/                              ← (existing — item definitions)
├── checks/                             ← (existing — check definitions)
├── logic/                              ← (existing — logic rules)
├── sprites/                            ← (existing — sprite data)
├── events.ts                           ← (existing — event system)
└── seed.ts                             ← (existing — seed/randomizer)

apps/desktop/src/lib/game/
├── wasm-bridge.ts                      ← [MODIFIED] add grid export calls
├── wasm-grid-provider.ts               ← [NEW] WasmGridProvider implementation
└── wasm-metadata-provider.ts           ← [NEW] reads entrance/exit from WASM memory

core/game-hooks/
└── state_queries.c                     ← [MODIFIED] add both grid exports

scripts/
├── analyze-navigation.ts              ← Global flood → updates data/connections + data/regions
├── trace-interior-rooms.ts            ← Room graph builder
└── visualize-flood.ts                 ← Generates HTML/SVG flood maps

tests/navigation/
├── cached-grid-provider.ts            ← Loads snapshot grids
├── fixtures/                          ← Pre-built grid snapshots
└── ... (existing test files)
```

### The `data/` Contract

```
┌─────────────────────────────────────────────────────────────────────┐
│  shared/game/data/   — THE SOURCE OF TRUTH                           │
│                                                                       │
│  regions/   = Graph NODES (what exists in the game world)            │
│  connections/ = Graph EDGES (how nodes connect)                      │
│                                                                       │
│  Rules:                                                              │
│  • Randomizer reads from here directly                               │
│  • Navigation engine COMPUTES reachability and WRITES BACK here      │
│  • Each connection has: from, to, entrance, tags, [nav data]         │
│  • Each region has: id, name, type, screens, tags, [nav data]        │
│  • nav data fields are populated by analyze-navigation.ts            │
│  • Human-authored fields (from, to, tags) are NEVER overwritten      │
└─────────────────────────────────────────────────────────────────────┘
```

Data flows:

```
WASM (game truth) → navigation engine (computes) → data/ (stores) → randomizer (reads)
                                                  ↑
                                        analyze-navigation.ts
                                        (CLI: runs global flood,
                                         updates nav fields in data/)
```

### What Gets DELETED

| File/Folder | Reason |
|-------------|--------|
| `shared/game/regions/` (old location) | Moves to `shared/game/data/regions/` |
| `shared/game/connections/` (old location) | Moves to `shared/game/data/connections/` |
| `navigation/screen-data/` (entire folder) | WASM replaces all ROM decompression |
| `navigation/plan/` (entire folder) | Stale docs, types unused |
| `navigation/core/` (dissolved) | Contents → `navigation/util/` and `navigation/tiles/` |
| `navigation/screen-names.ts` | Derived from `data/regions/` — inline where needed |
| `navigation/entrance-names.ts` | Move to `data/` or inline |
| `navigation/screen-bundles.ts` | Becomes `data/regions/bundles.ts` |
| `temp-scripts/` (entire folder) | All superseded |
| Output artifacts in `scripts/` | `.json`, `.html`, `.svg` — gitignore |

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **data/ is the source of truth** | Randomizer, UI, tests all read from `data/`. No other canonical source. |
| **Navigation computes, data stores** | `navigation/` never owns state — it reads grids, computes results, caller decides what to persist |
| **scripts/ is the bridge** | `analyze-navigation.ts` reads from WASM, runs navigation engine, updates `data/` files |
| **No I/O in shared/game/navigation/** | Pure computation. `GridProvider` abstracts the data source. |
| **Providers for testability** | `WasmGridProvider` (production), `CachedGridProvider` (tests) — same interface |
| **Flat over deep** | Max 2 nesting levels in navigation. No `flood-fill/orchestrator.ts` god objects. |
| **Bundles at region root** | `data/regions/bundles.ts` groups screens into logical areas (the UI view) |

---

## Data Flow After Implementation

```
                         ┌────────────────────────────────────┐
                         │         zelda3_assets.dat           │
                         │  (compiled from YAML + ROM once)    │
                         └──────────────────┬─────────────────┘
                                            │
                                            ▼
                         ┌────────────────────────────────────┐
                         │           WASM Module               │
                         │                                     │
                         │  WasmBuildOverworldAttrGrid(idx)    │
                         │  WasmBuildRoomAttrGrid(roomId)      │
                         │                                     │
                         └──────────────────┬─────────────────┘
                                            │
                         ┌──────────────────┴──────────────────┐
                         │                                      │
                         ▼                                      ▼
               ┌──────────────────┐               ┌───────────────────┐
               │ WasmGridProvider  │               │ YAML Metadata     │
               │ (64×64 grids)    │               │ (entrances/exits) │
               └────────┬─────────┘               └─────────┬─────────┘
                        │                                    │
                        └────────────┬───────────────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                        │   floodFillScreen()         │
                        │   (grid-agnostic BFS)       │
                        └────────────┬───────────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────────┐
              │  Widget  │   │  Tests   │   │ CLI Scripts  │
              └──────────┘   └──────────┘   └──────────────┘
```

---

## ROM Dependency After This

| Use Case | Needs .sfc? |
|----------|-------------|
| Playing the game (WASM) | No — uses `zelda3_assets.dat` |
| Navigation (flood fill) | No — WASM builds grids from `zelda3_assets.dat` |
| Asset extraction (build step) | **Yes** — one-time, to produce `zelda3_assets.dat` |
| Tests | No — use cached grid snapshots |

The `.sfc` ROM is only needed ONCE during asset compilation. After that, everything runs from
the compiled `zelda3_assets.dat` through the WASM module.

---

## Implementation Order

### Stage 1: WASM Exports (unblocks everything)

1. Add `WasmBuildOverworldAttrGrid()` + `WasmBuildRoomAttrGrid()` to C
2. Rebuild WASM
3. Add TS bridge functions, verify grids match current output byte-for-byte

### Stage 2: Move regions + connections → data/ (source of truth)

4. Create `shared/game/data/` with `regions/` and `connections/` subfolders
2. Move all existing region files under `data/regions/` (preserve internal structure)
3. Move all existing connection files under `data/connections/` (preserve internal structure)
4. Move `screen-bundles.ts` → `data/regions/bundles.ts`
5. Update all imports across the codebase (widget, tests, scripts, navigation)
6. Create `data/index.ts` barrel

### Stage 3: Provider Interfaces (decouples engine from data source)

10. Create `navigation/providers/grid-provider.ts` — `GridProvider` interface
2. Create `navigation/providers/metadata-provider.ts` — `MetadataProvider` interface
3. Create `WasmGridProvider` in `apps/desktop/`
4. Create `navigation/providers/yaml-metadata.ts` — parses YAML for entrances/exits

### Stage 4: Reorganize navigation/ internals

14. Create `navigation/util/` — move `priority-queue.ts`, `grid-utils.ts → grid.ts`, `path-reconstruct.ts`
2. Create `navigation/tiles/` — merge `tile-attrs.ts` + `tile-classification.ts` + `core/inventory.ts`
3. Move `cliff-preprocessing.ts` → `navigation/tiles/cliff-edges.ts`
4. Rename `flood-fill/` → `flood/` — keep `single-screen.ts`, `multi-screen.ts`
5. Move `analysis/global-flood.ts` → `flood/global.ts`
6. Create `flood/interior.ts` (real implementation using GridProvider)
7. Create `navigation/pathfinding/` — move and rename: `point-navigation → tile-astar`, `screen-hop → screen-dijkstra`, `hub-navigation → region-bfs`, keep `route-planner`
8. Slim `navigation/analysis/` — keep only `border-bundles`, `entrance-resolver`, `requirement-detector`
9. Dissolve `orchestrator.ts` — provider wiring goes to callers, flood dispatch goes to `flood/`

### Stage 5: Refactor floodFillScreen() to use providers

23. Change signature: `(gridProvider, metadata, screenIndex, ...)`
2. Update IPC handler to create `WasmGridProvider`
3. Update widget to use same path

### Stage 6: Delete dead code

26. Delete `navigation/screen-data/` folder entirely
2. Delete `navigation/plan/` folder
3. Delete `navigation/core/` folder (contents moved)
4. Delete `temp-scripts/` folder entirely
5. Delete output artifacts from `scripts/` (`.json`, `.html`, `.svg`)
6. Merge visualization scripts → `scripts/visualize-flood.ts`
7. Delete superseded scripts (`debug-flood`, `extract-screen-connectivity`, `flood-fill-connectivity`)
8. Move connection-updater + region-updater logic into `scripts/analyze-navigation.ts`

### Stage 7: Tests

34. Create `CachedGridProvider` + fixture snapshots
2. Migrate navigation tests to use providers
3. Verify all pass

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `Dungeon_LoadRoom()` has side effects beyond attr table | Save/restore all touched globals; test with known rooms |
| `Overworld_DecompressScreen()` needs game state (current screen) | Isolate — set only the vars it reads, clear after |
| WASM module not loaded for tests | `CachedGridProvider` with pre-built grid snapshots |
| Grid output differs from current TS decompression | Compare byte-for-byte during transition; WASM is authoritative |
| Performance (calling WASM per-screen) | Grid is 4KB, C builds it in <1ms; cache in provider if needed |
| Breaking existing tests during refactor | Keep `RomDataProvider` as shim until fully migrated |

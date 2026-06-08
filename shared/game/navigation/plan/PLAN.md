<!-- @layer shared-game @kind doc -->
# Navigation System Overhaul Plan

## Goal

Build a global flood-fill analysis tool that runs against the ROM and **updates** the existing
`/regions` and `/connections` datasets with accurate, tile-level navigation data. The analysis
tool is run offline (not during gameplay). The runtime pathfinder reads the enriched data.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  OFFLINE ANALYSIS (run once per ROM, or after code changes)          │
│                                                                      │
│  scripts/analyze-navigation.ts                                       │
│    ├── calls: analysis/global-flood.ts        (main orchestrator)    │
│    ├── calls: analysis/border-bundles.ts      (two-sided overlap)    │
│    ├── calls: analysis/entrance-resolver.ts   (ROM entrance table)   │
│    ├── calls: analysis/interior-flood.ts      (room layouts)         │
│    ├── calls: analysis/requirement-detector.ts (item gating)         │
│    └── outputs to:                                                   │
│         ├── shared/game/regions/  (UPDATES existing files)           │
│         └── shared/game/connections/ (UPDATES existing files)        │
└──────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ENRICHED DATA (checked into git, human-reviewable)                  │
│                                                                      │
│  shared/game/regions/light-world/overworld/index.ts                  │
│    → RegionDefinition + NEW navigation fields                        │
│  shared/game/connections/light-world/overworld/screen-adjacency.ts   │
│    → RegionConnection + NEW navigation fields                        │
└──────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│  RUNTIME PATHFINDER (used during gameplay)                            │
│                                                                      │
│  navigation/pathfinder/                                              │
│    → Reads enriched regions + connections                            │
│    → Given inventory, computes reachable graph                       │
│    → BFS/Dijkstra for shortest path between any two points           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Model Changes

### RegionDefinition — Add Navigation Fields

The existing `RegionDefinition` interface in `shared/game/types.ts` gets extended with
optional navigation fields. The analysis script fills these in. Human-curated fields
(`name`, `displayName`, `subtitle`, `tags`) are NEVER touched by the script.

```typescript
interface RegionDefinition {
  // ═══ EXISTING (never overwritten by script) ═══
  id: string;
  name: string;
  type: RegionType;
  inGameIndex?: number;
  dungeon?: string;
  displayName: string;
  subtitle?: string;
  gridX?: number;
  gridY?: number;
  floor?: number;
  big?: boolean;
  tags: readonly RegionTag[];

  // ═══ NEW: Navigation data (written by analysis script) ═══
  nav?: RegionNavData;
}

interface RegionNavData {
  /** Total tiles in this screen (always 4096 for overworld) */
  totalTiles: number;

  /** Tiles reachable with NO items from the primary entry point */
  freeTileCount: number;

  /** Tiles reachable with ALL items */
  maxReachableTileCount: number;

  /** Connection point IDs on this screen (references ConnectionPoint objects) */
  connectionPointIds: string[];

  /** Obstacles that gate navigation */
  obstacles: NavObstacle[];

  /** Notable features for routing */
  features: NavFeature[];

  /** If this screen has progression-dependent layout changes */
  variants?: NavVariant[];
}
```

### RegionConnection — Add Navigation Fields

The existing `RegionConnection` interface gets extended with accurate traversal data.
The script adds `nav` data; it never overwrites `from`, `to`, `entrance`, or `tags`.

```typescript
interface RegionConnection {
  // ═══ EXISTING (never overwritten by script) ═══
  from: string;
  to: string;
  entrance: string;
  tags: readonly ConnectionTag[];

  // ═══ NEW: Navigation data (written by analysis script) ═══
  nav?: ConnectionNavData;
}

interface ConnectionNavData {
  /** The type of physical traversal */
  transitType: ConnectionTransitType;

  /** Requirements for this specific connection. OR-of-AND. */
  requirements: string[][];

  /** Is this bidirectional? (redundant with tags but explicit for pathfinder) */
  bidirectional: boolean;

  /** For walk connections: connection point bundles on each side */
  fromPoint?: ConnectionPointData;
  toPoint?: ConnectionPointData;

  /** For walk connections: overlapping tile positions (the physical corridor) */
  overlapTiles?: number[];

  /** Traversal cost estimate (tile distance or 1 for doors/warps) */
  weight: number;

  /** If this connection is only valid in specific progression states */
  validAfter?: string;  // e.g. 'rain_ended', 'agahnim.0'
}
```

### ConnectionPointData — Inline Bundle Description

Stored inside `ConnectionNavData`, not as a separate top-level object.

```typescript
interface ConnectionPointData {
  /** Unique ID for cross-referencing */
  id: string;

  /** Which border/direction (for edge types) */
  direction?: 'n' | 's' | 'e' | 'w';

  /** Tile positions (0-63) in this bundle */
  tiles: number[];

  /** Requirements to reach this point from the screen interior */
  requirements: string[][];

  /** For entrances: grid position */
  position?: { row: number; col: number };

  /** For entrances: game entrance index */
  entranceIndex?: number;

  /** One-way restriction */
  oneWay?: 'exit' | 'enter' | null;
}
```

### NavObstacle — Obstacle on a Screen

```typescript
interface NavObstacle {
  position: { row: number; col: number };
  tileAttr: number;          // Raw ROM attribute
  type: string;              // 'bush' | 'light_rock' | 'dark_rock' | 'hammer_peg' | 'bonk_rock' | 'deep_water' | 'bombable_wall'
  requirements: string[][];  // OR-of-AND to clear/pass
  gatesPoint?: string;       // Connection point ID this obstacle blocks
}
```

### NavFeature — Notable Feature

```typescript
interface NavFeature {
  type: string;  // 'hookshot_target' | 'ledge' | 'fairy_fountain' | 'flute_landing' | etc.
  position: { row: number; col: number };
  metadata?: Record<string, unknown>;
}
```

### NavVariant — Progression Change

The game uses an **overlay-based variant system**: one base tilemap + conditional tile patches.
Two axes control which tiles are patched onto the base screen:

1. **`sram_progress_indicator`** (0–3): Global progress tier
   - 0 = intro (Link asleep)
   - 1 = post-uncle (rain, Zelda rescue in progress)
   - 2 = post-Sanctuary (rain stops, overworld unlocked)
   - 3 = post-Agahnim (Dark World access, Master Sword grove changes)

2. **`save_ow_event_info[screen] & 0x20`**: Per-screen event overlay
   - When set, `Overworld_LoadEventOverlay()` patches specific Map16 tiles into
     the screen tilemap (e.g., opened dungeon entrances, removed rocks).
   - Additional bits: `& 0x02` = bomb door opened (secondary overlay)

**Impact on flood fill**: The offline analysis currently runs against the BASE ROM tilemap
(decompressed Map32 → Map16). This misses event overlays that change passability. The runtime
widget now reports the current variant state. Future work: run flood fill multiple times per
screen — once per relevant variant — and store results keyed by variant.

```typescript
interface NavVariant {
  /** What triggers this variant */
  trigger: string;  // 'progress >= 2' | 'event_overlay' | 'agahnim.0' | 'master_sword' | etc.

  /** Affected tile positions (Map16 coordinates patched) */
  patchedTiles?: { pos: number; before: number; after: number }[];

  /** Connection points that become available */
  pointsAdded?: string[];

  /** Connection points that become unavailable */
  pointsRemoved?: string[];
}

/**
 * Runtime variant state (stored in FloodFillResult and ScreenVariant type).
 * Used to match analysis results to current game state.
 */
interface ScreenVariant {
  /** sram_progress_indicator: 0=intro, 1=post-uncle, 2=zelda-rescued, 3=agahnim-defeated */
  progressTier: number;
  /** save_ow_event_info[screen] & 0x20 — event overlay applied */
  eventOverlay: boolean;
  /** Full event flags byte for the screen */
  eventFlags: number;
}
```

### Key Screens With Variant Impact

| Screen | Variant Trigger | Effect |
|--------|-----------------|--------|
| 0x00 (Lost Woods) | Master Sword pulled (`ow_event[0x80] & 0x40`) | Forest overlay changes |
| 0x03–0x07 | `event & 0x20` | Rock pile at Map16 (16,14) removed |
| 0x18 (Kakariko) | `event & 0x20` | Entrance opened |
| 0x2A (Desert) | `event & 0x20` | Book/Ether tablet access |
| 0x30 (DW entrance) | `progress >= 3` | Portal appears |
| 0x33 (Hyrule Castle) | `progress >= 2` | Castle gate opens |
| 0x70 (Misery Mire entrance) | `event[0x70] & 0x20` | Rain stops on this screen |
| All LW screens | `progress < 2` | Rain overlay active |

### ConnectionTransitType

```typescript
type ConnectionTransitType =
  | 'walk'            // Screen border crossing
  | 'door'            // Enter/exit building
  | 'passage'         // Through-building connecting two areas
  | 'hole'            // Fall through pit
  | 'staircase'       // Interior stairs
  | 'ledge'           // One-way jump
  | 'mirror'          // DW → LW warp
  | 'flute'           // Flute teleport
  | 'dungeon_enter'   // Overworld → dungeon
  | 'dungeon_exit'    // Dungeon → overworld
  | 'whirlpool'       // Water warp
  | 'warp_tile'       // Dungeon warp pad
  ;
```

---

## Traversal Requirements (Full List)

Each must be tested and validated by the flood fill.

### I Can Build & Test Alone

| Requirement | Tile Attr | Current Status |
|-------------|-----------|----------------|
| `lift.1` | 0x50, 0x51 (bushes/signs) | ✅ Working |
| `lift.2` | 0x52, 0x55 (light rocks — Power Glove) | ✅ Working |
| `lift.3` | 0x53, 0x56 (dark rocks — Titan's Mitt) | ✅ Working |
| `hammer` | 0x54 (hammer pegs) | ✅ Working |
| `boots` | 0x57 (bonk rocks) | ✅ Working |
| `flippers` | 0x08, 0x0B (deep water) | ✅ Working |
| Ledges (one-way) | 0x28–0x2F | ✅ Cliff preprocessing handles |
| Free tiles | 0x00, 0x40, 0x48, 0x4A, etc. | ✅ Working |

**Note**: 0x40 (thick grass), 0x48, 0x4A (diggable ground) are FREE —
they do NOT block movement per `tile_detect.c` `TileDetect_ExecuteInner()`.
| Blocked tiles | 0x01, 0x02, 0x03 | ✅ Working |

### Need User Testing (In-Game Verification)

| # | Requirement | Question | Test Method |
|---|-------------|----------|-------------|
| 1 | `hammer` | Which attrs are hammer pegs? Is 0x54 a peg or dark rock? | Find hammer-peg screen, dump attrs |
| 2 | `hookshot` | Gap-crossing logic: max distance? Valid targets (0x27)? Crosses water? | Find hookshot-mandatory screen |
| 3 | `bombs` | Overworld bombable walls — distinct attr or same as blocked? | Find bombable overworld spot |
| 4 | `mirror` | Does it work on all DW tiles? Position-exact to LW? | Verify in-game at known spots |
| 5 | `sword` / `boomerang` | Can cut bushes (alternative to lift.1)? Which attrs? | Test bush cutting vs lifting |
| 6 | Interior rooms | How to read room tile data from ROM (different format) | Extract Link's House tiles |
| 7 | Dungeon keys | Key door attrs? Big key door attrs? | Check Eastern Palace ROM data |

---

## File Tree (New & Changed)

```
shared/game/
  types.ts                            ← UPDATE: extend RegionDefinition + RegionConnection
  flood-fill.ts                       ← DELETE (deprecated wrapper)

  navigation/
    PLAN.md                           ← THIS FILE
    navigation-data.types.ts          ← UPDATE: align with final model above
    index.ts                          ← UPDATE: clean exports, remove SCREEN_NAMES
    screen-names.ts                   ← NEW: extracted screen name map (all 128)
    tile-classification.ts            ← REWRITE: full attr mapping

    flood-fill/                       ← KEEP (still used for per-screen BFS)
      single-screen.ts
      multi-screen.ts
      orchestrator.ts
      index.ts

    screen-data/                      ← KEEP (ROM decompression, collision grids)
      collision-grid.ts
      cliff-preprocessing.ts
      decompression.ts
      rom-addresses.ts
      index.ts

    core/                             ← KEEP (utilities)
      grid-utils.ts
      inventory.ts
      priority-queue.ts
      path-reconstruct.ts
      index.ts

    analysis/                         ← NEW: offline analysis tool
      index.ts                        ← barrel
      global-flood.ts                 ← main: floods from Link's House outward
      border-bundles.ts               ← two-sided border overlap + bundle splitting
      entrance-resolver.ts            ← ROM entrance table → entrance positions
      interior-flood.ts               ← flood interior rooms
      requirement-detector.ts         ← item gating logic
      region-updater.ts               ← reads existing regions, merges nav data, writes back
      connection-updater.ts           ← reads existing connections, merges nav data, writes back

    pathfinder/                       ← NEW: runtime pathfinder (replaces screen-hop + route-planner)
      index.ts
      pathfinder.ts                   ← given enriched data + inventory → route
      graph-builder.ts                ← builds adjacency from connections for current inventory

    # DEPRECATED (remove after migration)
    screen-hop.ts                     ← REMOVE after pathfinder works
    route-planner.ts                  ← REMOVE after pathfinder works
    point-navigation.ts               ← REMOVE after pathfinder works
    hub-navigation.ts                 ← KEEP (region-level BFS still useful)

scripts/
  analyze-navigation.ts              ← NEW: entry point to run analysis
                                        calls sub-scripts, updates regions/connections

tests/navigation/
  # KEEP
  navigation.test.ts
  route-planner.test.ts

  # DELETE (exploratory)
  desert-internal.test.ts
  desert-maze.test.ts
  desert-path-check.test.ts

  # NEW: validation suite
  tile-classification.test.ts        ← attr → class mapping correctness
  border-bundles.test.ts             ← two-sided bundle detection
  global-flood.test.ts               ← full flood assertions
  traversal/
    lift.test.ts                     ← rocks, bushes (I can write)
    water.test.ts                    ← deep water + flippers (I can write)
    boots.test.ts                    ← bonk rocks (I can write)
    ledges.test.ts                   ← one-way jumps (I can write)
    hookshot.test.ts                 ← gap crossing (NEEDS USER)
    hammer.test.ts                   ← pegs (NEEDS USER)
    bombs.test.ts                    ← cracked walls (NEEDS USER)
    mirror.test.ts                   ← DW↔LW (NEEDS USER)
    entrances.test.ts                ← door/cave → interior (NEEDS USER for rooms)
```

---

## Script Architecture

### Entry Point: `scripts/analyze-navigation.ts`

```
Usage: npx tsx scripts/analyze-navigation.ts [options]

Options:
  --rom <path>         Path to ROM file (default: test-roms/...USA.sfc)
  --screens <range>    Only analyze specific screens (e.g. "0x00-0x3F" for LW)
  --update-regions     Update shared/game/regions/ files
  --update-connections Update shared/game/connections/ files
  --dry-run            Print what would change without writing
  --verbose            Show per-screen flood details
```

### Script Flow

```
1. Load ROM
2. Run global flood fill from Link's House
   ├── For each screen reached:
   │   ├── Detect border BUNDLES (contiguous reachable tiles per side)
   │   ├── Two-sided overlap check with each neighbor
   │   ├── Detect entrance tiles → resolve via ROM entrance table
   │   ├── Record obstacles encountered (rocks, water, pegs...)
   │   ├── Record requirements needed to reach each point
   │   └── Push discovered screens onto BFS queue
   ├── For each entrance discovered:
   │   ├── Flood interior room
   │   ├── Find all exits
   │   └── Connect exits back to overworld screens
   └── Repeat with increasing inventory (progressive unlock)

3. Call region-updater.ts:
   ├── Read existing region .ts files (parse AST or import)
   ├── For each region, merge nav data:
   │   ├── KEEP: id, name, displayName, subtitle, tags, gridX, gridY, etc.
   │   ├── ADD/UPDATE: nav.freeTileCount, nav.obstacles, nav.connectionPointIds...
   │   └── NEVER delete unknown fields
   └── Write back (preserving formatting where possible)

4. Call connection-updater.ts:
   ├── Read existing connection .ts files
   ├── For each existing connection, add nav data:
   │   ├── KEEP: from, to, entrance, tags
   │   ├── ADD/UPDATE: nav.transitType, nav.requirements, nav.overlapTiles...
   │   └── Flag connections with 0 overlap as INVALID (warning)
   ├── For NEW connections discovered (not in existing data):
   │   ├── Create new entries with auto-generated entrance names
   │   ├── Mark with tag 'auto:discovered' for human review
   │   └── Append to appropriate file
   └── Write back

5. Report:
   ├── Screens analyzed: N
   ├── Connections updated: N (with nav data added)
   ├── Connections flagged invalid: N (0 overlap)
   ├── New connections discovered: N
   └── Regions with nav data: N
```

### Sub-Scripts Called by the Main Script

| Sub-Script | Purpose | When Called |
|-----------|---------|-------------|
| `analysis/global-flood.ts` | Floods all reachable screens from Link's House | Step 2 |
| `analysis/border-bundles.ts` | Splits borders into bundles, checks overlap | Per screen pair |
| `analysis/entrance-resolver.ts` | Maps entrance tiles to room IDs | Per entrance found |
| `analysis/interior-flood.ts` | Floods rooms, finds exits | Per interior entered |
| `analysis/requirement-detector.ts` | Determines what items gate a path | Per obstacle hit |
| `analysis/region-updater.ts` | Merges nav data into region files | Step 3 |
| `analysis/connection-updater.ts` | Merges nav data into connection files | Step 4 |

---

## Update Strategy (Never Overwrite)

The updater scripts follow these rules:

1. **Parse existing**: Import the existing arrays from TS files
2. **Match by ID**: Find the existing entry by `id` (regions) or `from+to+entrance` (connections)
3. **Merge `nav` field**: Only touch the `nav` property. Everything else is sacred.
4. **Append new entries**: If flood fill discovers a connection not in the data, append it
   with `tags: ['auto:discovered']` so humans can review and rename/retag.
5. **Never delete**: If an existing connection has 0 overlap, add `nav.invalid: true`
   and emit a warning. Don't remove it — the human decides.
6. **Write with formatting**: Use the same code style (single quotes, trailing commas, etc.)

---

## Execution Order

### Phase 1: Foundation (no user input needed)

- [ ] Delete `shared/game/flood-fill.ts`, update imports
- [ ] Extract `screen-names.ts` from `index.ts`
- [ ] Update `shared/game/types.ts` with `nav?` fields on RegionDefinition + RegionConnection
- [ ] Create `analysis/` folder with skeleton files
- [ ] Create `scripts/analyze-navigation.ts` skeleton
- [ ] Rewrite `tile-classification.ts` (split lift.1 group properly)
- [ ] Implement `border-bundles.ts` (two-sided overlap + contiguous splitting)
- [ ] Write tests: `tile-classification.test.ts`, `border-bundles.test.ts`

### Phase 2: Per-Screen Analysis (partial user input)

- [ ] Implement `global-flood.ts` (overworld only, no interiors yet)
- [ ] Implement `requirement-detector.ts`
- [ ] Write tests: `lift.test.ts`, `water.test.ts`, `boots.test.ts`, `ledges.test.ts`
- [ ] **USER TEST**: hammer peg identification (attrs 0x52–0x56 split)
- [ ] **USER TEST**: hookshot gap logic
- [ ] **USER TEST**: sword/boomerang as bush-cutting alternatives

### Phase 3: Interior Rooms (user input needed)

- [ ] **USER TEST**: how interior room collision data is stored in ROM
- [ ] Implement `entrance-resolver.ts`
- [ ] Implement `interior-flood.ts`
- [ ] Write tests: `entrances.test.ts`
- [ ] **USER TEST**: dungeon key doors, big key doors

### Phase 4: Updater Scripts

- [ ] Implement `region-updater.ts`
- [ ] Implement `connection-updater.ts`
- [ ] Run full analysis → update all region and connection files
- [ ] Review diffs (human review of auto-discovered connections)

### Phase 5: Runtime Pathfinder

- [ ] Implement `pathfinder/graph-builder.ts` (reads enriched data)
- [ ] Implement `pathfinder/pathfinder.ts` (BFS/Dijkstra on connection graph)
- [ ] Replace `screen-hop.ts` + `route-planner.ts` with new pathfinder
- [ ] **USER TEST**: validate paths match in-game experience

### Phase 6: Advanced Traversal

- [ ] **USER TEST**: mirror warp mechanics
- [ ] **USER TEST**: flute destinations
- [ ] Progression variants (post-Agahnim, rain state)
- [ ] Dark World screens (full 0x40–0x7F)

---

## What the User Must Help With

### Test Session Format

For each requirement that needs verification, we'll:

1. I provide a test file in `tests/navigation/traversal/`
2. The test dumps tile attrs for a specific screen
3. User verifies in-game: "yes this tile at row X col Y is a hammer peg"
4. We update the classifier and re-run

### Specific Questions to Answer

| # | Topic | What I Need From You |
|---|-------|---------------------|
| 1 | **Hammer pegs** | Name a screen with hammer pegs. I'll dump attrs and you confirm which code = peg |
| 2 | **Hookshot targets** | Name a hookshot-required spot. What's the max range? Can it cross water? |
| 3 | **Bombs (overworld)** | Any overworld spot with a bombable wall? Or is that dungeons-only? |
| 4 | **Bush cutting** | Do sword AND boomerang BOTH clear bush tiles (0x48 etc.)? |
| 5 | **Interior rooms** | I'll try to extract Link's House room data. You verify it looks right. |
| 6 | **Attr 0x52-0x56 split** | I'll dump a screen with dark rocks AND hammer pegs. You tell me which is which. |
| 7 | **Mirror** | Confirm: works on ALL dark world overworld tiles? Or just specific spots? |

---

## File Deletions Summary

| File | Reason |
|------|--------|
| `shared/game/flood-fill.ts` | Deprecated wrapper, all consumers update to use `navigation/` |
| `tests/navigation/desert-internal.test.ts` | Exploratory, served its purpose |
| `tests/navigation/desert-maze.test.ts` | Exploratory |
| `tests/navigation/desert-path-check.test.ts` | Exploratory |
| `navigation/screen-hop.ts` | Replaced by pathfinder (Phase 5) |
| `navigation/route-planner.ts` | Replaced by pathfinder (Phase 5) |
| `navigation/point-navigation.ts` | Replaced by pathfinder (Phase 5) |

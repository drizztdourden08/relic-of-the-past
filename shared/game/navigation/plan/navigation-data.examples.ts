/**
 * EXAMPLES — What the enriched data looks like after the analysis script runs.
 * This file is for review only. Delete after approval.
 */

import type { RegionNavData, ConnectionNavData } from './navigation-data.types';

// ═══════════════════════════════════════════════════════════════════════════════
// REGION EXAMPLE: Screen 0x2C (Link's House area)
// ═══════════════════════════════════════════════════════════════════════════════

// BEFORE (current data in regions/light-world/overworld/index.ts):
const regionBefore = {
  id: 'lw-2c', name: "Uncle's Estate East", type: 'lightWorld', inGameIndex: 0x2c,
  displayName: 'Central Hyrule', gridX: 4, gridY: 5,
  tags: ['world:light', 'env:outside', 'type:overworld', 'area:south_hyrule'],
};

// AFTER (same object, nav field added by analysis script):
const regionAfter = {
  // ═══ UNTOUCHED by script ═══
  id: 'lw-2c', name: "Uncle's Estate East", type: 'lightWorld', inGameIndex: 0x2c,
  displayName: 'Central Hyrule', gridX: 4, gridY: 5,
  tags: ['world:light', 'env:outside', 'type:overworld', 'area:south_hyrule'],

  // ═══ ADDED by analysis script ═══
  nav: {
    totalTiles: 4096,
    freeTileCount: 3200,       // walkable with no items
    maxReachableTileCount: 3450, // walkable with all items (bushes cleared, rocks lifted)

    connectionPointIds: [
      'lw-2c-edge-n-0',   // north border, bundle 0 (left gap)
      'lw-2c-edge-n-1',   // north border, bundle 1 (right gap, separated by cliff)
      'lw-2c-edge-e-0',   // east border, single bundle
      'lw-2c-edge-s-0',   // south border, single bundle
      'lw-2c-edge-w-0',   // west border, bundle 0
      'lw-2c-edge-w-1',   // west border, bundle 1 (split by water)
      'lw-2c-door-0',     // Link's House entrance
    ],

    obstacles: [
      { position: { row: 20, col: 15 }, tileAttr: 0x48, type: 'bush', requirements: [['lift.1'], ['sword']], gatesPoint: undefined },
      { position: { row: 20, col: 16 }, tileAttr: 0x48, type: 'bush', requirements: [['lift.1'], ['sword']], gatesPoint: undefined },
      { position: { row: 35, col: 40 }, tileAttr: 0x52, type: 'dark_rock', requirements: [['lift.2']], gatesPoint: 'lw-2c-edge-e-0' },
    ],

    features: [
      { type: 'signpost', position: { row: 30, col: 32 } },
    ],
  } satisfies RegionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGION EXAMPLE: Screen 0x38 (Desert SW) — multiple bundles on one border
// ═══════════════════════════════════════════════════════════════════════════════

const desertRegion = {
  id: 'lw-38', name: 'Desert of Mystery SW', type: 'lightWorld', inGameIndex: 0x38,
  displayName: 'Desert of Mystery', gridX: 0, gridY: 7, big: true,
  tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'],

  nav: {
    totalTiles: 4096,
    freeTileCount: 2800,
    maxReachableTileCount: 3100,

    connectionPointIds: [
      'lw-38-edge-n-0',   // north border (46 tiles wide — connects to 0x30)
      'lw-38-edge-e-0',   // east border, bundle 0 (lower section, cols 40-63)
      'lw-38-edge-e-1',   // east border, bundle 1 (upper section, cols 5-20, behind rocks)
      'lw-38-door-0',     // Desert Palace entrance
      'lw-38-ledge-0',    // Ledge drop (one-way south)
    ],

    obstacles: [
      { position: { row: 12, col: 63 }, tileAttr: 0x52, type: 'dark_rock', requirements: [['lift.1']], gatesPoint: 'lw-38-edge-e-1' },
      { position: { row: 13, col: 63 }, tileAttr: 0x52, type: 'dark_rock', requirements: [['lift.1']], gatesPoint: 'lw-38-edge-e-1' },
    ],

    features: [
      { type: 'ledge_drop', position: { row: 50, col: 32 }, metadata: { direction: 's' } },
      { type: 'flute_landing', position: { row: 30, col: 30 } },
    ],
  } satisfies RegionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION EXAMPLE: Walk between 0x38 and 0x39 (Desert SW → Desert SE)
// ═══════════════════════════════════════════════════════════════════════════════

// BEFORE (current data in connections/light-world/overworld/screen-adjacency.ts):
const connectionBefore = {
  from: 'lw-38', to: 'lw-39',
  entrance: 'Desert of Mystery SW East to Desert of Mystery SE',
  tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'],
};

// AFTER:
const connectionAfter = {
  // ═══ UNTOUCHED by script ═══
  from: 'lw-38', to: 'lw-39',
  entrance: 'Desert of Mystery SW East to Desert of Mystery SE',
  tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'],

  // ═══ ADDED by analysis script ═══
  nav: {
    transitType: 'walk',
    requirements: [],  // no items needed — free walk
    bidirectional: true,
    weight: 64,        // ~64 tiles to cross border area

    fromPoint: {
      id: 'lw-38-edge-e-0',
      direction: 'e',
      tiles: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
      requirements: [],  // reachable from interior freely
      oneWay: null,
    },
    toPoint: {
      id: 'lw-39-edge-w-0',
      direction: 'w',
      tiles: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
      requirements: [],
      oneWay: null,
    },
    overlapTiles: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],  // 15 tiles of valid crossing

  } satisfies ConnectionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION EXAMPLE: Walk with requirements (gated by dark rocks)
// ═══════════════════════════════════════════════════════════════════════════════

const gatedConnection = {
  from: 'lw-38', to: 'lw-39',
  entrance: 'Desert of Mystery SW East (Upper) to Desert of Mystery SE',
  tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'auto:discovered'],

  nav: {
    transitType: 'walk',
    requirements: [['lift.1']],  // needs Titan's Mitt to reach this corridor
    bidirectional: true,
    weight: 64,

    fromPoint: {
      id: 'lw-38-edge-e-1',
      direction: 'e',
      tiles: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      requirements: [['lift.1']],  // dark rocks block path to upper east border
      oneWay: null,
    },
    toPoint: {
      id: 'lw-39-edge-w-1',
      direction: 'w',
      tiles: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      requirements: [],  // reachable from 0x39 interior freely
      oneWay: null,
    },
    overlapTiles: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],  // 11 overlap

  } satisfies ConnectionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION EXAMPLE: Door (Link's House)
// ═══════════════════════════════════════════════════════════════════════════════

const doorConnection = {
  // ═══ UNTOUCHED ═══
  from: 'lw-2c', to: 'links-house',
  entrance: 'Links House',
  tags: ['transit:door', 'dir:two-way', 'ctx:entrance'],

  // ═══ ADDED ═══
  nav: {
    transitType: 'door',
    requirements: [],
    bidirectional: true,
    weight: 1,  // instant transition

    fromPoint: {
      id: 'lw-2c-door-0',
      direction: undefined,
      tiles: [],
      requirements: [],
      position: { row: 45, col: 32 },  // entrance tile position on screen 0x2C
      entranceIndex: 0x0104,
      oneWay: null,
    },
    toPoint: {
      id: 'int-0104-exit-0',
      direction: undefined,
      tiles: [],
      requirements: [],
      position: { row: 56, col: 8 },  // spawn position inside the house
      entranceIndex: 0x0104,
      oneWay: null,
    },
  } satisfies ConnectionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION EXAMPLE: One-way ledge jump
// ═══════════════════════════════════════════════════════════════════════════════

const ledgeConnection = {
  from: 'maze-race-ledge', to: 'lw-28',
  entrance: 'Maze Race Ledge Drop',
  tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'],

  nav: {
    transitType: 'ledge',
    requirements: [],
    bidirectional: false,  // one-way: can only jump DOWN
    weight: 1,

    fromPoint: {
      id: 'lw-20-ledge-0',
      direction: 's',
      tiles: [30, 31, 32, 33, 34],
      requirements: [],
      oneWay: 'exit',  // can only EXIT from this point (jump off)
    },
    toPoint: {
      id: 'lw-28-edge-n-0',
      direction: 'n',
      tiles: [30, 31, 32, 33, 34],
      requirements: [],
      oneWay: 'enter',  // can only ENTER at this point (land here)
    },
    overlapTiles: [30, 31, 32, 33, 34],
  } satisfies ConnectionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION EXAMPLE: Flute warp (item-gated connection point)
// Flute is BOTH a traversal requirement AND creates connection points.
// Without flute: these landing points don't exist in the graph.
// With flute: you can warp FROM anywhere to these 8 fixed spots.
// ═══════════════════════════════════════════════════════════════════════════════

// The flute creates 8 connections: "anywhere on LW overworld" → landing spot.
// Each landing spot is a connection point on its screen.
// The desert flute spot is the ONLY way to reach desert ledge (for Desert Palace).
// Misery Mire portal is only reachable via flute spot #6 in DW.

const fluteConnection = {
  from: 'light-world',  // abstract "anywhere in LW" node
  to: 'lw-38',
  entrance: 'Flute Spot 6 (Desert)',
  tags: ['transit:flute', 'dir:one-way', 'ctx:overworld'],

  nav: {
    transitType: 'flute',
    requirements: [['flute']],  // item requirement on the CONNECTION
    bidirectional: false,       // can't "reverse flute" back
    weight: 1,                  // instant

    fromPoint: undefined,       // no physical source point (works from anywhere)
    toPoint: {
      id: 'lw-38-flute-0',
      direction: undefined,
      tiles: [],
      requirements: [['flute']],  // point only exists if you have flute
      position: { row: 30, col: 30 },  // landing position on screen
      oneWay: 'enter',  // can only arrive here, not "enter the flute" from this spot
    },
    overlapTiles: undefined,
  } satisfies ConnectionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION EXAMPLE: Passage (Two Brothers House — connects two screens)
// ═══════════════════════════════════════════════════════════════════════════════

const passageConnection = {
  from: 'lw-28', to: 'maze-race-ledge',
  entrance: 'Two Brothers House',
  tags: ['transit:door', 'dir:two-way', 'ctx:entrance'],

  nav: {
    transitType: 'passage',
    requirements: [['bombs'], ['boots']],  // need bombs OR boots to exit west side
    bidirectional: true,
    weight: 20,  // ~20 tiles to walk through the interior

    fromPoint: {
      id: 'lw-28-door-0',
      direction: undefined,
      tiles: [],
      requirements: [],
      position: { row: 22, col: 5 },
      entranceIndex: 0x011f,
      oneWay: null,
    },
    toPoint: {
      id: 'lw-20-door-0',
      direction: undefined,
      tiles: [],
      requirements: [['bombs'], ['boots']],  // cracked wall inside
      position: { row: 22, col: 60 },
      entranceIndex: 0x011f,
      oneWay: null,
    },
  } satisfies ConnectionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION EXAMPLE: Invalid (flagged by analysis — 0 overlap)
// ═══════════════════════════════════════════════════════════════════════════════

const invalidConnection = {
  from: 'lw-31', to: 'lw-29',
  entrance: 'Desert NE North to Eastern Palace',
  tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'],

  nav: {
    transitType: 'walk',
    requirements: [],
    bidirectional: true,
    weight: 0,
    invalid: true,  // ← FLAGGED: 0x31 north border=64 tiles, 0x29 south border=0 tiles

    fromPoint: {
      id: 'lw-31-edge-n-0',
      direction: 'n',
      tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
      requirements: [],
      oneWay: null,
    },
    toPoint: {
      id: 'lw-29-edge-s-0',
      direction: 's',
      tiles: [],  // EMPTY — south border is completely walled off
      requirements: [],
      oneWay: null,
    },
    overlapTiles: [],  // zero overlap = physically impossible
  } satisfies ConnectionNavData,
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTERIOR REGION EXAMPLE: Two Brothers House
// ═══════════════════════════════════════════════════════════════════════════════

const interiorRegion = {
  id: 'two-brothers-house', name: 'Two Brothers House', type: 'cave',
  displayName: 'Kakariko Village', inGameIndex: 0x011f,
  subtitle: 'Two Brothers House',
  tags: ['world:light', 'env:inside', 'type:house', 'area:kakariko', 'role:connector'],

  nav: {
    totalTiles: 512,  // smaller interior room
    freeTileCount: 180,
    maxReachableTileCount: 220,

    connectionPointIds: [
      'int-011f-exit-e',   // east door (to lw-28)
      'int-011f-exit-w',   // west door (to lw-20 / maze-race-ledge)
    ],

    obstacles: [
      { position: { row: 8, col: 4 }, tileAttr: 0x50, type: 'bombable_wall', requirements: [['bombs'], ['boots']], gatesPoint: 'int-011f-exit-w' },
    ],

    features: [],
  } satisfies RegionNavData,
};

import type { RegionDefinition } from '../../../types';

/**
 * Light World Overworld — All 64 screens (0x00–0x3F).
 * Each entry is 1:1 with a native game screen index.
 * Grid: 8 columns × 8 rows. Big areas span 2×2.
 */
export const LIGHT_WORLD_OVERWORLD_REGIONS: RegionDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════
  // ROW 0 (screens 0–7)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-00', name: 'Lost Woods NW', type: 'lightWorld', inGameIndex: 0x00,
    displayName: 'Lost Woods', gridX: 0, gridY: 0, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lost_woods'],
  },
  {
    id: 'lw-01', name: 'Lost Woods NE', type: 'lightWorld', inGameIndex: 0x01,
    displayName: 'Lost Woods', gridX: 1, gridY: 0, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lost_woods'],
  },
  {
    id: 'lw-02', name: 'Lumberjack Estate', type: 'lightWorld', inGameIndex: 0x02,
    displayName: 'Death Mountain', gridX: 2, gridY: 0,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-03', name: 'Tower of Hera NW', type: 'lightWorld', inGameIndex: 0x03,
    displayName: 'Death Mountain', gridX: 3, gridY: 0, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-04', name: 'Tower of Hera NE', type: 'lightWorld', inGameIndex: 0x04,
    displayName: 'Death Mountain', gridX: 4, gridY: 0, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-05', name: 'Death Mountain Bridge NW', type: 'lightWorld', inGameIndex: 0x05,
    displayName: 'Death Mountain', gridX: 5, gridY: 0, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-06', name: 'Death Mountain Bridge NE', type: 'lightWorld', inGameIndex: 0x06,
    displayName: 'Death Mountain', gridX: 6, gridY: 0, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-07', name: 'Turtle Rock', type: 'lightWorld', inGameIndex: 0x07,
    displayName: 'Death Mountain', gridX: 7, gridY: 0,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 1 (screens 8–15)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-08', name: 'Lost Woods SW', type: 'lightWorld', inGameIndex: 0x08,
    displayName: 'Lost Woods', gridX: 0, gridY: 1, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lost_woods'],
  },
  {
    id: 'lw-09', name: 'Lost Woods SE', type: 'lightWorld', inGameIndex: 0x09,
    displayName: 'Lost Woods', gridX: 1, gridY: 1, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lost_woods'],
  },
  {
    id: 'lw-0a', name: 'Death Mountain Gateway', type: 'lightWorld', inGameIndex: 0x0A,
    displayName: 'Death Mountain', gridX: 2, gridY: 1,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-0b', name: 'Tower of Hera SW', type: 'lightWorld', inGameIndex: 0x0B,
    displayName: 'Death Mountain', gridX: 3, gridY: 1, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-0c', name: 'Tower of Hera SE', type: 'lightWorld', inGameIndex: 0x0C,
    displayName: 'Death Mountain', gridX: 4, gridY: 1, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-0d', name: 'Mountain Bridge SW', type: 'lightWorld', inGameIndex: 0x0D,
    displayName: 'Death Mountain', gridX: 5, gridY: 1, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-0e', name: 'Mountain Bridge SE', type: 'lightWorld', inGameIndex: 0x0E,
    displayName: 'Death Mountain', gridX: 6, gridY: 1, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },
  {
    id: 'lw-0f', name: 'Zora Falls Outskirts', type: 'lightWorld', inGameIndex: 0x0F,
    displayName: 'Death Mountain', gridX: 7, gridY: 1,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 2 (screens 16–23)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-10', name: 'Lost Woods Outskirts', type: 'lightWorld', inGameIndex: 0x10,
    displayName: 'Lost Woods', gridX: 0, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lost_woods'],
  },
  {
    id: 'lw-11', name: 'Kakariko Psychics', type: 'lightWorld', inGameIndex: 0x11,
    displayName: 'Kakariko Village', gridX: 1, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-12', name: 'Northern Pond', type: 'lightWorld', inGameIndex: 0x12,
    displayName: 'Kakariko Village', gridX: 2, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-13', name: 'Sanctuary Grounds', type: 'lightWorld', inGameIndex: 0x13,
    displayName: 'Sanctuary', gridX: 3, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle', 'role:safe_zone'],
  },
  {
    id: 'lw-14', name: 'Graveyard', type: 'lightWorld', inGameIndex: 0x14,
    displayName: 'Sanctuary', gridX: 4, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-15', name: 'South Bend', type: 'lightWorld', inGameIndex: 0x15,
    displayName: 'Hyrule Castle', gridX: 5, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-16', name: 'Coven of Commerce', type: 'lightWorld', inGameIndex: 0x16,
    displayName: 'Hyrule Castle', gridX: 6, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-17', name: 'Zora Ridge', type: 'lightWorld', inGameIndex: 0x17,
    displayName: 'Eastern Hyrule', gridX: 7, gridY: 2,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 3 (screens 24–31)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-18', name: 'Kakariko NW', type: 'lightWorld', inGameIndex: 0x18,
    displayName: 'Kakariko Village', gridX: 0, gridY: 3, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-19', name: 'Kakariko NE', type: 'lightWorld', inGameIndex: 0x19,
    displayName: 'Kakariko Village', gridX: 1, gridY: 3, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-1a', name: 'West Woods', type: 'lightWorld', inGameIndex: 0x1A,
    displayName: 'Kakariko Village', gridX: 2, gridY: 3,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-1b', name: 'Hyrule Castle NW', type: 'lightWorld', inGameIndex: 0x1B,
    displayName: 'Hyrule Castle', gridX: 3, gridY: 3, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-1c', name: 'Hyrule Castle NE', type: 'lightWorld', inGameIndex: 0x1C,
    displayName: 'Hyrule Castle', gridX: 4, gridY: 3, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-1d', name: 'Castle East Bridge', type: 'lightWorld', inGameIndex: 0x1D,
    displayName: 'Hyrule Castle', gridX: 5, gridY: 3,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-1e', name: 'Eastern Ruins NW', type: 'lightWorld', inGameIndex: 0x1E,
    displayName: 'Eastern Hyrule', gridX: 6, gridY: 3, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },
  {
    id: 'lw-1f', name: 'Eastern Ruins NE', type: 'lightWorld', inGameIndex: 0x1F,
    displayName: 'Eastern Hyrule', gridX: 7, gridY: 3, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 4 (screens 32–39)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-20', name: 'Kakariko SW', type: 'lightWorld', inGameIndex: 0x20,
    displayName: 'Kakariko Village', gridX: 0, gridY: 4, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-21', name: 'Kakariko SE', type: 'lightWorld', inGameIndex: 0x21,
    displayName: 'Kakariko Village', gridX: 1, gridY: 4, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-22', name: 'Smithy Estate', type: 'lightWorld', inGameIndex: 0x22,
    displayName: 'Kakariko Village', gridX: 2, gridY: 4,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-23', name: 'Hyrule Castle SW', type: 'lightWorld', inGameIndex: 0x23,
    displayName: 'Hyrule Castle', gridX: 3, gridY: 4, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-24', name: 'Hyrule Castle SE', type: 'lightWorld', inGameIndex: 0x24,
    displayName: 'Hyrule Castle', gridX: 4, gridY: 4, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-25', name: 'Moundlands', type: 'lightWorld', inGameIndex: 0x25,
    displayName: 'Hyrule Castle', gridX: 5, gridY: 4,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'],
  },
  {
    id: 'lw-26', name: 'Eastern Ruins SW', type: 'lightWorld', inGameIndex: 0x26,
    displayName: 'Eastern Hyrule', gridX: 6, gridY: 4, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },
  {
    id: 'lw-27', name: 'Eastern Ruins SE', type: 'lightWorld', inGameIndex: 0x27,
    displayName: 'Eastern Hyrule', gridX: 7, gridY: 4, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 5 (screens 40–47)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-28', name: 'Kakariko Maze', type: 'lightWorld', inGameIndex: 0x28,
    displayName: 'Kakariko Village', gridX: 0, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-29', name: 'Kakariko South Annex', type: 'lightWorld', inGameIndex: 0x29,
    displayName: 'Kakariko Village', gridX: 1, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'],
  },
  {
    id: 'lw-2a', name: 'Haunted Grove', type: 'lightWorld', inGameIndex: 0x2A,
    displayName: 'Central Hyrule', gridX: 2, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:central_hyrule'],
  },
  {
    id: 'lw-2b', name: "Uncle's Estate West", type: 'lightWorld', inGameIndex: 0x2B,
    displayName: 'Central Hyrule', gridX: 3, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:central_hyrule'],
  },
  {
    id: 'lw-2c', name: "Uncle's Estate East", type: 'lightWorld', inGameIndex: 0x2C,
    displayName: 'Central Hyrule', gridX: 4, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:central_hyrule'],
  },
  {
    id: 'lw-2d', name: 'Eastern Ruins Bridge', type: 'lightWorld', inGameIndex: 0x2D,
    displayName: 'Eastern Hyrule', gridX: 5, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },
  {
    id: 'lw-2e', name: 'Eastern Ruins Ridge', type: 'lightWorld', inGameIndex: 0x2E,
    displayName: 'Eastern Hyrule', gridX: 6, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },
  {
    id: 'lw-2f', name: 'Eastern Cul-de-sac', type: 'lightWorld', inGameIndex: 0x2F,
    displayName: 'Eastern Hyrule', gridX: 7, gridY: 5,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 6 (screens 48–55)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-30', name: 'Desert of Mystery NW', type: 'lightWorld', inGameIndex: 0x30,
    displayName: 'Desert of Mystery', gridX: 0, gridY: 6, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'],
  },
  {
    id: 'lw-31', name: 'Desert of Mystery NE', type: 'lightWorld', inGameIndex: 0x31,
    displayName: 'Desert of Mystery', gridX: 1, gridY: 6, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'],
  },
  {
    id: 'lw-32', name: 'Haunted Terrace', type: 'lightWorld', inGameIndex: 0x32,
    displayName: 'Central Hyrule', gridX: 2, gridY: 6,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:south_hyrule'],
  },
  {
    id: 'lw-33', name: 'Hyrule Wetlands NW', type: 'lightWorld', inGameIndex: 0x33,
    displayName: 'Lake Hylia', gridX: 3, gridY: 6,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-34', name: 'Hyrule Wetlands NE', type: 'lightWorld', inGameIndex: 0x34,
    displayName: 'Lake Hylia', gridX: 4, gridY: 6,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-35', name: 'Lake Hylia NW', type: 'lightWorld', inGameIndex: 0x35,
    displayName: 'Lake Hylia', gridX: 5, gridY: 6, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-36', name: 'Lake Hylia NE', type: 'lightWorld', inGameIndex: 0x36,
    displayName: 'Lake Hylia', gridX: 6, gridY: 6, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-37', name: 'Frosty Caves', type: 'lightWorld', inGameIndex: 0x37,
    displayName: 'Death Mountain', gridX: 7, gridY: 6,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 7 (screens 56–63)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'lw-38', name: 'Desert of Mystery SW', type: 'lightWorld', inGameIndex: 0x38,
    displayName: 'Desert of Mystery', gridX: 0, gridY: 7, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'],
  },
  {
    id: 'lw-39', name: 'Desert of Mystery SE', type: 'lightWorld', inGameIndex: 0x39,
    displayName: 'Desert of Mystery', gridX: 1, gridY: 7, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'],
  },
  {
    id: 'lw-3a', name: 'Via of Mystery', type: 'lightWorld', inGameIndex: 0x3A,
    displayName: 'Desert of Mystery', gridX: 2, gridY: 7,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'],
  },
  {
    id: 'lw-3b', name: 'Watergate Grounds', type: 'lightWorld', inGameIndex: 0x3B,
    displayName: 'Lake Hylia', gridX: 3, gridY: 7,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-3c', name: 'Hyrule Wetlands Terrace', type: 'lightWorld', inGameIndex: 0x3C,
    displayName: 'Lake Hylia', gridX: 4, gridY: 7,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-3d', name: 'Lake Hylia SW', type: 'lightWorld', inGameIndex: 0x3D,
    displayName: 'Lake Hylia', gridX: 5, gridY: 7, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-3e', name: 'Lake Hylia SE', type: 'lightWorld', inGameIndex: 0x3E,
    displayName: 'Lake Hylia', gridX: 6, gridY: 7, big: true,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
  {
    id: 'lw-3f', name: 'Octorock Nesting Grounds', type: 'lightWorld', inGameIndex: 0x3F,
    displayName: 'Lake Hylia', gridX: 7, gridY: 7,
    tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'],
  },
];

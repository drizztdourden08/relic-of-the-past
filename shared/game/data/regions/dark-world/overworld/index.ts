import type { RegionDefinition } from '../../../types';

/**
 * Dark World Overworld — All 64 screens (0x40–0x7F).
 * Each entry is 1:1 with a native game screen index.
 * Grid: 8 columns × 8 rows. Big areas span 2×2.
 */
export const DARK_WORLD_OVERWORLD_REGIONS: RegionDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════
  // ROW 0 (screens 0x40–0x47)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-00', name: 'Skull Woods NW', type: 'darkWorld', indoor: false, inGameIndex: 0x40,
    displayName: 'Skull Woods', gridX: 0, gridY: 0, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:skull_woods_area'],
  },
  {
    id: 'dw-01', name: 'Skull Woods NE', type: 'darkWorld', indoor: false, inGameIndex: 0x41,
    displayName: 'Skull Woods', gridX: 1, gridY: 0, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:skull_woods_area'],
  },
  {
    id: 'dw-02', name: 'Eastern Skull Clearing', type: 'darkWorld', indoor: false, inGameIndex: 0x42,
    displayName: 'Dark Death Mountain', gridX: 2, gridY: 0,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-03', name: "Ganon's Tower NW", type: 'darkWorld', indoor: false, inGameIndex: 0x43,
    displayName: 'Dark Death Mountain', gridX: 3, gridY: 0, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-04', name: "Ganon's Tower NE", type: 'darkWorld', indoor: false, inGameIndex: 0x44,
    displayName: 'Dark Death Mountain', gridX: 4, gridY: 0, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-05', name: 'DW Death Mountain Bridge NW', type: 'darkWorld', indoor: false, inGameIndex: 0x45,
    displayName: 'Dark Death Mountain', gridX: 5, gridY: 0, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-06', name: 'DW Death Mountain Bridge NE', type: 'darkWorld', indoor: false, inGameIndex: 0x46,
    displayName: 'Dark Death Mountain', gridX: 6, gridY: 0, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-07', name: 'Turtle Rock', type: 'darkWorld', indoor: false, inGameIndex: 0x47,
    displayName: 'Dark Death Mountain', gridX: 7, gridY: 0,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 1 (screens 0x48–0x4F)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-08', name: 'Skull Woods SW', type: 'darkWorld', indoor: false, inGameIndex: 0x48,
    displayName: 'Skull Woods', gridX: 0, gridY: 1, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:skull_woods_area'],
  },
  {
    id: 'dw-09', name: 'Skull Woods SE', type: 'darkWorld', indoor: false, inGameIndex: 0x49,
    displayName: 'Skull Woods', gridX: 1, gridY: 1, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:skull_woods_area'],
  },
  {
    id: 'dw-0a', name: 'Bungie Cave Fun Zone', type: 'darkWorld', indoor: false, inGameIndex: 0x4A,
    displayName: 'Dark Death Mountain', gridX: 2, gridY: 1,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-0b', name: "Ganon's Tower SW", type: 'darkWorld', indoor: false, inGameIndex: 0x4B,
    displayName: 'Dark Death Mountain', gridX: 3, gridY: 1, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-0c', name: "Ganon's Tower SE", type: 'darkWorld', indoor: false, inGameIndex: 0x4C,
    displayName: 'Dark Death Mountain', gridX: 4, gridY: 1, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-0d', name: 'DW Death Mountain Bridge SW', type: 'darkWorld', indoor: false, inGameIndex: 0x4D,
    displayName: 'Dark Death Mountain', gridX: 5, gridY: 1, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-0e', name: 'DW Death Mountain Bridge SE', type: 'darkWorld', indoor: false, inGameIndex: 0x4E,
    displayName: 'Dark Death Mountain', gridX: 6, gridY: 1, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },
  {
    id: 'dw-0f', name: 'Falls of Ill Omen', type: 'darkWorld', indoor: false, inGameIndex: 0x4F,
    displayName: 'Dark Death Mountain', gridX: 7, gridY: 1,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 2 (screens 0x50–0x57)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-10', name: 'Skull Woods Outskirts', type: 'darkWorld', indoor: false, inGameIndex: 0x50,
    displayName: 'Skull Woods', gridX: 0, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:skull_woods_area'],
  },
  {
    id: 'dw-11', name: 'VoO Psychics', type: 'darkWorld', indoor: false, inGameIndex: 0x51,
    displayName: 'Village of Outcasts', gridX: 1, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-12', name: 'Northern Pond (Evil)', type: 'darkWorld', indoor: false, inGameIndex: 0x52,
    displayName: 'Village of Outcasts', gridX: 2, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-13', name: 'Unctuary Grounds', type: 'darkWorld', indoor: false, inGameIndex: 0x53,
    displayName: 'Dark Sanctuary', gridX: 3, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-14', name: 'Garden of Very Bad Things', type: 'darkWorld', indoor: false, inGameIndex: 0x54,
    displayName: 'Dark Sanctuary', gridX: 4, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-15', name: 'South Bend', type: 'darkWorld', indoor: false, inGameIndex: 0x55,
    displayName: 'Pyramid of Power', gridX: 5, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-16', name: 'Riverside Commerce', type: 'darkWorld', indoor: false, inGameIndex: 0x56,
    displayName: 'Pyramid of Power', gridX: 6, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-17', name: 'Ridge of Ill Omen', type: 'darkWorld', indoor: false, inGameIndex: 0x57,
    displayName: 'Dark Eastern', gridX: 7, gridY: 2,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 3 (screens 0x58–0x5F)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-18', name: 'Village of Outcasts NW', type: 'darkWorld', indoor: false, inGameIndex: 0x58,
    displayName: 'Village of Outcasts', gridX: 0, gridY: 3, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-19', name: 'Village of Outcasts NE', type: 'darkWorld', indoor: false, inGameIndex: 0x59,
    displayName: 'Village of Outcasts', gridX: 1, gridY: 3, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-1a', name: 'West Woods', type: 'darkWorld', indoor: false, inGameIndex: 0x5A,
    displayName: 'Village of Outcasts', gridX: 2, gridY: 3,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-1b', name: 'Pyramid of Power NW', type: 'darkWorld', indoor: false, inGameIndex: 0x5B,
    displayName: 'Pyramid of Power', gridX: 3, gridY: 3, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-1c', name: 'Pyramid of Power NE', type: 'darkWorld', indoor: false, inGameIndex: 0x5C,
    displayName: 'Pyramid of Power', gridX: 4, gridY: 3, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-1d', name: 'Pyramid East', type: 'darkWorld', indoor: false, inGameIndex: 0x5D,
    displayName: 'Pyramid of Power', gridX: 5, gridY: 3,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-1e', name: 'Maze of Darkness NW', type: 'darkWorld', indoor: false, inGameIndex: 0x5E,
    displayName: 'Dark Eastern', gridX: 6, gridY: 3, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },
  {
    id: 'dw-1f', name: 'Maze of Darkness NE', type: 'darkWorld', indoor: false, inGameIndex: 0x5F,
    displayName: 'Dark Eastern', gridX: 7, gridY: 3, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 4 (screens 0x60–0x67)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-20', name: 'Village of Outcasts SW', type: 'darkWorld', indoor: false, inGameIndex: 0x60,
    displayName: 'Village of Outcasts', gridX: 0, gridY: 4, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-21', name: 'Village of Outcasts SE', type: 'darkWorld', indoor: false, inGameIndex: 0x61,
    displayName: 'Village of Outcasts', gridX: 1, gridY: 4, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-22', name: 'Gossip Shop', type: 'darkWorld', indoor: false, inGameIndex: 0x62,
    displayName: 'Village of Outcasts', gridX: 2, gridY: 4,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-23', name: 'Pyramid of Power SW', type: 'darkWorld', indoor: false, inGameIndex: 0x63,
    displayName: 'Pyramid of Power', gridX: 3, gridY: 4, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-24', name: 'Pyramid of Power SE', type: 'darkWorld', indoor: false, inGameIndex: 0x64,
    displayName: 'Pyramid of Power', gridX: 4, gridY: 4, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-25', name: 'Moundlands', type: 'darkWorld', indoor: false, inGameIndex: 0x65,
    displayName: 'Pyramid of Power', gridX: 5, gridY: 4,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'],
  },
  {
    id: 'dw-26', name: 'Maze of Darkness SW', type: 'darkWorld', indoor: false, inGameIndex: 0x66,
    displayName: 'Dark Eastern', gridX: 6, gridY: 4, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },
  {
    id: 'dw-27', name: 'Maze of Darkness SE', type: 'darkWorld', indoor: false, inGameIndex: 0x67,
    displayName: 'Dark Eastern', gridX: 7, gridY: 4, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 5 (screens 0x68–0x6F)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-28', name: 'Digging Game Field', type: 'darkWorld', indoor: false, inGameIndex: 0x68,
    displayName: 'Village of Outcasts', gridX: 0, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-29', name: 'Archery Shop Grounds', type: 'darkWorld', indoor: false, inGameIndex: 0x69,
    displayName: 'Village of Outcasts', gridX: 1, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'],
  },
  {
    id: 'dw-2a', name: 'Depressing Grove', type: 'darkWorld', indoor: false, inGameIndex: 0x6A,
    displayName: 'Dark Central', gridX: 2, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_south'],
  },
  {
    id: 'dw-2b', name: 'Bomb Shop Grounds West', type: 'darkWorld', indoor: false, inGameIndex: 0x6B,
    displayName: 'Dark Central', gridX: 3, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_south'],
  },
  {
    id: 'dw-2c', name: 'Bomb Shop Grounds', type: 'darkWorld', indoor: false, inGameIndex: 0x6C,
    displayName: 'Dark Central', gridX: 4, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_south'],
  },
  {
    id: 'dw-2d', name: 'Hammer Time Bridge', type: 'darkWorld', indoor: false, inGameIndex: 0x6D,
    displayName: 'Dark Eastern', gridX: 5, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },
  {
    id: 'dw-2e', name: 'Terrace of Darkness', type: 'darkWorld', indoor: false, inGameIndex: 0x6E,
    displayName: 'Dark Eastern', gridX: 6, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },
  {
    id: 'dw-2f', name: 'Cul-de-sac of Darkness', type: 'darkWorld', indoor: false, inGameIndex: 0x6F,
    displayName: 'Dark Eastern', gridX: 7, gridY: 5,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 6 (screens 0x70–0x77)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-30', name: 'Swamp of Evil NW', type: 'darkWorld', indoor: false, inGameIndex: 0x70,
    displayName: 'Swamp of Evil', gridX: 0, gridY: 6, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_mire'],
  },
  {
    id: 'dw-31', name: 'Swamp of Evil NE', type: 'darkWorld', indoor: false, inGameIndex: 0x71,
    displayName: 'Swamp of Evil', gridX: 1, gridY: 6, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_mire'],
  },
  {
    id: 'dw-32', name: 'Depressing Terrace', type: 'darkWorld', indoor: false, inGameIndex: 0x72,
    displayName: 'Dark Central', gridX: 2, gridY: 6,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_south'],
  },
  {
    id: 'dw-33', name: 'Wilted Wetlands NW', type: 'darkWorld', indoor: false, inGameIndex: 0x73,
    displayName: 'Dark Lake', gridX: 3, gridY: 6,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
  {
    id: 'dw-34', name: 'Wilted Wetlands NE', type: 'darkWorld', indoor: false, inGameIndex: 0x74,
    displayName: 'Dark Lake', gridX: 4, gridY: 6,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
  {
    id: 'dw-35', name: 'Lake Dielia NW', type: 'darkWorld', indoor: false, inGameIndex: 0x75,
    displayName: 'Dark Lake', gridX: 5, gridY: 6, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
  {
    id: 'dw-36', name: 'Lake Dielia NE', type: 'darkWorld', indoor: false, inGameIndex: 0x76,
    displayName: 'Dark Lake', gridX: 6, gridY: 6, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
  {
    id: 'dw-37', name: 'Info Hub', type: 'darkWorld', indoor: false, inGameIndex: 0x77,
    displayName: 'Dark Lake', gridX: 7, gridY: 6,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ROW 7 (screens 0x78–0x7F)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'dw-38', name: 'Swamp of Evil SW', type: 'darkWorld', indoor: false, inGameIndex: 0x78,
    displayName: 'Swamp of Evil', gridX: 0, gridY: 7, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_mire'],
  },
  {
    id: 'dw-39', name: 'Swamp of Evil SE', type: 'darkWorld', indoor: false, inGameIndex: 0x79,
    displayName: 'Swamp of Evil', gridX: 1, gridY: 7, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_mire'],
  },
  {
    id: 'dw-3a', name: 'Via To Nowhere', type: 'darkWorld', indoor: false, inGameIndex: 0x7A,
    displayName: 'Swamp of Evil', gridX: 2, gridY: 7,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_mire'],
  },
  {
    id: 'dw-3b', name: 'Swamp Palace Grounds', type: 'darkWorld', indoor: false, inGameIndex: 0x7B,
    displayName: 'Swamp of Evil', gridX: 3, gridY: 7,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_mire'],
  },
  {
    id: 'dw-3c', name: 'Wilted Terrace', type: 'darkWorld', indoor: false, inGameIndex: 0x7C,
    displayName: 'Dark Lake', gridX: 4, gridY: 7,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
  {
    id: 'dw-3d', name: 'Lake Dielia SW', type: 'darkWorld', indoor: false, inGameIndex: 0x7D,
    displayName: 'Dark Lake', gridX: 5, gridY: 7, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
  {
    id: 'dw-3e', name: 'Lake Dielia SE', type: 'darkWorld', indoor: false, inGameIndex: 0x7E,
    displayName: 'Dark Lake', gridX: 6, gridY: 7, big: true,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
  {
    id: 'dw-3f', name: 'A Terrible Vacation Spot', type: 'darkWorld', indoor: false, inGameIndex: 0x7F,
    displayName: 'Dark Lake', gridX: 7, gridY: 7,
    tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'],
  },
];

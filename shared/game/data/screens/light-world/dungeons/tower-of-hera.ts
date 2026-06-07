/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../../types';

const TOWER_OF_HERA_DUNGEON: ScreenDefinition[] = [
  {
    id: 'toh-0x07',
    name: 'Moldorm',
    type: 'dungeon', world: 'light',
    location: 'Tower of Hera', area: 'Death Mountain',
    roomIndex: 0x07,
    dungeon: { palaceIndex: 0x08, floor: 5, gridX: 7, gridY: 0 },
    tags: [
      'env:underground',
      'role:boss',
    ],
  },
  {
    id: 'toh-0x17',
    name: 'Big Chest Room',
    type: 'dungeon', world: 'light',
    location: 'Tower of Hera', area: 'Death Mountain',
    roomIndex: 0x17,
    dungeon: { palaceIndex: 0x08, floor: 4, gridX: 7, gridY: 1 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'toh-0x27',
    name: 'Compass Room',
    type: 'dungeon', world: 'light',
    location: 'Tower of Hera', area: 'Death Mountain',
    roomIndex: 0x27,
    dungeon: { palaceIndex: 0x08, floor: 2, gridX: 7, gridY: 2 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'toh-0x31',
    name: 'Tile Room',
    type: 'dungeon', world: 'light',
    location: 'Tower of Hera', area: 'Death Mountain',
    roomIndex: 0x31,
    dungeon: { palaceIndex: 0x08, floor: 1, gridX: 1, gridY: 3 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'toh-0x77',
    name: 'Entrance Hall',
    type: 'dungeon', world: 'light',
    location: 'Tower of Hera', area: 'Death Mountain',
    roomIndex: 0x77,
    dungeon: { palaceIndex: 0x08, floor: 0, gridX: 7, gridY: 7 },
    tags: [
      'env:underground',
      'role:entrance',
      'role:hub',
    ],
  },
  {
    id: 'toh-0x87',
    name: 'Basement Cage',
    type: 'dungeon', world: 'light',
    location: 'Tower of Hera', area: 'Death Mountain',
    roomIndex: 0x87,
    dungeon: { palaceIndex: 0x08, floor: -1, gridX: 7, gridY: 8 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'toh-0xa7',
    name: 'Fairy Room',
    type: 'dungeon', world: 'light',
    location: 'Tower of Hera', area: 'Death Mountain',
    roomIndex: 0xA7,
    dungeon: { palaceIndex: 0x08, floor: 3, gridX: 7, gridY: 10 },
    tags: [
      'env:underground',
      'role:safe',
    ],
  },
];

export { TOWER_OF_HERA_DUNGEON };

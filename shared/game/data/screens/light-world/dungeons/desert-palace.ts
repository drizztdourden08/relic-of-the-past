/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../../types';

const DESERT_PALACE_DUNGEON: ScreenDefinition[] = [
  {
    id: 'dp-0x33',
    name: 'Lanmolas',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x33,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 3, gridY: 3 },
    tags: [
      'env:underground',
      'role:boss',
    ],
  },
  {
    id: 'dp-0x43',
    name: 'Popos Room',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x43,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 3, gridY: 4 },
    tags: [
      'env:underground',
      'role:connector',
    ],
  },
  {
    id: 'dp-0x53',
    name: 'Torch Puzzle',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x53,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 3, gridY: 5 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'dp-0x63',
    name: 'Big Chest Room',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x63,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 3, gridY: 6 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'dp-0x73',
    name: 'Map Room',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x73,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 3, gridY: 7 },
    tags: [
      'env:underground',
      'role:connector',
    ],
  },
  {
    id: 'dp-0x74',
    name: 'Big Key Room',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x74,
    dungeon: { palaceIndex: 0x06, floor: -1, gridX: 4, gridY: 7 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'dp-0x75',
    name: 'Compass Room',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x75,
    dungeon: { palaceIndex: 0x06, floor: -1, gridX: 5, gridY: 7 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'dp-0x83',
    name: 'West Entrance',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x83,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 3, gridY: 8 },
    tags: [
      'env:underground',
      'role:entrance',
    ],
  },
  {
    id: 'dp-0x84',
    name: 'Main Entrance',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x84,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 4, gridY: 8 },
    tags: [
      'env:underground',
      'role:entrance',
      'role:hub',
    ],
  },
  {
    id: 'dp-0x85',
    name: 'East Entrance',
    type: 'dungeon', world: 'light',
    location: 'Desert Palace', area: 'Desert',
    roomIndex: 0x85,
    dungeon: { palaceIndex: 0x06, floor: 0, gridX: 5, gridY: 8 },
    tags: [
      'env:underground',
      'role:entrance',
    ],
  },
];

export { DESERT_PALACE_DUNGEON };

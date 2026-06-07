/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../../types';

const CASTLE_TOWER_DUNGEON: ScreenDefinition[] = [
  {
    id: 'ct-0x20',
    name: 'Agahnim',
    type: 'dungeon', world: 'light',
    location: 'Castle Tower', area: 'Hyrule Castle',
    roomIndex: 0x20,
    dungeon: { palaceIndex: 0x1A, floor: 6, gridX: 0, gridY: 2 },
    tags: [
      'env:underground',
      'role:boss',
    ],
  },
  {
    id: 'ct-0x30',
    name: 'Final Bridge',
    type: 'dungeon', world: 'light',
    location: 'Castle Tower', area: 'Hyrule Castle',
    roomIndex: 0x30,
    dungeon: { palaceIndex: 0x1A, floor: 5, gridX: 0, gridY: 3 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'ct-0x40',
    name: 'Dark Maze',
    type: 'dungeon', world: 'light',
    location: 'Castle Tower', area: 'Hyrule Castle',
    roomIndex: 0x40,
    dungeon: { palaceIndex: 0x1A, floor: 4, gridX: 0, gridY: 4 },
    tags: [
      'env:underground',
      'hazard:dark',
      'role:puzzle',
    ],
  },
  {
    id: 'ct-0xb0',
    name: 'Dark Archer Room',
    type: 'dungeon', world: 'light',
    location: 'Castle Tower', area: 'Hyrule Castle',
    roomIndex: 0xB0,
    dungeon: { palaceIndex: 0x1A, floor: 3, gridX: 0, gridY: 11 },
    tags: [
      'env:underground',
      'hazard:dark',
    ],
  },
  {
    id: 'ct-0xc0',
    name: 'Circle of Pots',
    type: 'dungeon', world: 'light',
    location: 'Castle Tower', area: 'Hyrule Castle',
    roomIndex: 0xC0,
    dungeon: { palaceIndex: 0x1A, floor: 2, gridX: 0, gridY: 12 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'ct-0xd0',
    name: 'Guard Room',
    type: 'dungeon', world: 'light',
    location: 'Castle Tower', area: 'Hyrule Castle',
    roomIndex: 0xD0,
    dungeon: { palaceIndex: 0x1A, floor: 1, gridX: 0, gridY: 13 },
    tags: [
      'env:underground',
      'role:connector',
    ],
  },
  {
    id: 'ct-0xe0',
    name: 'Entrance Hall',
    type: 'dungeon', world: 'light',
    location: 'Castle Tower', area: 'Hyrule Castle',
    roomIndex: 0xE0,
    dungeon: { palaceIndex: 0x1A, floor: 0, gridX: 0, gridY: 14 },
    tags: [
      'env:underground',
      'role:entrance',
    ],
  },
];

export { CASTLE_TOWER_DUNGEON };

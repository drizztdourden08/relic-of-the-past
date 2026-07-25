/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../../types';

const THIEVES_TOWN_DUNGEON: ScreenDefinition[] = [
  {
    id: 'tt-0x44',
    name: 'Big Key Room',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0x44,
    dungeon: { palaceIndex: 0x16, floor: -1, gridX: 4, gridY: 4 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'tt-0x45',
    name: 'Ambush Room',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0x45,
    dungeon: { palaceIndex: 0x16, floor: -1, gridX: 5, gridY: 4 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'tt-0x64',
    name: 'Rail Room',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0x64,
    dungeon: { palaceIndex: 0x16, floor: -1, gridX: 4, gridY: 6 },
    tags: [
      'env:underground',
      'role:connector',
    ],
  },
  {
    id: 'tt-0x65',
    name: 'Blind the Thief',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0x65,
    dungeon: { palaceIndex: 0x16, floor: -1, gridX: 5, gridY: 6 },
    tags: [
      'env:underground',
      'role:boss',
    ],
  },
  {
    id: 'tt-0xab',
    name: 'Spike Switch Room',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xAB,
    dungeon: { palaceIndex: 0x16, floor: -2, gridX: 11, gridY: 10 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'tt-0xac',
    name: 'Attic',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xAC,
    dungeon: { palaceIndex: 0x16, floor: 0, gridX: 12, gridY: 10 },
    tags: [
      'env:underground',
      'role:connector',
    ],
  },
  {
    id: 'tt-0xbb',
    name: 'Big Chest Room',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xBB,
    dungeon: { palaceIndex: 0x16, floor: -2, gridX: 11, gridY: 11 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'tt-0xbc',
    name: 'Cell Block',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xBC,
    dungeon: { palaceIndex: 0x16, floor: -2, gridX: 12, gridY: 11 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'tt-0xcb',
    name: 'Hellway',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xCB,
    dungeon: { palaceIndex: 0x16, floor: -1, gridX: 11, gridY: 12 },
    tags: [
      'env:underground',
      'role:connector',
    ],
  },
  {
    id: 'tt-0xcc',
    name: 'Map Chest Room',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xCC,
    dungeon: { palaceIndex: 0x16, floor: -1, gridX: 12, gridY: 12 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'tt-0xdb',
    name: 'Compass Room',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xDB,
    dungeon: { palaceIndex: 0x16, floor: -1, gridX: 11, gridY: 13 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'tt-0xdc',
    name: 'Entrance Hall',
    type: 'dungeon', world: 'dark',
    location: 'Thieves\' Town', area: 'Village Of Outcasts',
    roomIndex: 0xDC,
    dungeon: { palaceIndex: 0x16, floor: 0, gridX: 12, gridY: 13 },
    tags: [
      'env:underground',
      'role:entrance',
      'role:hub',
    ],
  },
];

export { THIEVES_TOWN_DUNGEON };

/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../../types';

const SKULL_WOODS_DUNGEON: ScreenDefinition[] = [
  {
    id: 'sw-0x29',
    name: 'Mothula',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x29,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 9, gridY: 2 },
    tags: [
      'env:underground',
      'role:boss',
    ],
  },
  {
    id: 'sw-0x39',
    name: 'Gibdo Key Room',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x39,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 9, gridY: 3 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'sw-0x49',
    name: 'Compass Room',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x49,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 9, gridY: 4 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'sw-0x56',
    name: 'Big Chest Room',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x56,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 6, gridY: 5 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'sw-0x57',
    name: 'Big Key Room',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x57,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 7, gridY: 5 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'sw-0x58',
    name: 'Map Room',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x58,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 8, gridY: 5 },
    tags: [
      'env:underground',
      'loot:chest',
      'role:hub',
    ],
  },
  {
    id: 'sw-0x59',
    name: 'Pot Prison',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x59,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 9, gridY: 5 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'sw-0x67',
    name: 'Pinball Room',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x67,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 7, gridY: 6 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'sw-0x68',
    name: 'Entrance Hall',
    type: 'dungeon', world: 'dark',
    location: 'Skull Woods', area: 'Skull Woods Area',
    roomIndex: 0x68,
    dungeon: { palaceIndex: 0x0E, floor: -1, gridX: 8, gridY: 6 },
    tags: [
      'env:underground',
      'role:entrance',
    ],
  },
];

export { SKULL_WOODS_DUNGEON };

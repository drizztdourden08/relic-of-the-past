/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../../types';

const PALACE_OF_DARKNESS_DUNGEON: ScreenDefinition[] = [
  {
    id: 'pod-0x09',
    name: 'Dark Maze',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x09,
    dungeon: { palaceIndex: 0x0C, floor: -2, gridX: 9, gridY: 0 },
    tags: [
      'env:underground',
      'hazard:dark',
      'role:puzzle',
    ],
  },
  {
    id: 'pod-0x0a',
    name: 'Shooter Room',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x0A,
    dungeon: { palaceIndex: 0x0C, floor: -2, gridX: 10, gridY: 0 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'pod-0x0b',
    name: 'Turtle Room',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x0B,
    dungeon: { palaceIndex: 0x0C, floor: -2, gridX: 11, gridY: 0 },
    tags: [
      'env:underground',
      'role:hub',
    ],
  },
  {
    id: 'pod-0x19',
    name: 'Dark Basement',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x19,
    dungeon: { palaceIndex: 0x0C, floor: -2, gridX: 9, gridY: 1 },
    tags: [
      'env:underground',
      'hazard:dark',
    ],
  },
  {
    id: 'pod-0x1a',
    name: 'Warps Room',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x1A,
    dungeon: { palaceIndex: 0x0C, floor: -2, gridX: 10, gridY: 1 },
    tags: [
      'env:underground',
      'role:hub',
    ],
  },
  {
    id: 'pod-0x1b',
    name: 'Map Chest Room',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x1B,
    dungeon: { palaceIndex: 0x0C, floor: -2, gridX: 11, gridY: 1 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'pod-0x2a',
    name: 'Big Hub',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x2A,
    dungeon: { palaceIndex: 0x0C, floor: -1, gridX: 10, gridY: 2 },
    tags: [
      'env:underground',
      'role:hub',
    ],
  },
  {
    id: 'pod-0x2b',
    name: 'Conveyor Bridge',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x2B,
    dungeon: { palaceIndex: 0x0C, floor: -1, gridX: 11, gridY: 2 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'pod-0x3a',
    name: 'Compass Room',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x3A,
    dungeon: { palaceIndex: 0x0C, floor: -1, gridX: 10, gridY: 3 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'pod-0x3b',
    name: 'Stalfos Pit',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x3B,
    dungeon: { palaceIndex: 0x0C, floor: -1, gridX: 11, gridY: 3 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'pod-0x4a',
    name: 'Entrance Hall',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x4A,
    dungeon: { palaceIndex: 0x0C, floor: 0, gridX: 10, gridY: 4 },
    tags: [
      'env:underground',
      'role:entrance',
      'role:hub',
    ],
  },
  {
    id: 'pod-0x4b',
    name: 'Rupee Room',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x4B,
    dungeon: { palaceIndex: 0x0C, floor: 0, gridX: 11, gridY: 4 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'pod-0x5a',
    name: 'Hammer Bridge',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x5A,
    dungeon: { palaceIndex: 0x0C, floor: -1, gridX: 10, gridY: 5 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'pod-0x6a',
    name: 'Helmasaur King',
    type: 'dungeon', world: 'dark',
    location: 'Palace of Darkness', area: 'Dark East',
    roomIndex: 0x6A,
    dungeon: { palaceIndex: 0x0C, floor: -2, gridX: 10, gridY: 6 },
    tags: [
      'env:underground',
      'role:boss',
    ],
  },
];

export { PALACE_OF_DARKNESS_DUNGEON };

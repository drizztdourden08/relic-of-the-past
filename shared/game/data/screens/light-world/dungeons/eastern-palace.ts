/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../../types';

const EASTERN_PALACE_DUNGEON: ScreenDefinition[] = [
  {
    id: 'ep-0x89',
    name: 'Eyegore Key Room',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0x89,
    dungeon: { palaceIndex: 0x04, floor: 1, gridX: 9, gridY: 8 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'ep-0x99',
    name: 'Stalfos Spawn',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0x99,
    dungeon: { palaceIndex: 0x04, floor: 1, gridX: 9, gridY: 9 },
    tags: [
      'env:underground',
      'role:connector',
    ],
  },
  {
    id: 'ep-0xa8',
    name: 'Big Chest Room',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xA8,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 8, gridY: 10 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'ep-0xa9',
    name: 'Big Key Room',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xA9,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 9, gridY: 10 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'ep-0xaa',
    name: 'Dark Eyegore Room',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xAA,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 10, gridY: 10 },
    tags: [
      'env:underground',
      'hazard:dark',
    ],
  },
  {
    id: 'ep-0xb8',
    name: 'West Cannonball',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xB8,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 8, gridY: 11 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'ep-0xb9',
    name: 'Lobby',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xB9,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 9, gridY: 11 },
    tags: [
      'env:underground',
      'role:hub',
    ],
  },
  {
    id: 'ep-0xba',
    name: 'East Cannonball',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xBA,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 10, gridY: 11 },
    tags: [
      'env:underground',
      'role:puzzle',
    ],
  },
  {
    id: 'ep-0xc8',
    name: 'Map Chest Room',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xC8,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 8, gridY: 12 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'ep-0xc9',
    name: 'Entrance Hall',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xC9,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 9, gridY: 12 },
    tags: [
      'env:underground',
      'role:entrance',
    ],
  },
  {
    id: 'ep-0xd8',
    name: 'Compass Room',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xD8,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 8, gridY: 13 },
    tags: [
      'env:underground',
      'loot:chest',
    ],
  },
  {
    id: 'ep-0xd9',
    name: 'Armos Knights',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xD9,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 9, gridY: 13 },
    tags: [
      'env:underground',
      'role:boss',
    ],
  },
  {
    id: 'ep-0xda',
    name: 'Boss Reward',
    type: 'dungeon', world: 'light',
    location: 'Eastern Palace', area: 'East Hyrule',
    roomIndex: 0xDA,
    dungeon: { palaceIndex: 0x04, floor: 0, gridX: 10, gridY: 13 },
    tags: [
      'env:underground',
      'loot:boss-drop',
    ],
  },
];

export { EASTERN_PALACE_DUNGEON };

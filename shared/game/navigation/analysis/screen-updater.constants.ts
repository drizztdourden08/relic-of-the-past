/* @layer shared-game @kind constants */
import type { NavObstacle } from '@rotp/game-data';

const OBSTACLE_ATTR_RANGES: readonly { first: number; last: number; type: NavObstacle['type'] }[] = [
  { first: 0x50, last: 0x57, type: 'light_rock' },
  { first: 0x58, last: 0x5f, type: 'dark_rock' },
  { first: 0x44, last: 0x47, type: 'bush' },
  { first: 0x4a, last: 0x4b, type: 'hammer_peg' },
  { first: 0x66, last: 0x66, type: 'deep_water' },
  { first: 0x62, last: 0x63, type: 'bombable_wall' },
  { first: 0x6c, last: 0x6c, type: 'spike_floor' },
];

export { OBSTACLE_ATTR_RANGES };

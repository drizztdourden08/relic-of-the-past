/* @layer shared-game @kind data */
import type { CheckRecord } from '../types';
import { DARK_WORLD_CHECKS } from './dark-world';
import { DUNGEON_CHECKS } from './dungeons';
import { LIGHT_WORLD_CHECKS } from './light-world';

const ALL_CHECKS: CheckRecord[] = [
  ...DARK_WORLD_CHECKS,
  ...DUNGEON_CHECKS,
  ...LIGHT_WORLD_CHECKS,
];

export { ALL_CHECKS };

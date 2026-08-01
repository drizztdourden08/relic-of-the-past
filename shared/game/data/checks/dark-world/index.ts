/* @layer shared-game @kind barrel */
import type { CheckRecord } from '../../types';
import { DW_DARK_DEATH_MOUNTAIN_CHECKS } from './dark-death-mountain';
import { DW_DARK_EAST_CHECKS } from './dark-east';
import { DW_DARK_MIRE_CHECKS } from './dark-mire';
import { DW_DARK_NORTH_CHECKS } from './dark-north';
import { DW_DARK_SOUTH_CHECKS } from './dark-south';
import { DW_VILLAGE_OF_OUTCASTS_CHECKS } from './village-of-outcasts';

const DARK_WORLD_CHECKS: CheckRecord[] = [
  ...DW_DARK_DEATH_MOUNTAIN_CHECKS,
  ...DW_DARK_EAST_CHECKS,
  ...DW_DARK_MIRE_CHECKS,
  ...DW_DARK_NORTH_CHECKS,
  ...DW_DARK_SOUTH_CHECKS,
  ...DW_VILLAGE_OF_OUTCASTS_CHECKS,
];

export { DARK_WORLD_CHECKS };

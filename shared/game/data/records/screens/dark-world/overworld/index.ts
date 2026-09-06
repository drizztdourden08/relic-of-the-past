/* @layer shared-game @kind data */
import type { ScreenRecord } from '@shared/game/data/types';
import { DW_OVERWORLD_DARK_DEATH_MOUNTAIN_SCREENS_1 } from './dark-death-mountain-1';
import { DW_OVERWORLD_DARK_DEATH_MOUNTAIN_SCREENS_2 } from './dark-death-mountain-2';
import { DW_OVERWORLD_DARK_EAST_SCREENS } from './dark-east';
import { DW_OVERWORLD_DARK_LAKE_HYLIA_SCREENS } from './dark-lake-hylia';
import { DW_OVERWORLD_DARK_MIRE_SCREENS } from './dark-mire';
import { DW_OVERWORLD_DARK_NORTH_SCREENS } from './dark-north';
import { DW_OVERWORLD_DARK_SOUTH_SCREENS } from './dark-south';
import { DW_OVERWORLD_SKULL_WOODS_AREA_SCREENS } from './skull-woods-area';
import { DW_OVERWORLD_VILLAGE_OF_OUTCASTS_SCREENS } from './village-of-outcasts';

const DW_OVERWORLD_DARK_DEATH_MOUNTAIN_SCREENS: ScreenRecord[] = [
  ...DW_OVERWORLD_DARK_DEATH_MOUNTAIN_SCREENS_1,
  ...DW_OVERWORLD_DARK_DEATH_MOUNTAIN_SCREENS_2,
];

const DW_OVERWORLD_SCREENS: ScreenRecord[] = [
  ...DW_OVERWORLD_DARK_DEATH_MOUNTAIN_SCREENS,
  ...DW_OVERWORLD_DARK_EAST_SCREENS,
  ...DW_OVERWORLD_DARK_LAKE_HYLIA_SCREENS,
  ...DW_OVERWORLD_DARK_MIRE_SCREENS,
  ...DW_OVERWORLD_DARK_NORTH_SCREENS,
  ...DW_OVERWORLD_DARK_SOUTH_SCREENS,
  ...DW_OVERWORLD_SKULL_WOODS_AREA_SCREENS,
  ...DW_OVERWORLD_VILLAGE_OF_OUTCASTS_SCREENS,
];

export { DW_OVERWORLD_SCREENS };

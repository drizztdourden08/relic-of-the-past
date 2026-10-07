/* @layer shared-game @kind data */
import type { ScreenRecord } from '@shared/game/data/types';
import { LW_OVERWORLD_CENTRAL_HYRULE_SCREENS } from './central-hyrule';
import { LW_OVERWORLD_DEATH_MOUNTAIN_SCREENS_1 } from './death-mountain-1';
import { LW_OVERWORLD_DEATH_MOUNTAIN_SCREENS_2 } from './death-mountain-2';
import { LW_OVERWORLD_DESERT_SCREENS } from './desert';
import { LW_OVERWORLD_EAST_HYRULE_SCREENS } from './east-hyrule';
import { LW_OVERWORLD_HYRULE_CASTLE_SCREENS } from './hyrule-castle';
import { LW_OVERWORLD_KAKARIKO_SCREENS } from './kakariko';
import { LW_OVERWORLD_LAKE_HYLIA_SCREENS } from './lake-hylia';
import { LW_OVERWORLD_LOST_WOODS_SCREENS } from './lost-woods';
import { LW_OVERWORLD_SOUTH_HYRULE_SCREENS } from './south-hyrule';

const LW_OVERWORLD_DEATH_MOUNTAIN_SCREENS: ScreenRecord[] = [
  ...LW_OVERWORLD_DEATH_MOUNTAIN_SCREENS_1,
  ...LW_OVERWORLD_DEATH_MOUNTAIN_SCREENS_2,
];

const LW_OVERWORLD_SCREENS: ScreenRecord[] = [
  ...LW_OVERWORLD_CENTRAL_HYRULE_SCREENS,
  ...LW_OVERWORLD_DEATH_MOUNTAIN_SCREENS,
  ...LW_OVERWORLD_DESERT_SCREENS,
  ...LW_OVERWORLD_EAST_HYRULE_SCREENS,
  ...LW_OVERWORLD_HYRULE_CASTLE_SCREENS,
  ...LW_OVERWORLD_KAKARIKO_SCREENS,
  ...LW_OVERWORLD_LAKE_HYLIA_SCREENS,
  ...LW_OVERWORLD_LOST_WOODS_SCREENS,
  ...LW_OVERWORLD_SOUTH_HYRULE_SCREENS,
];

export { LW_OVERWORLD_SCREENS };

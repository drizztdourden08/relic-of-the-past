/* @layer shared-game @kind barrel */
import type { CheckRecord } from '@shared/game/data/types';
import { LW_CENTRAL_HYRULE_CHECKS } from './central-hyrule';
import { LW_DEATH_MOUNTAIN_CHECKS } from './death-mountain';
import { LW_DESERT_CHECKS } from './desert';
import { LW_EAST_HYRULE_CHECKS } from './east-hyrule';
import { LW_HYRULE_CASTLE_CHECKS } from './hyrule-castle';
import { LW_KAKARIKO_CHECKS } from './kakariko';
import { LW_LAKE_HYLIA_CHECKS } from './lake-hylia';
import { LW_LOST_WOODS_CHECKS } from './lost-woods';
import { LW_SOUTH_HYRULE_CHECKS } from './south-hyrule';
import { LW_STORY_CHECKS } from './story';

const LIGHT_WORLD_CHECKS: CheckRecord[] = [
  ...LW_CENTRAL_HYRULE_CHECKS,
  ...LW_DEATH_MOUNTAIN_CHECKS,
  ...LW_DESERT_CHECKS,
  ...LW_EAST_HYRULE_CHECKS,
  ...LW_HYRULE_CASTLE_CHECKS,
  ...LW_KAKARIKO_CHECKS,
  ...LW_LAKE_HYLIA_CHECKS,
  ...LW_LOST_WOODS_CHECKS,
  ...LW_SOUTH_HYRULE_CHECKS,
  ...LW_STORY_CHECKS,
];

export { LIGHT_WORLD_CHECKS };

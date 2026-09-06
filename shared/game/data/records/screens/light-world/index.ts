/* @layer shared-game @kind data */
import type { ScreenRecord } from '@shared/game/data/types';
import { LW_CAVES_SCREENS_1 } from './caves-1';
import { LW_CAVES_SCREENS_2 } from './caves-2';
import { LW_DUNGEONS_SCREENS } from './dungeons';
import { LW_FAIRY_SCREENS } from './fairy';
import { LW_GAMBLE_SCREENS } from './gamble';
import { LW_HINTS_SCREENS } from './hints';
import { LW_HOUSES_SCREENS_1 } from './houses-1';
import { LW_HOUSES_SCREENS_2 } from './houses-2';
import { LW_OVERWORLD_SCREENS } from './overworld';
import { LW_PASSAGES_SCREENS } from './passages';
import { LW_SHOPS_SCREENS } from './shops';
import { LW_SPECIAL_SCREENS } from './special';
import { LW_WELLS_SCREENS } from './wells';

const LW_CAVES_SCREENS: ScreenRecord[] = [...LW_CAVES_SCREENS_1, ...LW_CAVES_SCREENS_2];
const LW_HOUSES_SCREENS: ScreenRecord[] = [...LW_HOUSES_SCREENS_1, ...LW_HOUSES_SCREENS_2];

const LIGHT_WORLD_SCREENS: ScreenRecord[] = [
  ...LW_CAVES_SCREENS,
  ...LW_DUNGEONS_SCREENS,
  ...LW_FAIRY_SCREENS,
  ...LW_GAMBLE_SCREENS,
  ...LW_HINTS_SCREENS,
  ...LW_HOUSES_SCREENS,
  ...LW_OVERWORLD_SCREENS,
  ...LW_PASSAGES_SCREENS,
  ...LW_SHOPS_SCREENS,
  ...LW_SPECIAL_SCREENS,
  ...LW_WELLS_SCREENS,
];

export { LIGHT_WORLD_SCREENS };

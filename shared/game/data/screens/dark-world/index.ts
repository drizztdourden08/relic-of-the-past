/* @layer shared-game @kind data */
import type { ScreenRecord } from '../../types';
import { DW_CAVES_SCREENS } from './caves';
import { DW_DUNGEONS_SCREENS } from './dungeons';
import { DW_FAIRY_SCREENS } from './fairy';
import { DW_GAMBLE_SCREENS } from './gamble';
import { DW_HINTS_SCREENS } from './hints';
import { DW_HOUSES_SCREENS } from './houses';
import { DW_OVERWORLD_SCREENS } from './overworld';
import { DW_PASSAGES_SCREENS } from './passages';
import { DW_SHOPS_SCREENS } from './shops';
import { DW_SPECIAL_SCREENS } from './special';

const DARK_WORLD_SCREENS: ScreenRecord[] = [
  ...DW_CAVES_SCREENS,
  ...DW_DUNGEONS_SCREENS,
  ...DW_FAIRY_SCREENS,
  ...DW_GAMBLE_SCREENS,
  ...DW_HINTS_SCREENS,
  ...DW_HOUSES_SCREENS,
  ...DW_OVERWORLD_SCREENS,
  ...DW_PASSAGES_SCREENS,
  ...DW_SHOPS_SCREENS,
  ...DW_SPECIAL_SCREENS,
];

export { DARK_WORLD_SCREENS };

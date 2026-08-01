/* @layer shared-game @kind data */
import type { ConnectionRecord } from '../../types';
import { LW_CAVES_1_CONNECTIONS } from './caves-1';
import { LW_CAVES_2_CONNECTIONS } from './caves-2';
import { LW_DUNGEONS_CONNECTIONS } from './dungeons';
import { LW_FAIRY_CONNECTIONS } from './fairy';
import { LW_GAMBLE_CONNECTIONS } from './gamble';
import { LW_HINTS_CONNECTIONS } from './hints';
import { LW_HOUSES_1_CONNECTIONS } from './houses-1';
import { LW_HOUSES_2_CONNECTIONS } from './houses-2';
import { LW_OVERWORLD_CONNECTIONS } from './overworld';
import { LW_PASSAGES_CONNECTIONS } from './passages';
import { LW_SHOPS_CONNECTIONS } from './shops';
import { LW_SPECIAL_CONNECTIONS } from './special';
import { LW_WELLS_CONNECTIONS } from './wells';

const LIGHT_WORLD_CONNECTIONS: ConnectionRecord[] = [
  ...LW_CAVES_1_CONNECTIONS,
  ...LW_CAVES_2_CONNECTIONS,
  ...LW_DUNGEONS_CONNECTIONS,
  ...LW_FAIRY_CONNECTIONS,
  ...LW_GAMBLE_CONNECTIONS,
  ...LW_HINTS_CONNECTIONS,
  ...LW_HOUSES_1_CONNECTIONS,
  ...LW_HOUSES_2_CONNECTIONS,
  ...LW_OVERWORLD_CONNECTIONS,
  ...LW_PASSAGES_CONNECTIONS,
  ...LW_SHOPS_CONNECTIONS,
  ...LW_SPECIAL_CONNECTIONS,
  ...LW_WELLS_CONNECTIONS,
];

export { LIGHT_WORLD_CONNECTIONS };

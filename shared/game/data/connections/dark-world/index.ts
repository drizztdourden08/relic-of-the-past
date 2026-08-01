/* @layer shared-game @kind data */
import type { ConnectionRecord } from '../../types';
import { DW_CAVES_CONNECTIONS } from './caves';
import { DW_DUNGEONS_CONNECTIONS } from './dungeons';
import { DW_FAIRY_CONNECTIONS } from './fairy';
import { DW_GAMBLE_CONNECTIONS } from './gamble';
import { DW_HINTS_CONNECTIONS } from './hints';
import { DW_HOUSES_CONNECTIONS } from './houses';
import { DW_OVERWORLD_CONNECTIONS } from './overworld';
import { DW_PASSAGES_CONNECTIONS } from './passages';
import { DW_SHOPS_CONNECTIONS } from './shops';
import { DW_SPECIAL_CONNECTIONS } from './special';

const DARK_WORLD_CONNECTIONS: ConnectionRecord[] = [
  ...DW_CAVES_CONNECTIONS,
  ...DW_DUNGEONS_CONNECTIONS,
  ...DW_FAIRY_CONNECTIONS,
  ...DW_GAMBLE_CONNECTIONS,
  ...DW_HINTS_CONNECTIONS,
  ...DW_HOUSES_CONNECTIONS,
  ...DW_OVERWORLD_CONNECTIONS,
  ...DW_PASSAGES_CONNECTIONS,
  ...DW_SHOPS_CONNECTIONS,
  ...DW_SPECIAL_CONNECTIONS,
];

export { DARK_WORLD_CONNECTIONS };

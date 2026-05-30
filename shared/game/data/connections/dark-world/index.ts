import type { ScreenConnection } from '../../../types';
import { DW_OVERWORLD_CONNECTIONS } from './overworld';
import { DW_DUNGEON_CONNECTIONS } from './dungeons';
import { DW_CAVE_CONNECTIONS } from './caves';
import { DW_FAIRY_CONNECTIONS } from './fairy';
import { DW_GAMBLE_CONNECTIONS } from './gamble';
import { DW_HINT_CONNECTIONS } from './hints';
import { DW_HOUSE_CONNECTIONS } from './houses';
import { DW_PASSAGE_CONNECTIONS } from './passages';
import { DW_SHOP_CONNECTIONS } from './shops';
import { DW_SPECIAL_CONNECTIONS } from './special';

export const DARK_WORLD_CONNECTIONS: ScreenConnection[] = [
  ...DW_OVERWORLD_CONNECTIONS,
  ...DW_DUNGEON_CONNECTIONS,
  ...DW_CAVE_CONNECTIONS,
  ...DW_FAIRY_CONNECTIONS,
  ...DW_GAMBLE_CONNECTIONS,
  ...DW_HINT_CONNECTIONS,
  ...DW_HOUSE_CONNECTIONS,
  ...DW_PASSAGE_CONNECTIONS,
  ...DW_SHOP_CONNECTIONS,
  ...DW_SPECIAL_CONNECTIONS,
];

export { DW_OVERWORLD_CONNECTIONS, DW_DUNGEON_CONNECTIONS };

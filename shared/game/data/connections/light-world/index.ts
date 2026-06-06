import type { ScreenConnection } from '../../../types';
import { LW_OVERWORLD_CONNECTIONS } from './overworld';
import { LW_DUNGEON_CONNECTIONS } from './dungeons';
import { LW_CAVE_CONNECTIONS } from './caves';
import { LW_FAIRY_CONNECTIONS } from './fairy';
import { LW_GAMBLE_CONNECTIONS } from './gamble';
import { LW_HINT_CONNECTIONS } from './hints';
import { LW_HOUSE_CONNECTIONS } from './houses';
import { LW_PASSAGE_CONNECTIONS } from './passages';
import { LW_SHOP_CONNECTIONS } from './shops';
import { LW_SPECIAL_CONNECTIONS } from './special';
import { LW_WELL_CONNECTIONS } from './wells';

const LIGHT_WORLD_CONNECTIONS: ScreenConnection[] = [
  ...LW_OVERWORLD_CONNECTIONS,
  ...LW_DUNGEON_CONNECTIONS,
  ...LW_CAVE_CONNECTIONS,
  ...LW_FAIRY_CONNECTIONS,
  ...LW_GAMBLE_CONNECTIONS,
  ...LW_HINT_CONNECTIONS,
  ...LW_HOUSE_CONNECTIONS,
  ...LW_PASSAGE_CONNECTIONS,
  ...LW_SHOP_CONNECTIONS,
  ...LW_SPECIAL_CONNECTIONS,
  ...LW_WELL_CONNECTIONS,
];

export { LW_OVERWORLD_CONNECTIONS, LW_DUNGEON_CONNECTIONS };
export { LIGHT_WORLD_CONNECTIONS };

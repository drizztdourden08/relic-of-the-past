import type { RegionDefinition } from '../types';

import { LIGHT_WORLD_OVERWORLD_REGIONS } from './overworld';
import { LW_HOUSES } from './houses';
import { LW_CAVES } from './caves';
import { LW_SHOPS } from './shops';
import { LW_FAIRY } from './fairy';
import { LW_HINTS } from './hints';
import { LW_PASSAGES } from './passages';
import { LW_WELLS } from './wells';
import { LW_SPECIAL } from './special';
import { LW_GAMBLE } from './gamble';
import { LW_DUNGEON_REGIONS } from './dungeons';

export { LIGHT_WORLD_OVERWORLD_REGIONS } from './overworld';
export { LW_HOUSES } from './houses';
export { LW_CAVES } from './caves';
export { LW_SHOPS } from './shops';
export { LW_FAIRY } from './fairy';
export { LW_HINTS } from './hints';
export { LW_PASSAGES } from './passages';
export { LW_WELLS } from './wells';
export { LW_SPECIAL } from './special';
export { LW_GAMBLE } from './gamble';
export { LW_DUNGEON_REGIONS } from './dungeons';

export const ALL_LIGHT_WORLD_REGIONS: RegionDefinition[] = [
  ...LIGHT_WORLD_OVERWORLD_REGIONS,
  ...LW_HOUSES,
  ...LW_CAVES,
  ...LW_SHOPS,
  ...LW_FAIRY,
  ...LW_HINTS,
  ...LW_PASSAGES,
  ...LW_WELLS,
  ...LW_SPECIAL,
  ...LW_GAMBLE,
  ...LW_DUNGEON_REGIONS,
];

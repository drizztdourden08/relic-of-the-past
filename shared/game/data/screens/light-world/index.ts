import type { ScreenDefinition } from '../../../types';

import { LIGHT_WORLD_OVERWORLD_SCREENS } from './overworld';
import { LW_HOUSES } from './houses';
import { LW_CAVES } from './caves';
import { LW_SHOPS } from './shops';
import { LW_FAIRY } from './fairy';
import { LW_HINTS } from './hints';
import { LW_PASSAGES } from './passages';
import { LW_WELLS } from './wells';
import { LW_SPECIAL } from './special';
import { LW_GAMBLE } from './gamble';
import { LW_DUNGEON_SCREENS } from './dungeons';
import { LW_OVERWORLD_AREAS } from './overworld-areas';

export { LIGHT_WORLD_OVERWORLD_SCREENS } from './overworld';
export { LW_OVERWORLD_AREAS } from './overworld-areas';
export { LW_HOUSES } from './houses';
export { LW_CAVES } from './caves';
export { LW_SHOPS } from './shops';
export { LW_FAIRY } from './fairy';
export { LW_HINTS } from './hints';
export { LW_PASSAGES } from './passages';
export { LW_WELLS } from './wells';
export { LW_SPECIAL } from './special';
export { LW_GAMBLE } from './gamble';
export { LW_DUNGEON_SCREENS } from './dungeons';

const ALL_LIGHT_WORLD_SCREENS: ScreenDefinition[] = [
  ...LIGHT_WORLD_OVERWORLD_SCREENS,
  ...LW_OVERWORLD_AREAS,
  ...LW_HOUSES,
  ...LW_CAVES,
  ...LW_SHOPS,
  ...LW_FAIRY,
  ...LW_HINTS,
  ...LW_PASSAGES,
  ...LW_WELLS,
  ...LW_SPECIAL,
  ...LW_GAMBLE,
  ...LW_DUNGEON_SCREENS,
];

export { ALL_LIGHT_WORLD_SCREENS };

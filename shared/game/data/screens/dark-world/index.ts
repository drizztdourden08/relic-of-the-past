import type { ScreenDefinition } from '../../../types';

import { DARK_WORLD_OVERWORLD_SCREENS } from './overworld';
import { DW_HOUSES } from './houses';
import { DW_CAVES } from './caves';
import { DW_SHOPS } from './shops';
import { DW_FAIRY } from './fairy';
import { DW_HINTS } from './hints';
import { DW_PASSAGES } from './passages';
import { DW_SPECIAL } from './special';
import { DW_GAMBLE } from './gamble';
import { DW_DUNGEON_SCREENS } from './dungeons';
import { DW_OVERWORLD_AREAS } from './overworld-areas';

export { DARK_WORLD_OVERWORLD_SCREENS } from './overworld';
export { DW_OVERWORLD_AREAS } from './overworld-areas';
export { DW_HOUSES } from './houses';
export { DW_CAVES } from './caves';
export { DW_SHOPS } from './shops';
export { DW_FAIRY } from './fairy';
export { DW_HINTS } from './hints';
export { DW_PASSAGES } from './passages';
export { DW_SPECIAL } from './special';
export { DW_GAMBLE } from './gamble';
export { DW_DUNGEON_SCREENS } from './dungeons';

const ALL_DARK_WORLD_SCREENS: ScreenDefinition[] = [
  ...DARK_WORLD_OVERWORLD_SCREENS,
  ...DW_OVERWORLD_AREAS,
  ...DW_HOUSES,
  ...DW_CAVES,
  ...DW_SHOPS,
  ...DW_FAIRY,
  ...DW_HINTS,
  ...DW_PASSAGES,
  ...DW_SPECIAL,
  ...DW_GAMBLE,
  ...DW_DUNGEON_SCREENS,
];

export { ALL_DARK_WORLD_SCREENS };

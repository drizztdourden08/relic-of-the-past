import type { ScreenDefinition } from '../../../../types';

import { HYRULE_CASTLE_DUNGEON } from './hyrule-castle';
import { CASTLE_TOWER_DUNGEON } from './castle-tower';
import { EASTERN_PALACE_DUNGEON } from './eastern-palace';
import { DESERT_PALACE_DUNGEON } from './desert-palace';
import { TOWER_OF_HERA_DUNGEON } from './tower-of-hera';

export { HYRULE_CASTLE_DUNGEON } from './hyrule-castle';
export { CASTLE_TOWER_DUNGEON } from './castle-tower';
export { EASTERN_PALACE_DUNGEON } from './eastern-palace';
export { DESERT_PALACE_DUNGEON } from './desert-palace';
export { TOWER_OF_HERA_DUNGEON } from './tower-of-hera';

const LW_DUNGEON_SCREENS: ScreenDefinition[] = [
  ...HYRULE_CASTLE_DUNGEON,
  ...CASTLE_TOWER_DUNGEON,
  ...EASTERN_PALACE_DUNGEON,
  ...DESERT_PALACE_DUNGEON,
  ...TOWER_OF_HERA_DUNGEON,
];

export { LW_DUNGEON_SCREENS };

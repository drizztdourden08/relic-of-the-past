import type { RegionConnection } from '../../../types';
import { LW_CASTLE_TOWER_CONNECTIONS } from './castle-tower';
import { LW_DESERT_PALACE_CONNECTIONS } from './desert-palace';
import { LW_EASTERN_PALACE_CONNECTIONS } from './eastern-palace';
import { LW_HYRULE_CASTLE_CONNECTIONS } from './hyrule-castle';
import { LW_TOWER_OF_HERA_CONNECTIONS } from './tower-of-hera';

export const LW_DUNGEON_CONNECTIONS: RegionConnection[] = [
  ...LW_CASTLE_TOWER_CONNECTIONS,
  ...LW_DESERT_PALACE_CONNECTIONS,
  ...LW_EASTERN_PALACE_CONNECTIONS,
  ...LW_HYRULE_CASTLE_CONNECTIONS,
  ...LW_TOWER_OF_HERA_CONNECTIONS,
];

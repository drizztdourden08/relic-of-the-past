/* @layer shared-game @kind data */
/** The stage events of hyrule-castle. */

import type { CheckRecord } from '@shared/game/data/types';
import { eventRecord } from '../event-record';

const HYRULE_CASTLE_EVENTS: CheckRecord[] = [
  // Hyrule Castle has no boss: its stages are the escape.
  eventRecord({ n: 180, name: 'Hyrule Castle: started', group: 'dungeon', dungeonId: 'dungeon-001', gameId: { roomId: 0x61, mask: 0x0f } }),
  eventRecord({ n: 181, name: 'Hyrule Castle: sewers reached', group: 'dungeon', dungeonId: 'dungeon-001', gameId: { roomId: 0x51, mask: 0x0f } }),
  eventRecord({ n: 182, name: 'Hyrule Castle: cleared', group: 'dungeon', dungeonId: 'dungeon-001', derived: { checkId: 'check-004' } }),
];

export { HYRULE_CASTLE_EVENTS };

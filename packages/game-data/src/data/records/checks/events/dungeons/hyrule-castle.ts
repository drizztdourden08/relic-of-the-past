/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';

const HYRULE_CASTLE_EVENTS: EventSpec[] = [
  { n: 180, name: 'Hyrule Castle: started', group: 'dungeon', dungeonId: 'dungeon-001', gameId: { roomId: 0x61, mask: 0x0f } },
  { n: 181, name: 'Hyrule Castle: sewers reached', group: 'dungeon', dungeonId: 'dungeon-001', gameId: { roomId: 0x51, mask: 0x0f } },
  { n: 182, name: 'Hyrule Castle: cleared', group: 'dungeon', dungeonId: 'dungeon-001', derived: { checkId: 'check-004' } },
];

export { HYRULE_CASTLE_EVENTS };

/* @layer shared-game @kind data */
/**
 * The order the fill walks the dungeons in.
 *
 * Not a fact about any dungeon, which is why it is not on the records: it is the order the
 * prefill pass pushes each dungeon's restricted items in, and the placement depends on it, so
 * it belongs to the fill. Ported from Archipelago worlds/alttp/Dungeons.py create_dungeons
 * (open mode), whose call order this is.
 */
import type { DungeonId } from '@shared/game/data/types/ids';

const DUNGEON_ORDER: readonly DungeonId[] = [
  'dungeon-001', 'dungeon-003', 'dungeon-004', 'dungeon-005', 'dungeon-002', 'dungeon-006',
  'dungeon-009', 'dungeon-008', 'dungeon-007', 'dungeon-010', 'dungeon-011', 'dungeon-012',
  'dungeon-013',
];

export { DUNGEON_ORDER };

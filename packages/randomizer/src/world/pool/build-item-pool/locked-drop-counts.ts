/* @layer shared-game @kind logic */
import { KEY_DROP_LOCATIONS } from '../../scope-tables';
import type { WorldDungeon } from '../../region.type';

const lockedDropCounts = (dungeon: WorldDungeon): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const item of KEY_DROP_LOCATIONS.values()) {
    if (item === dungeon.smallKey || item === dungeon.bigKey) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return counts;
};

export { lockedDropCounts };

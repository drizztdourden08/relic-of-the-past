/* @layer shared-game @kind logic */
import { getDungeon } from '../data';
import type { CheckRecord } from '../data';

const isCheckPlaceReached = (check: CheckRecord, reachable: ReadonlySet<string>): boolean => {
  if (check.reachAny) return check.reachAny.some((screen) => reachable.has(screen));
  if (check.screenId !== undefined) return reachable.has(check.screenId);
  if (check.derived || check.derivedDungeon) return false;
  if (check.kind === 'event' && check.dungeonId !== undefined) {
    return getDungeon(check.dungeonId).roomScreenIds.some((room) => reachable.has(room));
  }
  return false;
};

export { isCheckPlaceReached };

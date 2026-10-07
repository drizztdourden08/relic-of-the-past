/* @layer shared-game @kind logic */
/**
 * Whether the place a check happens at has been reached. An item check has one screen. An event
 * that marks the first of several places reached (the dark world, from any of its regions) names
 * them all, and any one of them opens it. A dungeon's stage event has no screen of its own: it
 * happens somewhere inside, so any room of its dungeon opens it and its own rule does the rest.
 * A combined row is a sum of other rows, never something to go and do: it has no place.
 */
import { getDungeon } from '../data';
import type { CheckRecord, ScreenId } from '../data';

const isCheckPlaceReached = (check: CheckRecord, reachable: ReadonlySet<ScreenId | string>): boolean => {
  if (check.reachAny) return check.reachAny.some((screen) => reachable.has(screen));
  if (check.screenId !== undefined) return reachable.has(check.screenId);
  if (check.derived || check.derivedDungeon) return false;
  if (check.kind === 'event' && check.dungeonId !== undefined) {
    return getDungeon(check.dungeonId).roomScreenIds.some((room) => reachable.has(room));
  }
  return false;
};

export { isCheckPlaceReached };

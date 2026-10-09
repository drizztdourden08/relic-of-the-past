/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import { getDungeon, getItem, getScreen } from '../../../data';
import type { RunContext } from './check-grouping.type';

const matchesSearch = (check: CheckRecord, query: string, run?: RunContext): boolean => {
  if (check.id.toLowerCase().includes(query) || check.name.toLowerCase().includes(query)) return true;
  if (check.screenId) {
    const screen = getScreen(check.screenId);
    if (screen.name.toLowerCase().includes(query)) return true;
  }
  if (check.dungeonId && getDungeon(check.dungeonId).name.toLowerCase().includes(query)) return true;
  const foreign = run?.foreignItems?.get(check.id);
  if (foreign !== undefined) return foreign.toLowerCase().includes(query);
  const placed = run?.placedItems?.get(check.id);
  if (placed !== undefined) return getItem(placed).name.toLowerCase().includes(query);
  const live = run?.liveItems?.get(check.id);
  if (live !== undefined && getItem(live).name.toLowerCase().includes(query)) return true;
  return check.vanillaItemIds.some(id => getItem(id).name.toLowerCase().includes(query));
};

export { matchesSearch };

/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import { getDungeon, getItem, getScreen } from '../../../data';
import type { RunContext } from './check-grouping.type';

const includes = (text: string, query: string): boolean => text.toLowerCase().includes(query);

const locationMatches = (check: CheckRecord, query: string): boolean => {
  const { screenId, dungeonId } = check;
  if (screenId && includes(getScreen(screenId).name, query)) return true;
  return dungeonId ? includes(getDungeon(dungeonId).name, query) : false;
};

const runItemMatch = (check: CheckRecord, query: string, run?: RunContext): boolean | undefined => {
  const foreign = run?.foreignItems?.get(check.id);
  if (foreign !== undefined) return includes(foreign, query);
  const placed = run?.placedItems?.get(check.id);
  if (placed !== undefined) return includes(getItem(placed).name, query);
  return undefined;
};

const liveMatches = (check: CheckRecord, query: string, run?: RunContext): boolean => {
  const live = run?.liveItems?.get(check.id);
  return live !== undefined && includes(getItem(live).name, query);
};

const matchesSearch = (check: CheckRecord, query: string, run?: RunContext): boolean => {
  if (includes(check.id, query) || includes(check.name, query)) return true;
  if (locationMatches(check, query)) return true;
  const decided = runItemMatch(check, query, run);
  if (decided !== undefined) return decided;
  if (liveMatches(check, query, run)) return true;
  return check.vanillaItemIds.some(id => includes(getItem(id).name, query));
};

export { matchesSearch };

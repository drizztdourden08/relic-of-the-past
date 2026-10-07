/* @layer root-config @kind logic */
/** The group list for per-request rights, held in memory for a short while so
 *  a burst of calls costs one Firestore read. A group write on this instance
 *  drops the copy at once; other instances catch up within the window. */
import type { Group } from '../../../../shared/sanctuary';
import { groupsRepo } from '../db/groups-repo';
import { now } from '../db/firestore';

const TTL_MS = 30 * 1000;

let cache: { groups: Group[]; at: number } | null = null;

const cachedGroups = async (): Promise<Group[]> => {
  if (cache && now() - cache.at < TTL_MS) return cache.groups;
  const groups = await groupsRepo.all();
  cache = { groups, at: now() };
  return groups;
};

const invalidateGroups = (): void => {
  cache = null;
};

export { cachedGroups, invalidateGroups };

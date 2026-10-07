/* @layer hub-core @kind logic */
/** The group list for per-request rights, held in memory for a short while so
 *  a burst of calls costs one Firestore read. A group write on this instance
 *  drops the copy at once; other instances catch up within the window. */
import type { Group } from '../../../shared/hub';
import { groupsRepo } from '../db/groups-repo';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';

const TTL_MS = 30 * 1000;

let cache: { groups: Group[]; at: number } | null = null;

const cachedGroups = async (site: SiteConfig): Promise<Group[]> => {
  if (cache && now() - cache.at < TTL_MS) return cache.groups;
  const groups = await groupsRepo.all(site.defaultGroup);
  cache = { groups, at: now() };
  return groups;
};

const invalidateGroups = (): void => {
  cache = null;
};

export { cachedGroups, invalidateGroups };

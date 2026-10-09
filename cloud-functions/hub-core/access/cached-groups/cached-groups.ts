/* @layer hub-core @kind logic */
import type { Group } from '@rotp/hub-contracts';
import { groupsRepo } from '../../db/groups-repo';
import { now } from '../../db/firestore';
import type { SiteConfig } from '../../site-config.type';
import { TTL_MS } from './cached-groups.constants';
import { groupCache } from './group-cache';

const cachedGroups = async (site: SiteConfig): Promise<Group[]> => {
  const cache = groupCache.entry;
  if (cache && now() - cache.at < TTL_MS) return cache.groups;
  const groups = await groupsRepo.all(site.defaultGroup);
  groupCache.entry = { groups, at: now() };
  return groups;
};

export { cachedGroups };

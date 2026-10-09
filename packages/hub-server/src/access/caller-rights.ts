/* @layer hub-core @kind logic */
import type { HubUser } from '@rotp/hub-contracts';
import type { SiteConfig } from '../site-config.type';
import type { CallerRights } from './caller-rights.type';
import { cachedGroups } from './cached-groups';
import { groupsOf } from './membership';
import { resolveRights } from './resolve-rights';

const callerRights = async (user: HubUser, site: SiteConfig): Promise<CallerRights> => {
  const state = user.sites[site.id]?.state;
  const admin = state === 'admin';
  const member = admin || state === 'member';
  const groups = member ? groupsOf(user, await cachedGroups(site)) : [];
  return { groups, rights: resolveRights(site.rights, groups, admin) };
};

export { callerRights };
export type { CallerRights } from './caller-rights.type';

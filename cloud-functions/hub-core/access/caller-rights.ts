/* @layer hub-core @kind logic */
/** The groups and rights of one user on the site being called. Only a member or an admin
 *  of that site holds any; a pending or revoked user resolves to nothing. */
import type { Group, HubUser, Rights } from '../../../shared/hub';
import type { SiteConfig } from '../site-config.type';
import { cachedGroups } from './cached-groups';
import { groupsOf } from './membership';
import { resolveRights } from './resolve-rights';

type CallerRights = { groups: Group[]; rights: Rights };

const callerRights = async (user: HubUser, site: SiteConfig): Promise<CallerRights> => {
  const state = user.sites[site.id]?.state;
  const admin = state === 'admin';
  const member = admin || state === 'member';
  const groups = member ? groupsOf(user, await cachedGroups(site)) : [];
  return { groups, rights: resolveRights(site.rights, groups, admin) };
};

export { callerRights };
export type { CallerRights };

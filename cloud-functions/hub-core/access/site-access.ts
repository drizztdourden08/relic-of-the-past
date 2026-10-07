/* @layer hub-core @kind logic */
/** What a person holds on one site. An approval site takes the access chain's answer as it
 *  stands. An open site lets anyone signed in through: a ban on that site stays a ban, the
 *  admin list still makes an admin, and everyone else is a member. Either way the chain runs,
 *  since the groups it reads from Discord and GitHub are the person's on every site. */
import type { AccessCheck, HubUser, SiteAccess } from '../../../shared/hub';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { FreshToken } from './access-rule.type';
import { evaluateAccess } from './evaluate-access';

type SiteAccessResult = { access: SiteAccess; roleGroupIds: string[] };

const openAccess = (current: SiteAccess | undefined, chain: AccessCheck): AccessCheck => {
  if (current?.state === 'revoked') return { state: 'revoked', source: current.source, checkedAt: chain.checkedAt };
  if (chain.state === 'admin') return chain;
  return { state: 'member', source: 'open', checkedAt: chain.checkedAt };
};

const siteAccess = async (site: SiteConfig, user: HubUser, fresh: FreshToken | null): Promise<SiteAccessResult> => {
  const current = user.sites[site.id];
  const firstSeenAt = current?.firstSeenAt ?? now();
  const { access, roleGroupIds } = await evaluateAccess(user, fresh, site);
  const decided = site.access === 'approval' ? access : openAccess(current, access);
  return { access: { ...decided, firstSeenAt }, roleGroupIds };
};

export { siteAccess };
export type { SiteAccessResult };

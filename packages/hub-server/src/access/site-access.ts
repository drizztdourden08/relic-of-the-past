/* @layer hub-core @kind logic */
import type { AccessCheck, HubUser, SiteAccess } from '@rotp/hub-contracts';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { FreshToken } from './access-rule.type';
import { evaluateAccess } from './evaluate-access';
import type { SiteAccessResult } from './site-access.type';

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

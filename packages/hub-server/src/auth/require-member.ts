/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import type { SiteAccess } from '@rotp/hub-contracts';
import { forbidden, unauthorized } from '../http/http-error';
import { usersRepo } from '../db/users-repo';
import { callerRights } from '../access/caller-rights';
import { withSiteRecord } from '../access/with-site-record';
import type { SiteConfig } from '../site-config.type';
import { requireCaller } from './require-caller';
import type { Member } from './require-member.type';

const isMemberState = (access: SiteAccess | undefined): access is SiteAccess =>
  access?.state === 'member' || access?.state === 'admin';

const requireMember = async (req: Request, site: SiteConfig): Promise<Member> => {
  const caller = await requireCaller(req);
  const stored = await usersRepo.get(caller.userId);
  if (!stored) throw unauthorized();
  const user = await withSiteRecord(site, stored);
  const access = user.sites[site.id];
  if (!isMemberState(access)) throw forbidden('Access is pending.');
  const { groups, rights } = await callerRights(user, site);
  return { caller, user, access, groups, rights };
};

export { requireMember };
export type { Member } from './require-member.type';

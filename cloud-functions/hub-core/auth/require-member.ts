/* @layer hub-core @kind logic */
/** A member or an admin of the site being called, by either credential, with their groups
 *  and rights resolved once for the request. Pending and revoked users are signed in but
 *  see nothing past the waiting page. An open site writes the caller's first record here. */
import type { Request } from '@google-cloud/functions-framework';
import type { Group, HubUser, Rights, SiteAccess } from '../../../shared/hub';
import { forbidden, unauthorized } from '../http/http-error';
import { usersRepo } from '../db/users-repo';
import { callerRights } from '../access/caller-rights';
import { withSiteRecord } from '../access/with-site-record';
import type { SiteConfig } from '../site-config.type';
import { requireCaller } from './require-caller';
import type { Caller } from './require-caller';

type Member = { caller: Caller; user: HubUser; access: SiteAccess; groups: Group[]; rights: Rights };

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
export type { Member };

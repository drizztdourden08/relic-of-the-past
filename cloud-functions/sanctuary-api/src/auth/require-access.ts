/* @layer root-config @kind logic */
/** A member or an admin, by either credential, with their groups and rights
 *  resolved once for the request. Pending and revoked users are signed in but
 *  see nothing past the waiting page. */
import type { Request } from '@google-cloud/functions-framework';
import type { Group, Rights, SanctuaryUser } from '../../../../shared/sanctuary';
import { forbidden, unauthorized } from '../http/http-error';
import { usersRepo } from '../db/users-repo';
import { callerRights } from '../access/caller-rights';
import { requireCaller } from './require-caller';
import type { Caller } from './require-caller';

type Member = { caller: Caller; user: SanctuaryUser; groups: Group[]; rights: Rights };

const requireAccess = async (req: Request): Promise<Member> => {
  const caller = await requireCaller(req);
  const user = await usersRepo.get(caller.userId);
  if (!user) throw unauthorized();
  if (user.access.state !== 'member' && user.access.state !== 'admin') throw forbidden('Access is pending.');
  const { groups, rights } = await callerRights(user);
  return { caller, user, groups, rights };
};

export { requireAccess };
export type { Member };

/* @layer root-config @kind logic */
/** A member or an admin, by either credential. Pending and revoked users are
 *  signed in but see nothing past the waiting page. */
import type { Request } from '@google-cloud/functions-framework';
import type { SanctuaryUser } from '../../../../shared/sanctuary';
import { forbidden, unauthorized } from '../http/http-error';
import { usersRepo } from '../db/users-repo';
import { requireCaller } from './require-caller';
import type { Caller } from './require-caller';

type Member = { caller: Caller; user: SanctuaryUser };

const requireAccess = async (req: Request): Promise<Member> => {
  const caller = await requireCaller(req);
  const user = await usersRepo.get(caller.userId);
  if (!user) throw unauthorized();
  if (user.access.state !== 'member' && user.access.state !== 'admin') throw forbidden('Access is pending.');
  return { caller, user };
};

export { requireAccess };
export type { Member };

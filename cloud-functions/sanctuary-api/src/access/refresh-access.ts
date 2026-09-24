/* @layer root-config @kind logic */
/** Runs the access chain for one user and stores its answer: the state and the
 *  role groups, in one write. Answers the user as stored. */
import type { SanctuaryUser } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { usersRepo } from '../db/users-repo';
import type { FreshToken } from './access-rule.type';
import { evaluateAccess } from './evaluate-access';

const refreshAccess = async (userId: string, fresh: FreshToken | null): Promise<SanctuaryUser> => {
  const user = await usersRepo.get(userId);
  if (!user) throw notFound('No such user.');
  const { access, roleGroupIds } = await evaluateAccess(user, fresh);
  await usersRepo.saveAccess(user.id, access, roleGroupIds);
  return { ...user, access, roleGroupIds };
};

export { refreshAccess };

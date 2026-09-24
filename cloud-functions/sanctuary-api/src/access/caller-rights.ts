/* @layer root-config @kind logic */
/** The groups and rights of one user for this request. Only a member or an
 *  admin holds any; a pending or revoked user resolves to nothing. */
import type { Group, Rights, SanctuaryUser } from '../../../../shared/sanctuary';
import { cachedGroups } from './cached-groups';
import { groupsOf } from './membership';
import { resolveRights } from './resolve-rights';

type CallerRights = { groups: Group[]; rights: Rights };

const callerRights = async (user: SanctuaryUser): Promise<CallerRights> => {
  const admin = user.access.state === 'admin';
  const member = admin || user.access.state === 'member';
  const groups = member ? groupsOf(user, await cachedGroups()) : [];
  return { groups, rights: resolveRights(groups, admin) };
};

export { callerRights };
export type { CallerRights };

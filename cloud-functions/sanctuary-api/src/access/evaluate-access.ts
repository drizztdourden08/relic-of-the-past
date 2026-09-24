/* @layer root-config @kind logic */
/** The access chain. Rules run in order and the first that answers wins, so a
 *  user with no Discord identity never costs a Discord request. An admin revoke
 *  outranks every rule but the admin list, which cannot revoke itself. */
import type { AccessCheck } from '../../../../shared/sanctuary';
import { identitiesRepo } from '../db/identities-repo';
import { grantsRepo } from '../db/grants-repo';
import { now } from '../db/firestore';
import type { AccessContext, AccessRule, FreshToken } from './access-rule.type';
import { adminList } from './rules/admin-list';
import { manualGrant } from './rules/manual-grant';
import { discordRole } from './rules/discord-role';
import { githubCollaborator } from './rules/github-collaborator';

/** Order is the priority; the admin list runs ahead of these and the revoke check. */
const MEMBER_RULES: AccessRule[] = [manualGrant, discordRole, githubCollaborator];

const evaluateAccess = async (userId: string, fresh: FreshToken | null): Promise<AccessCheck> => {
  const [identities, grant] = await Promise.all([identitiesRepo.forUser(userId), grantsRepo.get(userId)]);
  const ctx: AccessContext = { userId, identities, grant, fresh };
  const checkedAt = now();
  const admin = await adminList(ctx);
  if (admin) return { state: 'admin', source: admin, checkedAt };
  if (grant?.revoked) return { state: 'revoked', source: 'manual-grant', checkedAt };
  for (const rule of MEMBER_RULES) {
    const source = await rule(ctx);
    if (source) return { state: 'member', source, checkedAt };
  }
  return { state: 'pending', source: 'none', checkedAt };
};

export { evaluateAccess };

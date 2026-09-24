/* @layer root-config @kind logic */
/** The access chain. Its answer is the state plus the groups the user holds
 *  from their Discord roles or, failing every other source, from being a
 *  GitHub collaborator. Order decides the state: the admin list, then an admin
 *  revoke, then any group at all makes a member; nothing leaves them pending.
 *  The GitHub request only runs when no other source gave a group. */
import type { AccessCheck, AccessSource, SanctuaryUser } from '../../../../shared/sanctuary';
import { identitiesRepo } from '../db/identities-repo';
import { grantsRepo } from '../db/grants-repo';
import { groupsRepo } from '../db/groups-repo';
import { now } from '../db/firestore';
import type { AccessContext, FreshToken } from './access-rule.type';
import { adminList } from './rules/admin-list';
import { manualGroups } from './rules/manual-grant';
import { discordRoleGroups } from './rules/discord-role';
import { githubCollaboratorGroups } from './rules/github-collaborator';

type AccessResult = { access: AccessCheck; roleGroupIds: string[] };

const memberSource = (manual: string[], discord: string[], github: string[]): AccessSource | null => {
  if (manual.length > 0) return 'manual-grant';
  if (discord.length > 0) return 'discord-role';
  if (github.length > 0) return 'github-collaborator';
  return null;
};

const evaluateAccess = async (user: SanctuaryUser, fresh: FreshToken | null): Promise<AccessResult> => {
  const [identities, grant, groups] = await Promise.all([
    identitiesRepo.forUser(user.id),
    grantsRepo.get(user.id),
    groupsRepo.all(),
  ]);
  const ctx: AccessContext = { user, identities, grant, groups, fresh };
  const manual = await manualGroups(ctx);
  const discord = await discordRoleGroups(ctx);
  const github = manual.length === 0 && discord.length === 0 ? await githubCollaboratorGroups(ctx) : [];
  const roleGroupIds = Array.from(new Set([...discord, ...github]));
  const checkedAt = now();
  const withState = (state: AccessCheck['state'], source: AccessSource): AccessResult => ({
    access: { state, source, checkedAt },
    roleGroupIds,
  });
  if (await adminList(ctx)) return withState('admin', 'admin-list');
  if (grant?.revoked) return withState('revoked', 'manual-grant');
  const source = memberSource(manual, discord, github);
  return source ? withState('member', source) : withState('pending', 'none');
};

export { evaluateAccess };
export type { AccessResult };

/* @layer hub-core @kind logic */
import type { AccessCheck, AccessSource, HubUser } from '../../../shared/hub';
import { identitiesRepo } from '../db/identities-repo';
import { grantsRepo } from '../db/grants-repo';
import { groupsRepo } from '../db/groups-repo';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { AccessContext, FreshToken } from './access-rule.type';
import type { AccessResult } from './evaluate-access.type';
import { adminList } from './rules/admin-list';
import { manualGroups } from './rules/manual-grant';
import { discordRoleGroups } from './rules/discord-role';
import { githubCollaboratorGroups } from './rules/github-collaborator';

const memberSource = (manual: string[], discord: string[], github: string[]): AccessSource | null => {
  if (manual.length > 0) return 'manual-grant';
  if (discord.length > 0) return 'discord-role';
  if (github.length > 0) return 'github-collaborator';
  return null;
};

const evaluateAccess = async (user: HubUser, fresh: FreshToken | null, site: SiteConfig): Promise<AccessResult> => {
  const [identities, grant, groups] = await Promise.all([
    identitiesRepo.forUser(user.id),
    grantsRepo.get(user.id),
    groupsRepo.all(site.defaultGroup),
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
export type { AccessResult } from './evaluate-access.type';

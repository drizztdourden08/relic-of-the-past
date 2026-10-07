/* @layer site-kit @kind logic */
/**
 * One group's line in the admin list, in words: its Discord role, what it grants on each
 * site (each site's rights model says it), and how many people are in it (and how many of
 * them by hand).
 */
import type { DiscordRole } from '@shared/hub/group-types';
import type { RightsModel } from '@shared/hub/rights-model.type';
import type { GroupView } from '../../../api/hub-responses.type';

/** Names the linked role when the server's roles are known, the id otherwise. */
const roleText = (group: GroupView, roles: ReadonlyMap<string, DiscordRole>) => {
  if (!group.discordRoleId) return 'no Discord role';
  const role = roles.get(group.discordRoleId);
  return role ? `Discord role ${role.name}` : `Discord role ${group.discordRoleId}`;
};

const peopleText = (group: GroupView) => {
  const { memberCount, manualCount } = group;
  const people = memberCount === 1 ? '1 person' : `${memberCount} people`;
  if (manualCount === 0) return people;
  if (manualCount === memberCount) return `${people} by hand`;
  return `${people} (${manualCount} by hand)`;
};

const groupSummary = (
  group: GroupView,
  roles: ReadonlyMap<string, DiscordRole>,
  models: readonly RightsModel[],
): string => [
  roleText(group, roles),
  ...models.map((model) => model.describe(group.rights[model.site] ?? [])),
  peopleText(group),
].join(' · ');

export { groupSummary };

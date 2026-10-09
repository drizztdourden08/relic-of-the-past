/* @layer site-kit @kind logic */
import type { DiscordRole, RightsModel } from '@rotp/hub-contracts';
import type { GroupView } from '@rotp/hub-client';

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

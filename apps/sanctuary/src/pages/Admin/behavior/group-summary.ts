/* @layer sanctuary-site @kind logic */
/**
 * One group's line in the admin list, in words: its Discord role, the shelves it sees,
 * the reports and how many people are in it (and how many of them by hand).
 */
import { FILE_TYPES } from '@shared/sanctuary/file-types';
import type { DiscordRole } from '@shared/sanctuary/group-types';
import type { GroupView } from '../../../api/types';
import { SCOPE_TYPE_LABELS } from '../../Files/Files.constants';

/** Names the linked role when the server's roles are known, the id otherwise. */
const roleText = (group: GroupView, roles: ReadonlyMap<string, DiscordRole>) => {
  if (!group.discordRoleId) return 'no Discord role';
  const role = roles.get(group.discordRoleId);
  return role ? `Discord role ${role.name}` : `Discord role ${group.discordRoleId}`;
};

const typesText = (group: GroupView) => {
  const { fileTypes } = group.rights;
  if (fileTypes.length === 0) return 'no file types';
  if (FILE_TYPES.every((type) => fileTypes.includes(type))) return 'all file types';
  return FILE_TYPES.filter((type) => fileTypes.includes(type)).map((type) => SCOPE_TYPE_LABELS[type]).join(', ');
};

const peopleText = (group: GroupView) => {
  const { memberCount, manualCount } = group;
  const people = memberCount === 1 ? '1 person' : `${memberCount} people`;
  if (manualCount === 0) return people;
  if (manualCount === memberCount) return `${people} by hand`;
  return `${people} (${manualCount} by hand)`;
};

const groupSummary = (group: GroupView, roles: ReadonlyMap<string, DiscordRole>): string => [
  roleText(group, roles),
  typesText(group),
  ...(group.rights.reports ? ['reports'] : []),
  peopleText(group),
].join(' · ');

export { groupSummary };

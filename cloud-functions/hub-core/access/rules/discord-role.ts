/* @layer hub-core @kind logic */
import type { Group } from '@rotp/hub-contracts';
import { readHubEnv } from '../../env';
import { knownIds } from '../membership';
import type { GroupRule } from '../access-rule.type';
import { DISCORD_API, NOT_A_MEMBER } from './discord-role.constants';
import type { GuildMember } from './discord-role.type';

const groupsForRoles = (roles: string[], groups: Group[]): string[] =>
  groups.filter((group) => group.discordRoleId !== null && roles.includes(group.discordRoleId)).map((group) => group.id);

const discordRoleGroups: GroupRule = async ({ user, identities, groups, fresh }) => {
  if (!identities.some((identity) => identity.provider === 'discord')) return [];
  const stored = knownIds(user.roleGroupIds, groups);
  if (fresh?.provider !== 'discord') return stored;
  const res = await fetch(`${DISCORD_API}/users/@me/guilds/${readHubEnv().DISCORD_GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${fresh.accessToken}`, Accept: 'application/json' },
  });
  if (res.status === NOT_A_MEMBER) return [];
  if (!res.ok) return stored;
  const member = (await res.json()) as GuildMember;
  return groupsForRoles(member.roles ?? [], groups);
};

export { discordRoleGroups };

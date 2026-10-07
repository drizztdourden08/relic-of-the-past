/* @layer root-config @kind logic */
/** The user's own token reads their member object in the guild; no bot is
 *  needed. Every role on it maps to the groups linked to that role. The read
 *  only happens while a fresh Discord token is in hand, inside the callback
 *  that received it; otherwise the groups stored at the last read stand. A
 *  user outside the guild gets a 404 from Discord, which counts as no role. */
import type { Group } from '../../../../../shared/sanctuary';
import { readEnv } from '../../env';
import { knownIds } from '../membership';
import type { GroupRule } from '../access-rule.type';

const API = 'https://discord.com/api';
const NOT_A_MEMBER = 404;

type GuildMember = { roles?: string[] };

const groupsForRoles = (roles: string[], groups: Group[]): string[] =>
  groups.filter((group) => group.discordRoleId !== null && roles.includes(group.discordRoleId)).map((group) => group.id);

const discordRoleGroups: GroupRule = async ({ user, identities, groups, fresh }) => {
  if (!identities.some((identity) => identity.provider === 'discord')) return [];
  const stored = knownIds(user.roleGroupIds, groups);
  if (fresh?.provider !== 'discord') return stored;
  const res = await fetch(`${API}/users/@me/guilds/${readEnv().DISCORD_GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${fresh.accessToken}`, Accept: 'application/json' },
  });
  if (res.status === NOT_A_MEMBER) return [];
  if (!res.ok) return stored;
  const member = (await res.json()) as GuildMember;
  return groupsForRoles(member.roles ?? [], groups);
};

export { discordRoleGroups };

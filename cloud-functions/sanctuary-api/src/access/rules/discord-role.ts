/* @layer root-config @kind logic */
/** The user's own token reads their member object in the contributor guild;
 *  no bot is needed. Only runs while a fresh Discord token is in hand, which
 *  is inside the callback that just received it. A user outside the guild
 *  gets a 404 from Discord, which counts as no role. */
import { readEnv } from '../../env';
import type { AccessRule } from '../access-rule.type';

const API = 'https://discord.com/api';

type GuildMember = { roles?: string[] };

const discordRole: AccessRule = async ({ identities, fresh }) => {
  if (fresh?.provider !== 'discord' || !identities.some((identity) => identity.provider === 'discord')) return null;
  const env = readEnv();
  const res = await fetch(`${API}/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${fresh.accessToken}`, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const member = (await res.json()) as GuildMember;
  return member.roles?.includes(env.DISCORD_CONTRIBUTOR_ROLE_ID) ? 'discord-role' : null;
};

export { discordRole };

/* @layer hub-core @kind logic */
import { HUB_ROUTES } from '@rotp/hub-contracts';
import type { DiscordRole } from '@rotp/hub-contracts';
import { readHubEnv } from '../env';
import { badGateway } from '../http/http-error';
import { requireAdmin } from '../auth/require-admin';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';
import { API, CACHE_MS } from './discord-roles.constants';
import type { CachedRoles, RawRole } from './discord-roles.type';

let cached: CachedRoles | null = null;

const isAssignableRole = (role: RawRole, guildId: string): boolean => role.id !== guildId && !role.managed;

const fetchRoles = async (token: string, guildId: string): Promise<DiscordRole[]> => {
  const response = await fetch(`${API}/guilds/${guildId}/roles`, { headers: { Authorization: `Bot ${token}` } });
  if (!response.ok) throw badGateway(`Discord answered ${response.status} for the role list.`);
  const raw = (await response.json()) as RawRole[];
  return raw
    .filter((role) => isAssignableRole(role, guildId))
    .sort((a, b) => b.position - a.position)
    .map(({ id, name, color, position }) => ({ id, name, color, position }));
};

const discordRoles = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.discordRoles,
  handler: async ({ req, res }) => {
    await requireAdmin(req, site);
    const { DISCORD_BOT_TOKEN: token, DISCORD_GUILD_ID: guildId } = readHubEnv();
    if (!token) {
      res.status(200).json({ roles: [], available: false });
      return;
    }
    if (!cached || Date.now() - cached.at > CACHE_MS) cached = { at: Date.now(), roles: await fetchRoles(token, guildId) };
    res.status(200).json({ roles: cached.roles, available: true });
  },
});

export { discordRoles };

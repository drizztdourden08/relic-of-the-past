/* @layer root-config @kind logic */
/**
 * GET /discord/roles. The server's roles for the group editor's picker, read with the
 * Sanctuary bot (no permissions, it only has to be in the server). Leaves out
 * @everyone and the roles Discord manages for bots and integrations, since nobody can
 * be given those by hand. Cached for a minute. Without a bot token the answer is an
 * empty list and `available: false`, and the editor falls back to typing an id.
 */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import type { DiscordRole } from '../../../../shared/sanctuary';
import { readEnv } from '../env';
import { badGateway } from '../http/http-error';
import { requireAdmin } from '../auth/require-admin';
import type { Route } from '../route.type';

type RawRole = { id: string; name: string; color: number; position: number; managed: boolean };

const API = 'https://discord.com/api/v10';
const CACHE_MS = 60_000;

let cached: { at: number; roles: DiscordRole[] } | null = null;

const fetchRoles = async (token: string, guildId: string): Promise<DiscordRole[]> => {
  const response = await fetch(`${API}/guilds/${guildId}/roles`, { headers: { Authorization: `Bot ${token}` } });
  if (!response.ok) throw badGateway(`Discord answered ${response.status} for the role list.`);
  const raw = (await response.json()) as RawRole[];
  return raw
    .filter((role) => role.id !== guildId && !role.managed)
    .sort((a, b) => b.position - a.position)
    .map(({ id, name, color, position }) => ({ id, name, color, position }));
};

const discordRoles: Route = {
  ...SANCTUARY_ROUTES.discordRoles,
  handler: async ({ req, res }) => {
    await requireAdmin(req);
    const { DISCORD_BOT_TOKEN: token, DISCORD_GUILD_ID: guildId } = readEnv();
    if (!token) {
      res.status(200).json({ roles: [], available: false });
      return;
    }
    if (!cached || Date.now() - cached.at > CACHE_MS) cached = { at: Date.now(), roles: await fetchRoles(token, guildId) };
    res.status(200).json({ roles: cached.roles, available: true });
  },
};

export { discordRoles };

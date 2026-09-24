/* @layer root-config @kind logic */
/** Discord as an identity source. Scopes: identify for the profile, email, and
 *  guilds.members.read so the access chain can read the user's own member
 *  object in the contributor guild with the same token. */
import { Discord } from 'arctic';
import { readEnv } from '../../env';
import { getJson } from './get-json';
import type { OAuthProvider } from './provider.type';

const SCOPES = ['identify', 'email', 'guilds.members.read'];
const API = 'https://discord.com/api';
const CDN = 'https://cdn.discordapp.com';

type DiscordUser = { id: string; username: string; email?: string | null; avatar?: string | null };

const client = (redirect: string): Discord => {
  const env = readEnv();
  return new Discord(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, redirect);
};

const avatarUrl = ({ id, avatar }: DiscordUser): string | null =>
  avatar ? `${CDN}/avatars/${id}/${avatar}.png?size=128` : null;

const discordProvider: OAuthProvider = {
  name: 'discord',
  authUrl: (state, verifier, redirect) => client(redirect).createAuthorizationURL(state, verifier, SCOPES),
  exchange: async (code, verifier, redirect) => ({
    accessToken: (await client(redirect).validateAuthorizationCode(code, verifier)).accessToken(),
  }),
  profile: async (accessToken) => {
    const user = await getJson<DiscordUser>(`${API}/users/@me`, accessToken);
    return { subject: user.id, handle: user.username, email: user.email ?? null, avatarUrl: avatarUrl(user) };
  },
};

export { discordProvider };

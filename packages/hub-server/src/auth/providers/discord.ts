/* @layer hub-core @kind logic */
import { Discord } from 'arctic';
import { readHubEnv } from '../../env';
import { API, CDN, SCOPES } from './discord.constants';
import type { DiscordUser } from './discord.type';
import { getJson } from './get-json';
import type { OAuthProvider } from './provider.type';

const client = (redirect: string): Discord => {
  const env = readHubEnv();
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

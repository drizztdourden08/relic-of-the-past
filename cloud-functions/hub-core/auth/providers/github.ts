/* @layer hub-core @kind logic */
import { GitHub } from 'arctic';
import { readHubEnv } from '../../env';
import { getJson } from './get-json';
import { API, SCOPES } from './github.constants';
import type { GitHubEmail, GitHubUser } from './github.type';
import type { OAuthProvider } from './provider.type';

const client = (redirect: string): GitHub => {
  const env = readHubEnv();
  return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, redirect);
};

const primaryEmail = async (accessToken: string, fallback: string | null): Promise<string | null> => {
  try {
    const emails = await getJson<GitHubEmail[]>(`${API}/user/emails`, accessToken);
    return emails.find((entry) => entry.primary && entry.verified)?.email ?? fallback;
  } catch {
    return fallback;
  }
};

const githubProvider: OAuthProvider = {
  name: 'github',
  authUrl: (state, _unusedPkceVerifier, redirect) => client(redirect).createAuthorizationURL(state, SCOPES),
  exchange: async (code, _unusedPkceVerifier, redirect) => ({
    accessToken: (await client(redirect).validateAuthorizationCode(code)).accessToken(),
  }),
  profile: async (accessToken) => {
    const user = await getJson<GitHubUser>(`${API}/user`, accessToken);
    return {
      subject: String(user.id),
      handle: user.login,
      email: await primaryEmail(accessToken, user.email ?? null),
      avatarUrl: user.avatar_url ?? null,
    };
  },
};

export { githubProvider };

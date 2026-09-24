/* @layer root-config @kind logic */
/** GitHub as an identity source. The handle is the login, which the issue body
 *  mentions and the collaborator rule looks up. GitHub's OAuth flow has no PKCE,
 *  so the verifier is ignored here; the signed state still binds the callback. */
import { GitHub } from 'arctic';
import { readEnv } from '../../env';
import { getJson } from './get-json';
import type { OAuthProvider } from './provider.type';

const SCOPES = ['read:user', 'user:email'];
const API = 'https://api.github.com';

type GitHubUser = { id: number; login: string; avatar_url?: string | null; email?: string | null };
type GitHubEmail = { email: string; primary: boolean; verified: boolean };

const client = (redirect: string): GitHub => {
  const env = readEnv();
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
  authUrl: (state, _verifier, redirect) => client(redirect).createAuthorizationURL(state, SCOPES),
  exchange: async (code, _verifier, redirect) => ({
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

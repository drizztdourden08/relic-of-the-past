/* @layer hub-core @kind logic */
import { Google } from 'arctic';
import { readHubEnv } from '../../env';
import { getJson } from './get-json';
import { SCOPES, USERINFO } from './google.constants';
import type { GoogleUser } from './google.type';
import type { OAuthProvider } from './provider.type';

const client = (redirect: string): Google => {
  const env = readHubEnv();
  return new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirect);
};

const googleProvider: OAuthProvider = {
  name: 'google',
  authUrl: (state, verifier, redirect) => client(redirect).createAuthorizationURL(state, verifier, SCOPES),
  exchange: async (code, verifier, redirect) => ({
    accessToken: (await client(redirect).validateAuthorizationCode(code, verifier)).accessToken(),
  }),
  profile: async (accessToken) => {
    const user = await getJson<GoogleUser>(USERINFO, accessToken);
    return {
      subject: user.sub,
      handle: user.email ?? user.name ?? user.sub,
      email: user.email ?? null,
      avatarUrl: user.picture ?? null,
    };
  },
};

export { googleProvider };

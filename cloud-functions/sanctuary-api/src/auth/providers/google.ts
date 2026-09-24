/* @layer root-config @kind logic */
/** Google as an identity source. The subject is the stable `sub`; the handle is
 *  the email, which is the only name Google shows that a contributor recognises. */
import { Google } from 'arctic';
import { readEnv } from '../../env';
import { getJson } from './get-json';
import type { OAuthProvider } from './provider.type';

const SCOPES = ['openid', 'email', 'profile'];
const USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';

type GoogleUser = { sub: string; email?: string | null; name?: string | null; picture?: string | null };

const client = (redirect: string): Google => {
  const env = readEnv();
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

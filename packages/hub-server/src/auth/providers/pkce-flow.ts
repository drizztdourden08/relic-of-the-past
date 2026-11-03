/* @layer hub-core @kind logic */
import type { PkceClient, PkceFlow } from './pkce-flow.type';

const pkceFlow = (client: (redirect: string) => PkceClient, scopes: string[]): PkceFlow => ({
  authUrl: (state, verifier, redirect) => client(redirect).createAuthorizationURL(state, verifier, scopes),
  exchange: async (code, verifier, redirect) => ({
    accessToken: (await client(redirect).validateAuthorizationCode(code, verifier)).accessToken(),
  }),
});

export { pkceFlow };

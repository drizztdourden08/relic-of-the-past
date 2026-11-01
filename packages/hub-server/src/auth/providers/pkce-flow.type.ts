/* @layer hub-core @kind types */
type PkceClient = {
  createAuthorizationURL: (state: string, verifier: string, scopes: string[]) => URL;
  validateAuthorizationCode: (code: string, verifier: string) => Promise<{ accessToken: () => string }>;
};

type PkceFlow = {
  authUrl: (state: string, verifier: string, redirect: string) => URL;
  exchange: (code: string, verifier: string, redirect: string) => Promise<{ accessToken: string }>;
};

export type { PkceClient, PkceFlow };

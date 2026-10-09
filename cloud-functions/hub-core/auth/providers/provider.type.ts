/* @layer hub-core @kind types */
import type { Provider } from '../../../../shared/hub';

type ProviderProfile = {
  subject: string;
  handle: string;
  email: string | null;
  avatarUrl: string | null;
};

type OAuthProvider = {
  name: Provider;
  authUrl: (state: string, verifier: string, redirect: string) => URL;
  exchange: (code: string, verifier: string, redirect: string) => Promise<{ accessToken: string }>;
  profile: (accessToken: string) => Promise<ProviderProfile>;
};

export type { ProviderProfile, OAuthProvider };

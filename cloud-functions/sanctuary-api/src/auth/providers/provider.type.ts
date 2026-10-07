/* @layer root-config @kind types */
import type { Provider } from '../../../../../shared/sanctuary';

type ProviderProfile = {
  subject: string;
  handle: string;
  email: string | null;
  avatarUrl: string | null;
};

/** One identity source. The start and callback routes pick a provider by name
 *  and never branch on it again; a fourth provider is one more file. */
type OAuthProvider = {
  name: Provider;
  authUrl: (state: string, verifier: string, redirect: string) => URL;
  exchange: (code: string, verifier: string, redirect: string) => Promise<{ accessToken: string }>;
  profile: (accessToken: string) => Promise<ProviderProfile>;
};

export type { ProviderProfile, OAuthProvider };

/* @layer hub-core @kind types */
import type { Provider } from '@rotp/hub-contracts';

type OauthIntent = 'signin' | 'link' | 'device';
type OauthState = { provider: Provider; intent: OauthIntent; verifier: string; returnTo: string };
type SignedOauthState = OauthState & { jti: string };

export type { OauthIntent, OauthState, SignedOauthState };

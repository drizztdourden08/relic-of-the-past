/* @layer hub-core @kind types */
import type { Provider } from '../../../../shared/hub';

type OauthIntent = 'signin' | 'link' | 'device';
type OauthState = { provider: Provider; intent: OauthIntent; verifier: string; returnTo: string };
type SignedOauthState = OauthState & { jti: string };

export type { OauthIntent, OauthState, SignedOauthState };

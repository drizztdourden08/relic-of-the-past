/* @layer hub-core @kind logic */
import { isProvider } from '@rotp/hub-contracts';
import { OAUTH_INTENTS } from './oauth-state.constants';
import type { SignedOauthState } from './oauth-state.type';

const isSignedOauthState = (payload: Record<string, unknown>): payload is SignedOauthState =>
  typeof payload.jti === 'string'
  && isProvider(payload.provider)
  && OAUTH_INTENTS.some((intent) => intent === payload.intent)
  && typeof payload.verifier === 'string'
  && typeof payload.returnTo === 'string';

export { isSignedOauthState };

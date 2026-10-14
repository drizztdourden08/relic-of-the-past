/* @layer hub-core @kind logic */
import type { Identity } from '@rotp/hub-contracts';
import type { OauthState } from '../auth/oauth-state';
import type { Session } from '../auth/session';
import type { CallbackConflict } from './auth-callback.type';

const callbackConflict = (state: OauthState, current: Session | null, existing: Identity | null): CallbackConflict | null => {
  if (state.intent === 'link' && !current) return { returnTo: '/', error: 'session-expired' };
  if (current && existing && existing.userId !== current.userId) return { returnTo: state.returnTo, error: 'already-linked' };
  return null;
};

export { callbackConflict };

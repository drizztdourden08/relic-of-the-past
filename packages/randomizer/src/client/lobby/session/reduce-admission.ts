/* @layer bridge-wasm @kind logic */
import type { LobbyEvent } from './lobby-event.type';
import type { LobbyJoinState } from './lobby-state.type';

const reduceAdmission = (
  state: LobbyJoinState,
  event: Extract<LobbyEvent, { type: 'admission' }>,
): LobbyJoinState => {
  const final = event.state === 'refused' || event.state === 'removed' ? event.state : null;
  return {
    ...state,
    admission: event.state,
    admissionReason: event.reason,
    end: final ?? state.end,
    forgetToken: final !== null || state.forgetToken,
  };
};

export { reduceAdmission };

/* @layer bridge-wasm @kind logic */
import type { LobbyEvent } from './lobby-event.type';
import type { LobbyJoinState } from './lobby-state.type';
import { withUploads } from './with-uploads';

const reduceWelcome = (
  state: LobbyJoinState,
  event: Extract<LobbyEvent, { type: 'welcome' }>,
): LobbyJoinState => {
  const { member, lobby } = event.welcome;
  return withUploads({
    ...state,
    token: member.token,
    memberId: member.id,
    resumed: member.resumed === true,
    trust: member.trust,
    admission: member.admission,
    lobby,
    phase: lobby.phase,
    reconnecting: false,
  }, event.uploads);
};

export { reduceWelcome };

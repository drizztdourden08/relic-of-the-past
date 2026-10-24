/* @layer bridge-wasm @kind logic */
import type { LobbyState } from '@archipelia/lobby-protocol';
import type { LobbyJoinState } from './lobby-state.type';

const applyLobbyState = (state: LobbyJoinState, lobbyState: LobbyState): LobbyJoinState => {
  const own = lobbyState.members.find((member) => member.id === state.memberId);
  return {
    ...state,
    phase: lobbyState.phase,
    others: lobbyState.others ?? null,
    slots: own?.slots ?? state.slots,
    ready: own?.ready ?? state.ready,
    admission: own !== undefined && state.end === null ? own.admission : state.admission,
  };
};

export { applyLobbyState };

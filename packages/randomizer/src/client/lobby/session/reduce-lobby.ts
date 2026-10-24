/* @layer bridge-wasm @kind logic */
import type { LobbyEvent } from './lobby-event.type';
import { LOBBY_REDUCERS } from './lobby-reducers.constants';
import type { LobbyJoinState } from './lobby-state.type';
import type { AnyReducer } from './reduce-lobby.type';
import { statusOf } from './status-of';

const reduceLobby = (state: LobbyJoinState, event: LobbyEvent): LobbyJoinState => {
  const reducer = LOBBY_REDUCERS[event.type] as AnyReducer;
  const next = reducer(state, event);
  return { ...next, status: statusOf(next) };
};

export { reduceLobby };

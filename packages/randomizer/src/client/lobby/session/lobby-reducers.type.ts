/* @layer bridge-wasm @kind types */
import type { LobbyEvent } from './lobby-event.type';
import type { LobbyJoinState } from './lobby-state.type';

type LobbyReducers = {
  [K in LobbyEvent['type']]: (state: LobbyJoinState, event: Extract<LobbyEvent, { type: K }>) => LobbyJoinState;
};

export type { LobbyReducers };

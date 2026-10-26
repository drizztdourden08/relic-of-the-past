/* @layer bridge-wasm @kind types */
import type { LobbyEvent } from './lobby-event.type';
import type { LobbyJoinState } from './lobby-state.type';

type AnyReducer = (state: LobbyJoinState, event: LobbyEvent) => LobbyJoinState;

export type { AnyReducer };

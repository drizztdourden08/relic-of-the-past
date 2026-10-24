/* @layer bridge-wasm @kind logic */
import type { LobbyJoinState } from './lobby-state.type';

const initialState = (token: string | null): LobbyJoinState => ({
  status: 'connecting',
  token,
  memberId: null,
  resumed: false,
  trust: null,
  admission: null,
  admissionReason: null,
  lobby: null,
  phase: null,
  uploads: [],
  uploadsDone: false,
  slots: [],
  others: null,
  ready: false,
  progress: null,
  generationFailure: null,
  started: null,
  room: null,
  problem: null,
  failure: null,
  reconnecting: false,
  end: null,
  forgetToken: false,
});

export { initialState };

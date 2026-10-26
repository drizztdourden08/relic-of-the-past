/* @layer bridge-wasm @kind logic */
import type { LobbyJoinState, LobbyStatus } from './lobby-state.type';

const waitingStatus = (state: LobbyJoinState): LobbyStatus => {
  if (state.memberId === null) return 'connecting';
  if (!state.uploadsDone) return 'uploading';
  return state.admission === 'approved' ? 'approved' : 'pending';
};

const statusOf = (state: LobbyJoinState): LobbyStatus => {
  if (state.failure !== null) return 'failed';
  if (state.end !== null) return state.end;
  if (state.started !== null) return 'started';
  if (state.progress !== null) return 'generating';
  return waitingStatus(state);
};

export { statusOf };

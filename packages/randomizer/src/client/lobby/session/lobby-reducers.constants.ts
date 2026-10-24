/* @layer bridge-wasm @kind constants */
import { applyLobbyState } from './apply-lobby-state';
import type { LobbyReducers } from './lobby-reducers.type';
import { mapUpload } from './map-upload';
import { reduceAdmission } from './reduce-admission';
import { reduceWelcome } from './reduce-welcome';
import { withUploads } from './with-uploads';

const LOBBY_REDUCERS: LobbyReducers = {
  info: (state) => state,
  connected: (state) => ({ ...state, reconnecting: false }),
  welcome: reduceWelcome,
  'upload-progress': (state, event) => mapUpload(state, event.sha256, (upload) => ({ ...upload, sent: event.sent })),
  'upload-done': (state, event) =>
    mapUpload(state, event.sha256, (upload) => ({ ...upload, sent: upload.size, done: true })),
  'slots-ok': (state, event) => withUploads(state, event.uploads),
  admission: reduceAdmission,
  'lobby-state': (state, event) => applyLobbyState(state, event.lobbyState),
  ready: (state, event) => ({ ...state, ready: event.ready }),
  progress: (state, event) => ({ ...state, progress: event.progress, generationFailure: null }),
  'generation-failed': (state, event) => ({
    ...state,
    progress: null,
    generationFailure: { stage: event.stage, message: event.message },
  }),
  started: (state, event) => ({ ...state, started: event.started, progress: null }),
  room: (state, event) => ({ ...state, room: { state: event.state, address: event.address } }),
  problem: (state, event) => ({ ...state, problem: event.problem }),
  reconnecting: (state) => ({ ...state, reconnecting: true }),
  failed: (state, event) => ({ ...state, failure: event.failure, forgetToken: event.failure.forgetToken }),
  closed: (state, event) => ({ ...state, end: 'closed', forgetToken: event.reason === 'left' }),
};

export { LOBBY_REDUCERS };

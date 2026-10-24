/* @layer bridge-wasm @kind logic */
import type { LobbyJoinState, UploadProgress } from './lobby-state.type';

const withUploads = (state: LobbyJoinState, uploads: UploadProgress[]): LobbyJoinState => ({
  ...state,
  uploads,
  uploadsDone: uploads.every((upload) => upload.done),
});

export { withUploads };

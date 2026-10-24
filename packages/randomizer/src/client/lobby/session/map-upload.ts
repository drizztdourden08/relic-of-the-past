/* @layer bridge-wasm @kind logic */
import type { LobbyJoinState, UploadProgress } from './lobby-state.type';
import { withUploads } from './with-uploads';

const mapUpload = (
  state: LobbyJoinState,
  sha256: string,
  change: (upload: UploadProgress) => UploadProgress,
): LobbyJoinState =>
  withUploads(state, state.uploads.map((upload) => (upload.sha256 === sha256 ? change(upload) : upload)));

export { mapUpload };

/* @layer bridge-wasm @kind logic */
import type { ServerMessage } from '@archipelia/lobby-protocol';
import { finishUpload } from './finish-upload';
import { handleUploadError } from './handle-upload-error';
import { sendChunks } from './send-chunks';
import type { UploadState, UploaderDeps } from './uploader.type';

const handleUploadMessage = (deps: UploaderDeps, state: UploadState, message: ServerMessage): boolean => {
  const target = state.current;
  if (target === null) return false;
  if (message.type === 'error') return handleUploadError(deps, state, target, message);
  if (message.type === 'upload.ready' && message.sha256 === target.file.sha256) {
    void sendChunks(deps, state, target, message.offset);
    return true;
  }
  if (message.type === 'upload.done' && message.sha256 === target.file.sha256) {
    finishUpload(deps, state, target, message.ok);
    return true;
  }
  return false;
};

export { handleUploadMessage };

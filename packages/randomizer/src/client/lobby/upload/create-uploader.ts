/* @layer bridge-wasm @kind logic */
import { handleUploadMessage } from './handle-upload-message';
import { nextUpload } from './next-upload';
import type { UploadState, Uploader, UploaderDeps } from './uploader.type';

const createUploader = (deps: UploaderDeps): Uploader => {
  const state: UploadState = { queue: [], current: null, cancelled: false };
  return {
    start: (hashes) => {
      state.queue = [...hashes];
      nextUpload(deps, state);
    },
    handle: (message) => handleUploadMessage(deps, state, message),
    cancel: () => {
      state.cancelled = true;
      state.current = null;
    },
  };
};

export { createUploader };

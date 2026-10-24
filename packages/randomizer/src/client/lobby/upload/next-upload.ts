/* @layer bridge-wasm @kind logic */
import { beginUpload } from './begin-upload';
import type { UploadState, UploaderDeps } from './uploader.type';

const nextUpload = (deps: UploaderDeps, state: UploadState): void => {
  for (let sha256 = state.queue.shift(); sha256 !== undefined; sha256 = state.queue.shift()) {
    const file = deps.files.get(sha256);
    if (file !== undefined) {
      beginUpload(deps, state, file, 0);
      return;
    }
  }
  state.current = null;
  deps.onIdle();
};

export { nextUpload };

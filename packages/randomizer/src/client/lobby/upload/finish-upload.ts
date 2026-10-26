/* @layer bridge-wasm @kind logic */
import { nextUpload } from './next-upload';
import type { CurrentUpload, UploadState, UploaderDeps } from './uploader.type';

const finishUpload = (deps: UploaderDeps, state: UploadState, target: CurrentUpload, ok: boolean): void => {
  if (!ok) {
    deps.fail({ code: 'upload-failed', message: 'The server could not store the file.' });
    return;
  }
  deps.emit({ type: 'upload-done', sha256: target.file.sha256 });
  nextUpload(deps, state);
};

export { finishUpload };

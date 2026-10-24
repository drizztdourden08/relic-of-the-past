/* @layer bridge-wasm @kind logic */
import type { ErrorMessage } from '@archipelia/lobby-protocol';
import { problemOfError } from '../failure';
import { HASH_MISMATCH_RETRIES } from '../lobby.constants';
import { beginUpload } from './begin-upload';
import type { CurrentUpload, UploadState, UploaderDeps } from './uploader.type';

const handleUploadError = (
  deps: UploaderDeps,
  state: UploadState,
  target: CurrentUpload,
  message: ErrorMessage,
): boolean => {
  const mismatch = message.code === 'upload-hash-mismatch';
  if (message.fatal || (message.re !== target.seq && !mismatch)) return false;
  if (mismatch && target.attempt < HASH_MISMATCH_RETRIES) beginUpload(deps, state, target.file, target.attempt + 1);
  else deps.fail(problemOfError(message));
  return true;
};

export { handleUploadError };

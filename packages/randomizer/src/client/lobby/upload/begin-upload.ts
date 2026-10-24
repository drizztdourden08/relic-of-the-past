/* @layer bridge-wasm @kind logic */
import type { PreparedFile } from '../join/prepared-join.type';
import type { UploadState, UploaderDeps } from './uploader.type';

const beginUpload = (deps: UploaderDeps, state: UploadState, file: PreparedFile, attempt: number): void => {
  const seq = deps.link.nextSeq();
  state.current = { file, seq, attempt };
  deps.link.send({ type: 'upload.begin', seq, sha256: file.sha256, kind: file.kind, size: file.size });
};

export { beginUpload };

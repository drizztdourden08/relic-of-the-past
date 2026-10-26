/* @layer bridge-wasm @kind logic */
import { bytesToBase64 } from '../crypto/bytes-to-base64';
import type { CurrentUpload, UploadState, UploaderDeps } from './uploader.type';

const pause = (): Promise<void> => new Promise((resolve) => { setTimeout(resolve, 0); });

const sendChunks = async (
  deps: UploaderDeps,
  state: UploadState,
  target: CurrentUpload,
  from: number,
): Promise<void> => {
  const { bytes, sha256, size } = target.file;
  for (let offset = from; offset < bytes.length; offset += deps.chunkBytes) {
    if (state.cancelled || state.current !== target) return;
    const chunk = bytes.subarray(offset, offset + deps.chunkBytes);
    deps.link.send({ type: 'upload.chunk', sha256, offset, data: bytesToBase64(chunk) });
    deps.emit({ type: 'upload-progress', sha256, sent: Math.min(offset + chunk.length, size) });
    await pause();
  }
};

export { sendChunks };

/* @layer bridge-wasm @kind logic */
import type { FileChunk } from '@drizztdourden08/archipelia-lobby-protocol';
import { base64ToBytes } from '../crypto/base64-to-bytes';
import type { SessionCtx } from '../session/session-context.type';

const onFileChunk = (ctx: SessionCtx, message: FileChunk): void => {
  const download = message.re === undefined ? undefined : ctx.downloads.get(message.re);
  download?.parts.push({ offset: message.offset, bytes: base64ToBytes(message.data) });
};

export { onFileChunk };

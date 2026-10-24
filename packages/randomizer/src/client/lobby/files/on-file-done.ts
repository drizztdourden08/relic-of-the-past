/* @layer bridge-wasm @kind logic */
import type { FileDone } from '@archipelia/lobby-protocol';
import { sha256Hex } from '../crypto/sha256-hex';
import type { SessionCtx } from '../session/session-context.type';
import { joinParts } from './join-parts';

const onFileDone = async (ctx: SessionCtx, message: FileDone): Promise<void> => {
  const seq = message.re;
  const download = seq === undefined ? undefined : ctx.downloads.get(seq);
  if (seq === undefined || download === undefined) return;
  ctx.downloads.delete(seq);
  const bytes = joinParts(download.parts);
  if ((await sha256Hex(bytes)) === message.sha256) download.resolve(bytes);
  else download.reject(new Error('The downloaded file does not match its hash.'));
};

export { onFileDone };

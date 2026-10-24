/* @layer bridge-wasm @kind logic */
import type { SessionCtx } from '../session/session-context.type';

const downloadFile = (ctx: SessionCtx, fileId: string): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const { link } = ctx;
    if (link === null) {
      reject(new Error('The lobby connection is closed.'));
      return;
    }
    const seq = link.nextSeq();
    ctx.downloads.set(seq, { fileId, parts: [], resolve, reject });
    link.send({ type: 'file.get', seq, fileId });
  });

export { downloadFile };

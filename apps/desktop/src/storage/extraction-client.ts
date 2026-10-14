/* @layer renderer-lib @kind logic */
import ExtractWorker from '@app/game/extract-assets-worker?worker';
import { log } from '../log-bus';
import type { ExtractReply } from '@app/game/extract-assets-worker.type';

const runOnWorker = <T>(message: unknown): Promise<T> =>
  new Promise((resolve, reject) => {
    const worker = new ExtractWorker();
    worker.onmessage = (e: MessageEvent<ExtractReply<T>>) => {
      if ('warn' in e.data) {
        log.app(e.data.warn, 'warn');
        return;
      }
      worker.terminate();
      if (e.data.ok) resolve(e.data.result);
      else reject(new Error(e.data.error));
    };
    worker.onerror = (err) => { worker.terminate(); reject(new Error(err.message)); };
    worker.postMessage(message);
  });

export { runOnWorker };

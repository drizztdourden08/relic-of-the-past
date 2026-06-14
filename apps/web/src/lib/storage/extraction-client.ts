/* @layer renderer-lib @kind logic */
/** Posts a job to the extraction Web Worker and resolves its result (one worker per job). */
import ExtractWorker from '@app/lib/game/extract-assets.worker?worker';

const runOnWorker = <T>(message: unknown): Promise<T> =>
  new Promise((resolve, reject) => {
    const worker = new ExtractWorker();
    worker.onmessage = (e: MessageEvent<{ ok: boolean; result?: T; error?: string }>) => {
      worker.terminate();
      if (e.data.ok) resolve(e.data.result as T);
      else reject(new Error(e.data.error ?? 'Extraction failed'));
    };
    worker.onerror = (err) => { worker.terminate(); reject(new Error(err.message)); };
    worker.postMessage(message);
  });

export { runOnWorker };

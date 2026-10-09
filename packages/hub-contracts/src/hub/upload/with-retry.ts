/* @layer shared-hub @kind logic */
import { RETRY_BASE_MS, RETRY_FACTOR } from './with-retry.constants';

const pause = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (signal?.aborted) {
    reject(signal.reason);
    return;
  }
  const timer = setTimeout(() => {
    signal?.removeEventListener('abort', stop);
    resolve();
  }, ms);
  const stop = () => {
    clearTimeout(timer);
    reject(signal?.reason);
  };
  signal?.addEventListener('abort', stop, { once: true });
});

const withRetry = async <T>(tries: number, step: () => Promise<T>, signal?: AbortSignal): Promise<T> => {
  let wait = RETRY_BASE_MS;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await step();
    } catch (error) {
      if (signal?.aborted || attempt >= tries) throw error;
      await pause(wait, signal);
      wait *= RETRY_FACTOR;
    }
  }
};

export { withRetry };

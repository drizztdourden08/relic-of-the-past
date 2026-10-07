/* @layer shared-hub @kind logic */
/**
 * Runs a step up to `tries` times, waiting a little longer after each failure. A cancelled
 * run (its signal aborted) stops at once and throws the cancel, so a cancel is never retried.
 */
const RETRY_BASE_MS = 1000;
const RETRY_FACTOR = 3;

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

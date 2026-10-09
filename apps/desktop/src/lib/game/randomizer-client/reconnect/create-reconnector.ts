/* @layer bridge-wasm @kind logic */
import { backoffDelay } from './backoff-delay';
import type { Reconnector, ScheduledListener } from './reconnect.type';

const createReconnector = (attempt: () => void, onScheduled?: ScheduledListener): Reconnector => {
  let tries = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  return {
    get pending() { return timer !== null; },
    schedule() {
      cancel();
      const delay = backoffDelay(tries);
      tries += 1;
      onScheduled?.(delay, tries);
      timer = setTimeout(() => {
        timer = null;
        attempt();
      }, delay);
    },
    cancel,
    reset() {
      cancel();
      tries = 0;
    },
  };
};

export { createReconnector };

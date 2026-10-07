/* @layer bridge-wasm @kind logic */
/**
 * Reconnect timing for a dropped room: 1 s, then doubling, never more than 30 s between
 * tries. A successful connect resets the ladder; a stop cancels the pending try.
 */

const BACKOFF_START_MS = 1000;
const BACKOFF_MAX_MS = 30000;

/** The wait before try number `attempt` (0-based). */
const backoffDelay = (attempt: number): number => Math.min(BACKOFF_START_MS * 2 ** attempt, BACKOFF_MAX_MS);

interface Reconnector {
  readonly pending: boolean;
  /** Queues the next try after the current backoff step. */
  schedule(): void;
  cancel(): void;
  /** Connected again: the next drop starts from the first step. */
  reset(): void;
}

/** `attempt` is 1 for the first try after a drop. */
type ScheduledListener = (delayMs: number, attempt: number) => void;

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

export { BACKOFF_MAX_MS, BACKOFF_START_MS, backoffDelay, createReconnector };
export type { Reconnector, ScheduledListener };

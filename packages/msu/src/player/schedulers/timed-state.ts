/* @layer renderer-lib @kind logic */
import type { TimedState } from './timed-state.type';

const createTimedState = (): TimedState => ({
  timer: null, live: [], dueAt: 0, currentWait: null, lastFileIndex: null,
});

export { createTimedState };

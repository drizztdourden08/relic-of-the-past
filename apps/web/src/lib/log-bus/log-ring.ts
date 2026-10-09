/* @layer renderer-lib @kind logic */
import type { LogEntry, LogListener } from './log-bus.type';

const logRing = {
  nextId: 0,
  entries: [] as LogEntry[],
  listeners: new Set<LogListener>(),
};

export { logRing };

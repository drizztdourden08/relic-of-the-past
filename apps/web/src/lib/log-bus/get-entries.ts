/* @layer renderer-lib @kind logic */
import type { LogEntry } from './log-bus.type';
import { logRing } from './log-ring';

const getEntries = (): LogEntry[] => [...logRing.entries];

export { getEntries };

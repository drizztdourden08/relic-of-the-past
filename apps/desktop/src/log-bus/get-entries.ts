/* @layer renderer-lib @kind logic */
import { getAppLog } from '@drizztdourden08/brock-react';
import type { LogEntry } from './log-bus.type';

const getEntries = (): LogEntry[] => getAppLog().getEntries() as LogEntry[];

export { getEntries };

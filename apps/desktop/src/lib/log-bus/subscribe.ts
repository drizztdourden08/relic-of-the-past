/* @layer renderer-lib @kind logic */
import { getAppLog } from '@drizztdourden08/brock-react';
import type { LogEntry, LogListener } from './log-bus.type';

const subscribe = (listener: LogListener): () => void =>
  getAppLog().subscribe((entry) => listener(entry as LogEntry));

export { subscribe };

/* @layer bridge-wasm @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { EventLogEntry } from '@app/ipc';
import { eventLogEnabled } from './event-log-enabled';

let chain: Promise<unknown> = Promise.resolve();

/** Queues one line for the main process to append to the --event-log file; lines keep the order they were queued in. */
const appendEvent = (entry: EventLogEntry): void => {
  if (!eventLogEnabled()) return;
  chain = chain.then(() => requireHostApi().appendEventLog(entry)).catch(() => undefined);
};

export { appendEvent };

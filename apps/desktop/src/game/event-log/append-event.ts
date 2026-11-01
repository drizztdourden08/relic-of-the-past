/* @layer bridge-wasm @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { EventLogEntry } from '@app/ipc';
import { eventLogEnabled } from './event-log-enabled';

let chain: Promise<unknown> = Promise.resolve();

const appendEvent = (entry: EventLogEntry): void => {
  if (!eventLogEnabled()) return;
  chain = chain.then(() => requireHostApi().appendEventLog(entry)).catch(() => undefined);
};

export { appendEvent };

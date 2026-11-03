/* @layer bridge-wasm @kind logic */
import { appendEvent } from './append-event';

const logDisconnected = (reason: string): void => appendEvent({ t: 'disconnected', reason });

export { logDisconnected };

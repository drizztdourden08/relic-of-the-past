/* @layer bridge-wasm @kind logic */
import { appendEvent } from './append-event';

const logConnected = (slot: string, server: string): void => appendEvent({ t: 'connected', slot, server });

export { logConnected };

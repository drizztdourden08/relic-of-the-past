/* @layer bridge-wasm @kind logic */
import { appendEvent } from './append-event';

const logLobbyJoinRefused = (reason: string, code?: string): void =>
  appendEvent({ t: 'lobby-join-refused', reason, ...(code === undefined ? {} : { code }) });

export { logLobbyJoinRefused };

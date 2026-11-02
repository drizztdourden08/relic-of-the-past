/* @layer bridge-wasm @kind logic */
import { appendEvent } from './append-event';

const logLobbyJoinRefused = (reason: string): void => appendEvent({ t: 'lobby-join-refused', reason });

export { logLobbyJoinRefused };

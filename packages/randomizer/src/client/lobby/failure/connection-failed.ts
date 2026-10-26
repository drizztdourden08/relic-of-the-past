/* @layer bridge-wasm @kind logic */
import type { LobbyFailure } from './lobby-failure.type';

const connectionFailed = (server: string): LobbyFailure => ({
  code: 'connection-failed',
  message: `Could not connect to ${server}. Check the address, and that the server is running.`,
  forgetToken: false,
});

export { connectionFailed };

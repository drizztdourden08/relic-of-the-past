/* @layer bridge-wasm @kind logic */
import type { LobbyFailure } from './lobby-failure.type';

const timedOut = (): LobbyFailure => ({
  code: 'timeout',
  message: 'The server did not answer in time.',
  forgetToken: false,
});

export { timedOut };

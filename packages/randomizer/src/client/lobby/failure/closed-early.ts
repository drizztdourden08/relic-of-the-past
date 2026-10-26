/* @layer bridge-wasm @kind logic */
import type { LobbyFailure } from './lobby-failure.type';

const closedEarly = (): LobbyFailure => ({
  code: 'closed',
  message: 'The server closed the connection before it answered.',
  forgetToken: false,
});

export { closedEarly };

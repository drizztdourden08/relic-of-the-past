/* @layer bridge-wasm @kind logic */
import type { LobbyFailure } from './lobby-failure.type';

const connectionLost = (): LobbyFailure => ({
  code: 'connection-lost',
  message: 'The connection to the lobby server was lost and could not be restored.',
  forgetToken: false,
});

export { connectionLost };

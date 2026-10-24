/* @layer bridge-wasm @kind logic */
import type { LobbyFailure } from './lobby-failure.type';

const invalidCode = (): LobbyFailure => ({
  code: 'lobby-not-found',
  message: 'That is not a lobby code. A code has 8 letters and digits, like K7QM-4XT2.',
  field: 'lobby.code',
  forgetToken: false,
});

export { invalidCode };

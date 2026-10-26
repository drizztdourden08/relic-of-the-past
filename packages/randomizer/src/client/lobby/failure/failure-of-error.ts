/* @layer bridge-wasm @kind logic */
import type { ErrorMessage } from '@drizztdourden08/archipelia-lobby-protocol';
import { TOKEN_DEAD_CODES } from './failure.constants';
import type { LobbyFailure } from './lobby-failure.type';
import { problemOfError } from './problem-of-error';

const failureOfError = (error: ErrorMessage): LobbyFailure => ({
  ...problemOfError(error),
  forgetToken: TOKEN_DEAD_CODES.includes(error.code),
});

export { failureOfError };

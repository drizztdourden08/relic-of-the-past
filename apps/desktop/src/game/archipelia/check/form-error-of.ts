/* @layer bridge-wasm @kind logic */
import type { LobbyProblem, LobbyRef } from '@rotp/randomizer';
import { FORM_ERRORS, NOT_LISTED, UNREACHABLE_CODES } from './form-error.constants';

const formErrorOf = (failure: LobbyProblem, server: string, lobby?: LobbyRef): string => {
  if (failure.code === 'lobby-not-found' && lobby?.joinToken !== undefined) return NOT_LISTED;
  if (UNREACHABLE_CODES.includes(failure.code)) return `Could not reach ${server}.`;
  if (failure.code === 'rate-limited') return `Too many tries. Wait ${failure.retryAfter ?? 60} s.`;
  return FORM_ERRORS[failure.code] ?? failure.message;
};

export { formErrorOf };

/* @layer bridge-wasm @kind logic */
import type { LobbyProblem } from '@rotp/randomizer';
import { FORM_ERRORS, UNREACHABLE_CODES } from './form-error.constants';

const formErrorOf = (failure: LobbyProblem, server: string): string => {
  if (UNREACHABLE_CODES.includes(failure.code)) return `Could not reach ${server}.`;
  if (failure.code === 'rate-limited') return `Too many tries. Wait ${failure.retryAfter ?? 60} s.`;
  return FORM_ERRORS[failure.code] ?? failure.message;
};

export { formErrorOf };

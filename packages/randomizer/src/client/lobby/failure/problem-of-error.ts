/* @layer bridge-wasm @kind logic */
import type { ErrorMessage } from '@archipelia/lobby-protocol';
import type { LobbyProblem } from './lobby-failure.type';

const problemOfError = (error: ErrorMessage): LobbyProblem => {
  const problem: LobbyProblem = { code: error.code, message: error.message };
  if (error.field !== undefined) problem.field = error.field;
  if (error.slot !== undefined) problem.slot = error.slot;
  if (error.retryAfter !== undefined) problem.retryAfter = error.retryAfter;
  if (error.supported !== undefined) problem.supported = error.supported;
  if (error.lobbyAp !== undefined) problem.lobbyAp = error.lobbyAp;
  return problem;
};

export { problemOfError };

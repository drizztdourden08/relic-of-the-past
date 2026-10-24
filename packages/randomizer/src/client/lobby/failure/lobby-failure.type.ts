/* @layer bridge-wasm @kind types */
import type { ErrorCode } from '@archipelia/lobby-protocol';

type LobbyFailureCode =
  | ErrorCode
  | 'connection-failed'
  | 'connection-lost'
  | 'timeout'
  | 'closed'
  | 'upload-failed';

type LobbyProblem = {
  code: LobbyFailureCode;
  message: string;
  field?: string;
  slot?: string;
  retryAfter?: number;
  supported?: number[];
  lobbyAp?: string;
};

type LobbyFailure = LobbyProblem & { forgetToken: boolean };

export type { LobbyFailure, LobbyFailureCode, LobbyProblem };

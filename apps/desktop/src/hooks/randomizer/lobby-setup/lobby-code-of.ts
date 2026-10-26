/* @layer renderer-lib @kind logic */
import type { PatternValue } from '@drizztdourden08/tessera/composites';
import { formatLobbyCode } from '@rotp/randomizer';
import { CODE_HALF } from './lobby-draft.constants';
import { typedCode } from './typed-code';

const lobbyCodeOf = (code: PatternValue): string | null => {
  const typed = typedCode(code);
  return typed.length < CODE_HALF * 2 ? null : formatLobbyCode(typed);
};

export { lobbyCodeOf };

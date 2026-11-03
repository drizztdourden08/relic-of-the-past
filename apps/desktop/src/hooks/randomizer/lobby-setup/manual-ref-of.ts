/* @layer renderer-lib @kind logic */
import { lobbyCodeOf } from './lobby-code-of';
import type { RefStrategy } from './lobby-ref-of.type';

const manualRefOf: RefStrategy = (draft) => {
  const code = lobbyCodeOf(draft.code);
  return code === null ? null : { code };
};

export { manualRefOf };

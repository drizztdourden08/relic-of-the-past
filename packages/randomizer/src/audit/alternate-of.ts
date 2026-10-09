/* @layer shared-game @kind logic */
import { OWNED_DUPLICATE_PAIRS } from './comparator-vanilla.constants';

const alternateOf = (byte: number): number | null => {
  for (const [a, b] of OWNED_DUPLICATE_PAIRS) {
    if (byte === a) return b;
    if (byte === b) return a;
  }
  return null;
};

export { alternateOf };

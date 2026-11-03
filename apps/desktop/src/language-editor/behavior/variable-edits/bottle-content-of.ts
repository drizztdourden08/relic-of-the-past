/* @layer renderer-components @kind logic */
import { BOTTLE_PREFIX } from './variable-edits.constants';

const bottleContentOf = (key: string): number | null => {
  const suffix = key.startsWith(BOTTLE_PREFIX) ? key.slice(BOTTLE_PREFIX.length) : '';
  return /^\d+$/.test(suffix) ? Number(suffix) : null;
};

export { bottleContentOf };

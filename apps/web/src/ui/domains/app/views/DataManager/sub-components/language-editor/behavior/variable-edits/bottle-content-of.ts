/* @layer renderer-components @kind logic */
import { BOTTLE_PREFIX } from './variable-edits.constants';

const bottleContentOf = (key: string): number | null => {
  if (!key.startsWith(BOTTLE_PREFIX)) return null;
  const digits = key.slice(BOTTLE_PREFIX.length);
  return /^\d+$/.test(digits) ? Number(digits) : null;
};

export { bottleContentOf };

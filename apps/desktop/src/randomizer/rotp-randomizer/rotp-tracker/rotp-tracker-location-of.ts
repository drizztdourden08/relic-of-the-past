/* @layer renderer-app @kind logic */
import { VIRTUAL_PREFIX, locationKeyOfCheck, virtualLocationOf } from '@rotp/randomizer';

const trackerLocationOf = (key: string): string =>
  key.startsWith(VIRTUAL_PREFIX) ? virtualLocationOf(key) : locationKeyOfCheck(key);

export { trackerLocationOf };

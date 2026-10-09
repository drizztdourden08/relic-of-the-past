/* @layer renderer-components @kind logic */
import type { Tally } from './options-summary.type';

const outOf = (tally: Tally): string => `${tally.count} of ${tally.total}`;

export { outOf };

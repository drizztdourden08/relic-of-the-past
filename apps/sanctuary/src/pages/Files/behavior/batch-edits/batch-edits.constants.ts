/* @layer sanctuary-site @kind constants */
import type { BatchTally } from './batch-edits.type';

const EMPTY_TALLY: BatchTally = { changed: 0, same: 0, skipped: 0, failed: 0 };

export { EMPTY_TALLY };

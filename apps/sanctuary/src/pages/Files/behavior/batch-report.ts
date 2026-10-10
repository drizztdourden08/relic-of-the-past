/* @layer sanctuary-site @kind logic */
import type { BatchTally } from './batch-edits.type';

const batchReport = (tally: BatchTally, verb: string): string => {
  const parts = [
    `${tally.changed} ${verb}`,
    tally.same > 0 && `${tally.same} already set`,
    tally.skipped > 0 && `${tally.skipped} skipped (not yours)`,
    tally.failed > 0 && `${tally.failed} failed`,
  ].filter(Boolean);
  return `${parts.join(', ')}.`;
};

export { batchReport };

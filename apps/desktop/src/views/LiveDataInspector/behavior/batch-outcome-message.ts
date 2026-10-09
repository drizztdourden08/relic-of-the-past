/* @layer renderer-widgets @kind logic */
import type { BatchResult } from '@app/views/DataInspector/behavior/recommendations/accept-all-certain';

const batchOutcomeMessage = (result: BatchResult): string | null => {
  const left = result.skipped.length + result.failures.length;
  if (left === 0) return null;
  return `Wrote ${result.accepted}; ${left} still need a look in the Data Inspector.`;
};

export { batchOutcomeMessage };

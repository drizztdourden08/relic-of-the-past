/* @layer renderer-app @kind logic */
import type { BatchResult } from './recommendations.type';
import { findingCount } from './finding-count';

const batchMessage = (result: BatchResult): string | null => {
  const parts: string[] = [];
  if (result.failures.length > 0) parts.push(`${findingCount(result.failures.length)} could not be written`);
  if (result.skipped.length > 0) parts.push(`${findingCount(result.skipped.length)} need more detail first`);
  return parts.length > 0 ? `${parts.join(', and ')}. They are still open.` : null;
};

export { batchMessage };

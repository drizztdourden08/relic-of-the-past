/* @layer shared-game @kind logic */
import type { DifferenceStatus } from './difference.type';

const classify = (hasDataset: boolean, hasLive: boolean): DifferenceStatus | null => {
  if (hasDataset && hasLive) return 'mismatch';
  if (hasLive) return 'missing-in-dataset';
  if (hasDataset) return 'unbacked-in-dataset';
  return null;
};

export { classify };

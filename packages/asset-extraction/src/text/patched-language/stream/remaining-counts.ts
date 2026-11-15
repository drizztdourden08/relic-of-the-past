/* @layer shared-asset-extraction @kind logic */
import { EXPECTED_MESSAGE_COUNTS } from './stream.constants';

const remainingCounts = (before: number): number[] =>
  EXPECTED_MESSAGE_COUNTS.map((total) => total - before).filter((count) => count > 0);

export { remainingCounts };

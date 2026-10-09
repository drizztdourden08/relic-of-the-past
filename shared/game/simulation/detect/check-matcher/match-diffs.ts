/* @layer shared-game @kind logic */
import type { FlagDiff } from '../../types';
import type { CheckRecord } from '@rotp/game-data';
import { matchDiff } from './match-diff';

const matchDiffs = (diffs: FlagDiff[]): CheckRecord | undefined => {
  for (const diff of diffs) {
    const matched = matchDiff(diff);
    if (matched) return matched;
  }
  return undefined;
};

export { matchDiffs };

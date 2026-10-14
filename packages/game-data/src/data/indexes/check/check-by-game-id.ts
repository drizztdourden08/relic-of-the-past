/* @layer shared-game @kind logic */
import type { CheckGameId, CheckRecord } from '../../types';
import { checkLookups } from './check-lookups';

const checkByGameId = (match: Partial<CheckGameId>): CheckRecord | undefined => {
  for (const lookup of checkLookups) {
    const hit = lookup(match);
    if (hit) return hit;
  }
  return undefined;
};

export { checkByGameId };

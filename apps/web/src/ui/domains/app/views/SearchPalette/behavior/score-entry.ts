/* @layer renderer-components @kind logic */
import type { SearchEntry } from '../SearchPalette.type';
import { KIND_BOOST } from '../SearchPalette.constants';
import { scoreToken } from './score-token';

const scoreEntry = (entry: SearchEntry, tokens: string[]): number | null => {
  let total = KIND_BOOST[entry.kind];
  for (const token of tokens) {
    const score = scoreToken(entry, token);
    if (score === 0) return null;
    total += score;
  }
  return total;
};

export { scoreEntry };

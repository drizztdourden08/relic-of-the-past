/* @layer shared-game @kind logic */
import { isSearchablePhrase } from './is-searchable-phrase';
import type { RunScan } from './types';

const scanRun = (text: string, phrase: string): RunScan => {
  const exact: number[] = [];
  const caseMiss: number[] = [];
  if (!isSearchablePhrase(phrase)) return { exact, caseMiss };

  const haystack = text.toLowerCase();
  const needle = phrase.toLowerCase();
  const aligned = haystack.length === text.length && needle.length === phrase.length;
  const source = aligned ? haystack : text;
  const target = aligned ? needle : phrase;

  let cursor = 0;
  for (;;) {
    const at = source.indexOf(target, cursor);
    if (at === -1) break;
    if (text.slice(at, at + phrase.length) === phrase) exact.push(at);
    else caseMiss.push(at);
    cursor = at + phrase.length;
  }

  return { exact, caseMiss };
};

export { scanRun };

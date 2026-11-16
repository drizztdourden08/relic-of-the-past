/* @layer shared-game @kind logic */
import { IPA_LETTERS, LATIN_RANGES } from '../latin-letters.constants';

const latinCandidates = (): string[] => {
  const chars: string[] = [];
  for (const [from, to] of LATIN_RANGES) for (let code = from; code <= to; code++) chars.push(String.fromCodePoint(code));
  return [...chars, ...IPA_LETTERS];
};

export { latinCandidates };

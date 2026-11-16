/* @layer shared-game @kind constants */
import { ANY_LETTER, PLAIN_LETTER } from './compose.constants';
import { latinCandidates } from './latin-candidates';
import { resolvesLetter } from './resolves-letter';

const LATIN_LETTERS: readonly string[] = [...new Set(latinCandidates())]
  .filter((char) => ANY_LETTER.test(char) && !PLAIN_LETTER.test(char) && resolvesLetter(char, 0))
  .sort((a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0));

const LATIN_LETTER_SET: ReadonlySet<string> = new Set(LATIN_LETTERS);

export { LATIN_LETTERS, LATIN_LETTER_SET };

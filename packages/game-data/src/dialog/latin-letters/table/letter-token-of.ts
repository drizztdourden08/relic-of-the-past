/* @layer shared-game @kind logic */
import { LETTER_TOKEN_BASE } from './letter-table.constants';

const letterTokenOf = (letter: number): string => String.fromCodePoint(LETTER_TOKEN_BASE + letter);

export { letterTokenOf };

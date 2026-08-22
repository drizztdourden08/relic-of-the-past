/* @layer shared-game @kind logic */
/**
 * Lines back to a token stream — the exact inverse of `splitLines`.
 *
 * Each line contributes its own advance code, its content, then a wait when it
 * ends a box, and NOTHING else. In particular no code is invented for a line
 * whose `advance` is null and none is corrected on a line whose advance disagrees
 * with its row: an entry that was only read, never edited, comes back out
 * identical, so opening it in the editor cannot rewrite a translator's data.
 *
 * A line that should be given a derived code has to be handed one first —
 * `advanceForNewLine` exists for exactly that, and only the caller knows a line
 * is new.
 */
import type { Token } from '../types';
import { tokenForAdvance, waitToken } from './advance-codes';
import type { DialogueLineView } from './types';

const tokensOfLine = (line: DialogueLineView): Token[] => {
  const { advance, tokens, endsBox } = line;
  const opener = tokenForAdvance(advance);

  return [
    ...(opener === null ? [] : [opener]),
    ...tokens,
    ...(endsBox ? [waitToken()] : []),
  ];
};

const joinLines = (lines: DialogueLineView[]): Token[] => lines.flatMap(tokensOfLine);

export { joinLines };

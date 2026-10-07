/* @layer shared-game @kind logic */
/**
 * A ChoiceShape back to one token stream. The exact inverse of
 * `choiceShapeOf`.
 *
 * The question slice is emitted verbatim, each option contributes its own
 * advance code and then its content untouched, and the prompt code closes the
 * stream, so decomposing an entry and rebuilding it yields a byte-identical
 * serialization. Nothing is corrected: an option whose advance disagrees with
 * its position goes back out exactly as it came in.
 */
import type { Token } from '../types';
import { tokenForAdvance } from '../lines/advance-codes';
import type { ChoiceOption, ChoiceShape } from './types';

const tokensOfOption = (option: ChoiceOption): Token[] => {
  const { advance, tokens } = option;
  const opener = tokenForAdvance(advance);
  return opener === null ? tokens : [opener, ...tokens];
};

const tokensFromChoice = (shape: ChoiceShape): Token[] => {
  const { code, question, options } = shape;
  return [...question, ...options.flatMap(tokensOfOption), { t: 'cmd', name: code }];
};

export { tokensFromChoice };

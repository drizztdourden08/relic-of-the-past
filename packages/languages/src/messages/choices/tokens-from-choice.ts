/* @layer shared-game @kind logic */
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

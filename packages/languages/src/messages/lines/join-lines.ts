/* @layer shared-game @kind logic */
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

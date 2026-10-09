/* @layer renderer-components @kind logic */
import type { Block } from '@rotp/languages';
import { OPTION_ROWS } from './preview.constants';
import type { ChoiceKind, PreviewChoice } from './preview.type';

const isChoiceKind = (name: string): name is ChoiceKind =>
  name === 'Choose' || name === 'Choose2' || name === 'Choose3';

const choiceOf = (block: Block): PreviewChoice | null => {
  for (const line of block.lines) {
    for (const token of line.tokens) {
      if (token.t === 'cmd' && isChoiceKind(token.name)) {
        return { kind: token.name, rows: [...OPTION_ROWS[token.name]] };
      }
    }
  }
  return null;
};

export { choiceOf };

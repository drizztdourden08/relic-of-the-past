/* @layer renderer-components @kind logic */
import type { JSONContent } from '@tiptap/core';
import type { Token } from '@rotp/languages';
import { DIALOGUE_TOKEN_TYPE } from '../token-attrs';
import { stringOf } from './string-of';
import { tokenFromAttrs } from './token-from-attrs';

const inlineTokensOf = (block: JSONContent): Token[] => {
  const tokens: Token[] = [];
  let run = '';

  const flush = (): void => {
    if (run === '') return;
    tokens.push({ t: 'text', v: run });
    run = '';
  };

  for (const node of block.content ?? []) {
    if (node.type === 'text') {
      run += stringOf(node.text);
      continue;
    }
    if (node.type !== DIALOGUE_TOKEN_TYPE) continue;
    const token = tokenFromAttrs(node.attrs);
    if (token === null) continue;
    flush();
    tokens.push(token);
  }
  flush();

  return tokens;
};

export { inlineTokensOf };

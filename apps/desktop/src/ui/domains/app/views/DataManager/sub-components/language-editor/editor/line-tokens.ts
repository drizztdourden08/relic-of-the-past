/* @layer renderer-components @kind logic */
import type { Token } from '@shared/game/language';
import type { Node as PmNode } from '@tiptap/pm/model';
import { tokenFromAttrs } from './attrs-to-token';

const tokensOfLine = (line: PmNode): Token[] => {
  const tokens: Token[] = [];
  line.forEach((child) => {
    if (child.isText) {
      if (child.text !== undefined && child.text.length > 0) tokens.push({ t: 'text', v: child.text });
      return;
    }
    const token = tokenFromAttrs(child.attrs);
    if (token !== null) tokens.push(token);
  });
  return tokens;
};

export { tokensOfLine };

/* @layer renderer-components @kind logic */
import type { JSONContent } from '@tiptap/core';
import type { Token } from '@rotp/languages';
import { DIALOGUE_TOKEN_TYPE } from './token-attrs.constants';
import { tokenToAttrs } from './token-to-attrs';

const tokenToNode = (token: Token): JSONContent | null => {
  const attrs = tokenToAttrs(token);
  return attrs === null ? null : { type: DIALOGUE_TOKEN_TYPE, attrs };
};

export { tokenToNode };

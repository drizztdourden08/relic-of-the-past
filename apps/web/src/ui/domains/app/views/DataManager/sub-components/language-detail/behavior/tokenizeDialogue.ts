/* @layer renderer-components @kind logic */
/** Splits a dialogue string into plain-text runs and bracketed control tokens like [Speed 00]. */
import type { DialogueToken } from '../language-detail.type';

const TOKEN_RE = /\[[^\]]*\]/g;

const tokenizeDialogue = (content: string): DialogueToken[] => {
  const tokens: DialogueToken[] = [];
  let last = 0;
  for (const match of content.matchAll(TOKEN_RE)) {
    const start = match.index;
    if (start > last) tokens.push({ type: 'text', value: content.slice(last, start) });
    tokens.push({ type: 'code', value: match[0] });
    last = start + match[0].length;
  }
  if (last < content.length) tokens.push({ type: 'text', value: content.slice(last) });
  return tokens;
};

export { tokenizeDialogue };

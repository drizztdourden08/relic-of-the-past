/* @layer renderer-components @kind logic */
import type { JSONContent } from '@tiptap/core';
import type { Token } from '@rotp/languages';
import { tokenToNode } from './token-to-node';

const appendText = (content: JSONContent[], value: string): void => {
  if (value === '') return;
  const last = content[content.length - 1];
  if (last?.type === 'text') {
    last.text = `${last.text ?? ''}${value}`;
    return;
  }
  content.push({ type: 'text', text: value });
};

const inlineContent = (tokens: Token[]): JSONContent[] => {
  const content: JSONContent[] = [];
  for (const token of tokens) {
    if (token.t === 'text') {
      appendText(content, token.v);
      continue;
    }
    const node = tokenToNode(token);
    if (node !== null) content.push(node);
  }
  return content;
};

export { inlineContent };

/* @layer renderer-components @kind logic */
import { attrsForLine } from './line-attrs';
import { inlineContent } from './token-attrs';
import type { JSONContent } from '@tiptap/core';
import type { DialogueLineView } from '@shared/game/language';
import { EMPTY_LINE } from './lines-to-doc.constants';

const paragraphOf = (line: DialogueLineView): JSONContent => {
  const attrs = attrsForLine(line.advance, line.endsBox);
  const content = inlineContent(line.tokens);
  return content.length === 0
    ? { type: 'paragraph', attrs }
    : { type: 'paragraph', attrs, content };
};

const linesToDoc = (lines: DialogueLineView[]): JSONContent => ({
  type: 'doc',
  content: lines.length === 0 ? [EMPTY_LINE] : lines.map(paragraphOf),
});

export { linesToDoc };

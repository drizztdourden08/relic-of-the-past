/* @layer renderer-components @kind logic */
/**
 * Lines to editor document. This is the forward half of the bridge.
 *
 * ONE LINE IS ONE PARAGRAPH. That is the whole change from the single-run editor
 * this replaces: the engine writes into a three-row box and never wraps, so what
 * an author is actually editing is a stack of lines, and a document shaped like
 * that can be guttered and grouped the way a code editor is.
 *
 * A line's advance code and its trailing wait become paragraph attributes, not
 * nodes in the run, so nothing about them is representable in the wrong
 * place: a row marker cannot end up mid-sentence, and a wait cannot end up
 * anywhere but a line's end.
 *
 * An empty set of lines still yields one empty paragraph, which is the canonical
 * empty document. The schema requires at least one block, and an author needs a
 * row to type into.
 */
import { attrsForLine } from './line-attrs';
import { inlineContent } from './token-attrs';
import type { JSONContent } from '@tiptap/core';
import type { DialogueLineView } from '@shared/game/language';

const kEmptyLine: JSONContent = { type: 'paragraph', attrs: attrsForLine(null, false) };

const paragraphOf = (line: DialogueLineView): JSONContent => {
  const attrs = attrsForLine(line.advance, line.endsBox);
  const content = inlineContent(line.tokens);
  return content.length === 0
    ? { type: 'paragraph', attrs }
    : { type: 'paragraph', attrs, content };
};

const linesToDoc = (lines: DialogueLineView[]): JSONContent => ({
  type: 'doc',
  content: lines.length === 0 ? [kEmptyLine] : lines.map(paragraphOf),
});

export { linesToDoc };

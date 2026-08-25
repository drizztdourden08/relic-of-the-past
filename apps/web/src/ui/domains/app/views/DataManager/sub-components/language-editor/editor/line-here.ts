/* @layer renderer-components @kind logic */
/**
 * Where the caret is, in LINES.
 *
 * Every line command needs the same three facts — which paragraph holds the
 * caret, where that paragraph starts, and which line number it is — and getting
 * any of them slightly wrong moves an edit onto the wrong row. One locator, used
 * by all of them.
 *
 * Depth 1 is the paragraph: the document holds only paragraphs and a paragraph
 * holds only inline content, so there is no deeper structure to walk.
 */
import { DIALOGUE_LINE_TYPE } from './line-attrs';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorState } from '@tiptap/pm/state';

/** The line the caret sits in. */
type LineHere = {
  node: ProseMirrorNode;
  /** Position immediately BEFORE the paragraph — what `setNodeMarkup` takes. */
  pos: number;
  /** 0-based index among the document's paragraphs. */
  index: number;
  /** Offset of the caret within the line's content. */
  offset: number;
};

const lineHere = (state: EditorState): LineHere | null => {
  const { $from } = state.selection;
  if ($from.depth < 1) return null;

  const node = $from.node(1);
  if (node.type.name !== DIALOGUE_LINE_TYPE) return null;

  return { node, pos: $from.before(1), index: $from.index(0), offset: $from.parentOffset };
};

export { lineHere };
export type { LineHere };

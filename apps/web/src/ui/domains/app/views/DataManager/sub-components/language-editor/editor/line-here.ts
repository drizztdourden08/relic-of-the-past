/* @layer renderer-components @kind logic */
import { DIALOGUE_LINE_TYPE } from './line-attrs';
import type { EditorState } from '@tiptap/pm/state';
import { PARAGRAPH_DEPTH } from './line-here.constants';
import type { LineHere } from './line-here.type';

const lineHere = (state: EditorState): LineHere | null => {
  const { $from } = state.selection;
  if ($from.depth < PARAGRAPH_DEPTH) return null;

  const node = $from.node(PARAGRAPH_DEPTH);
  if (node.type.name !== DIALOGUE_LINE_TYPE) return null;

  return { node, pos: $from.before(PARAGRAPH_DEPTH), index: $from.index(0), offset: $from.parentOffset };
};

export { lineHere };
export type { LineHere } from './line-here.type';

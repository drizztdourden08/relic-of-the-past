/* @layer renderer-components @kind logic */
import { DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from '../line-attrs';
import type { Command } from '@tiptap/pm/state';

const toggleWaitAt = (pos: number): Command => (state, dispatch) => {
  const node = state.doc.nodeAt(pos);
  if (node === null || node.type.name !== DIALOGUE_LINE_TYPE) return false;
  if (!dispatch) return true;

  dispatch(state.tr.setNodeMarkup(pos, undefined, {
    ...node.attrs,
    endsBox: !endsBoxOfAttrs(node.attrs),
  }));

  return true;
};

export { toggleWaitAt };

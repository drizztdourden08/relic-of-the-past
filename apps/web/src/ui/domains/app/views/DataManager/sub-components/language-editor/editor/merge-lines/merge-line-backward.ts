/* @layer renderer-components @kind logic */
import { DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from '../line-attrs';
import { lineHere } from '../line-here';
import type { Command } from '@tiptap/pm/state';

const mergeLineBackward: Command = (state, dispatch) => {
  if (!state.selection.empty) return false;

  const here = lineHere(state);
  if (here === null || here.index === 0 || here.offset !== 0) return false;

  const previous = state.doc.child(here.index - 1);
  if (previous.type.name !== DIALOGUE_LINE_TYPE) return false;
  if (!dispatch) return true;

  const endsBox = endsBoxOfAttrs(previous.attrs) || endsBoxOfAttrs(here.node.attrs);
  const tr = state.tr;
  tr.setNodeMarkup(here.pos - previous.nodeSize, undefined, { ...previous.attrs, endsBox });
  tr.join(here.pos);
  dispatch(tr.scrollIntoView());

  return true;
};

export { mergeLineBackward };

/* @layer renderer-components @kind logic */
import { DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from '../line-attrs';
import { lineHere } from '../line-here';
import type { Command } from '@tiptap/pm/state';

const mergeLineForward: Command = (state, dispatch) => {
  if (!state.selection.empty) return false;

  const here = lineHere(state);
  if (here === null || here.offset !== here.node.content.size) return false;

  const next = state.doc.maybeChild(here.index + 1);
  if (next === null || next === undefined || next.type.name !== DIALOGUE_LINE_TYPE) return false;
  if (!dispatch) return true;

  const endsBox = endsBoxOfAttrs(here.node.attrs) || endsBoxOfAttrs(next.attrs);
  const tr = state.tr;
  tr.setNodeMarkup(here.pos, undefined, { ...here.node.attrs, endsBox });
  tr.join(here.pos + here.node.nodeSize);
  dispatch(tr.scrollIntoView());

  return true;
};

export { mergeLineForward };

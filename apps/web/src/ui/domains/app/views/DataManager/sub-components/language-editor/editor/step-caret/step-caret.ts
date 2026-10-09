/* @layer renderer-components @kind logic */
import { TextSelection } from '@tiptap/pm/state';
import { splitsMergedPair } from '../merged-pair';
import type { Command, EditorState } from '@tiptap/pm/state';

const targetOf = (state: EditorState, dir: 1 | -1): number => {
  const { selection } = state;
  if (!selection.empty) return dir === 1 ? selection.to : selection.from;
  return selection.head + dir;
};

const clearOfPair = (state: EditorState, at: number, dir: 1 | -1): number => (
  splitsMergedPair(state.doc, at) ? at + dir : at
);

const stepCaret = (dir: 1 | -1): Command => (state, dispatch) => {
  const at = clearOfPair(state, targetOf(state, dir), dir);
  if (at < 0 || at > state.doc.content.size) return false;

  const next = TextSelection.near(state.doc.resolve(at), dir);
  if (next.eq(state.selection)) return false;

  if (dispatch) dispatch(state.tr.setSelection(next).scrollIntoView());
  return true;
};

export { stepCaret };

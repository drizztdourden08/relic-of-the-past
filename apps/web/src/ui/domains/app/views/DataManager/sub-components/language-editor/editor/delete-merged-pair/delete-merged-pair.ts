/* @layer renderer-components @kind logic */
import { NodeSelection } from '@tiptap/pm/state';
import { mergedPairAround, mergedPairAt, mergedPairEndingAt } from '../merged-pair';
import type { Command, EditorState } from '@tiptap/pm/state';
import type { MergedPairRange } from '../merged-pair';

const rangeFor = (state: EditorState, dir: 1 | -1): MergedPairRange | null => {
  const { doc, selection } = state;

  if (selection instanceof NodeSelection) return mergedPairAround(doc, selection.from);
  if (!selection.empty) return null;

  const at = selection.head;
  return dir === 1 ? mergedPairAt(doc, at) : mergedPairEndingAt(doc, at);
};

const deleteMergedPair = (dir: 1 | -1): Command => (state, dispatch) => {
  const range = rangeFor(state, dir);
  if (range === null) return false;
  if (!dispatch) return true;

  dispatch(state.tr.delete(range.from, range.to).scrollIntoView());
  return true;
};

export { deleteMergedPair };

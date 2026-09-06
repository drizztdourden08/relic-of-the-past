/* @layer renderer-components @kind logic */
/**
 * Backspace and Delete over a merged picture character: both halves go, or
 * neither does.
 *
 * The picture is one character to the author, so removing "the character before
 * the caret" has to mean the whole picture. Left to the ordinary delete, one
 * press took away half of it and left the other half standing. That half is a
 * picture the alphabet has an entry for, which encodes and bakes perfectly well
 * and draws as nonsense on screen.
 *
 * Three ways in, one range. The caret may be after the pair (Backspace), before
 * it (Delete), or the pair may be selected because a click landed on it. A click
 * always selects one half's node, since that is the object the browser hit, and
 * that selection is widened to the pair here, not at the click.
 *
 * Both commands decline when the gesture is not over a pair, so an ordinary
 * character, an ordinary atom and a line boundary all keep their own behaviour.
 */
import { NodeSelection } from '@tiptap/pm/state';
import { mergedPairAround, mergedPairAt, mergedPairEndingAt } from './merged-pair';
import type { Command, EditorState } from '@tiptap/pm/state';
import type { MergedPairRange } from './merged-pair';

/** Which way a delete reaches: after the caret, or before it. */
const kForward = 1;
const kBack = -1;

const rangeFor = (state: EditorState, dir: 1 | -1): MergedPairRange | null => {
  const { doc, selection } = state;

  if (selection instanceof NodeSelection) return mergedPairAround(doc, selection.from);
  if (!selection.empty) return null;

  const at = selection.head;
  return dir === kForward ? mergedPairAt(doc, at) : mergedPairEndingAt(doc, at);
};

const deleteMergedPair = (dir: 1 | -1): Command => (state, dispatch) => {
  const range = rangeFor(state, dir);
  if (range === null) return false;
  if (!dispatch) return true;

  dispatch(state.tr.delete(range.from, range.to).scrollIntoView());
  return true;
};

const deleteMergedPairForward = deleteMergedPair(kForward);
const deleteMergedPairBackward = deleteMergedPair(kBack);

export { deleteMergedPairBackward, deleteMergedPairForward };

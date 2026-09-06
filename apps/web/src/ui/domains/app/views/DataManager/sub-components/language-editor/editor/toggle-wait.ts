/* @layer renderer-components @kind logic */
/**
 * Whether a line ends its box. A per-line flag, flipped from the line's end.
 *
 * A wait-for-button is the one control code a player actually experiences: it is
 * the moment the box stops and asks for a press. It cannot occur anywhere but at
 * the end of a line, so it is not something to be inserted at a caret. It is a
 * property of the line, and turning it on or off is one gesture.
 *
 * Two ways in, the same transaction. `toggleWaitAt` is for the marker drawn at a
 * line's end, which knows the position it was drawn at; `toggleWaitHere` is the
 * keyboard route, acting on the line the caret is in.
 */
import { DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from './line-attrs';
import { lineHere } from './line-here';
import type { Command } from '@tiptap/pm/state';

/** Flip the wait on the line whose paragraph starts at `pos`. */
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

/** Flip the wait on the line holding the caret. */
const toggleWaitHere: Command = (state, dispatch) => {
  const here = lineHere(state);
  return here === null ? false : toggleWaitAt(here.pos)(state, dispatch);
};

export { toggleWaitAt, toggleWaitHere };

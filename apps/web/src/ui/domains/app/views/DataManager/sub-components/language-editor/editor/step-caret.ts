/* @layer renderer-components @kind logic */
/**
 * Left and right by ONE CHARACTER OF THE LINE, whatever that character happens
 * to be made of.
 *
 * The browser moves a caret between DOM positions, and a line here has more of
 * those than it has characters. Every character sits in a cell of its own so it
 * can be billed its real advance, and each boundary between two cells is two
 * equivalent DOM positions — the end of one span and the start of the next — so
 * native motion stopped twice per character and the caret visibly jittered
 * backwards between presses. An inserted token is the same problem from the other
 * side: it is one character to the author, and the caret has no business landing
 * anywhere inside it.
 *
 * Stepping by DOCUMENT position instead of by DOM position settles both. One
 * press is one position: one typed character, or the whole of one atom, or the
 * jump from the end of a line to the start of the next. Nothing else about
 * selection changes — Shift with an arrow, word jumps, the vertical arrows and
 * clicking are all left to the editor, which is why only the two bare keys are
 * taken.
 *
 * A merged picture character is the one place where one press crosses TWO
 * positions. The alphabet spells it as a pair of entries and the document keeps
 * both, but it is one character on screen and the position between its halves is
 * one the browser cannot even draw a caret at — so the step passes over it and
 * lands on the far side of the picture.
 */
import { TextSelection } from '@tiptap/pm/state';
import { splitsMergedPair } from './merged-pair';
import type { Command, EditorState } from '@tiptap/pm/state';

/** Which way a step goes, as the bias `TextSelection.near` wants. */
const kForward = 1;
const kBack = -1;

/**
 * A non-empty selection collapses to its own edge rather than stepping past it —
 * an atom that was clicked is selected whole, and the first arrow after that
 * should put the caret beside it, not on the far side of its neighbour.
 */
const targetOf = (state: EditorState, dir: 1 | -1): number => {
  const { selection } = state;
  if (!selection.empty) return dir === kForward ? selection.to : selection.from;
  return selection.head + dir;
};

/** One more position, when the step would have stopped inside a picture. */
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

const stepCaretRight = stepCaret(kForward);
const stepCaretLeft = stepCaret(kBack);

export { stepCaretLeft, stepCaretRight };

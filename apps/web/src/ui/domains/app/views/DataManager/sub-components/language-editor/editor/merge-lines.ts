/* @layer renderer-components @kind logic */
/**
 * Backspace at the start of a line, and Delete at the end of one — the inverse
 * of Enter.
 *
 * A merge DROPS a code rather than moving one. The line that disappears is the
 * one whose advance put the pen where it was, and once its text has joined the
 * line above there is nothing left for that code to do; the surviving line keeps
 * its own. This is the only way an authored advance is ever removed, and it
 * removes exactly the one the author just deleted.
 *
 * The wait is the opposite: it belongs to whichever line now ENDS the run of
 * text, so it survives from either side. If the line being merged away closed
 * the box, the combined line closes it instead — otherwise deleting a line break
 * would quietly join two boxes into one and change what the player has to press.
 *
 * Both commands decline when they do not apply, so the ordinary keys keep their
 * ordinary behaviour everywhere except a line boundary.
 */
import { DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from './line-attrs';
import { lineHere } from './line-here';
import type { Command } from '@tiptap/pm/state';

/** Backspace with the caret at a line's start: fold this line into the one above. */
const mergeLineBackward: Command = (state, dispatch) => {
  if (!state.selection.empty) return false;

  const here = lineHere(state);
  if (here === null || here.index === 0 || here.offset !== 0) return false;

  const previous = state.doc.child(here.index - 1);
  if (previous.type.name !== DIALOGUE_LINE_TYPE) return false;
  if (!dispatch) return true;

  const endsBox = endsBoxOfAttrs(previous.attrs) || endsBoxOfAttrs(here.node.attrs);
  const tr = state.tr;
  // Markup first: it changes no positions, so the join boundary stays valid.
  tr.setNodeMarkup(here.pos - previous.nodeSize, undefined, { ...previous.attrs, endsBox });
  tr.join(here.pos);
  dispatch(tr.scrollIntoView());

  return true;
};

/** Delete with the caret at a line's end: pull the line below into this one. */
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

export { mergeLineBackward, mergeLineForward };

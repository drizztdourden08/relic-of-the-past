/* @layer renderer-components @kind logic */
/**
 * Enter starts a new line.
 *
 * This is the ONE gesture in the whole editor that invents a control code, and
 * it asks the model for it (`advanceForNewLine`) instead of deciding: the box
 * fills from the top, so the line after row one is row two, after row two is row
 * three, and once the bottom row is taken the box has to scroll to make room. A
 * line opened after a box-ending wait starts the next box at row one again.
 *
 * The wait travels with the TEXT, not with the row. Splitting a line that ended
 * its box leaves the first half open and the second half closing the box, which
 * is what an author means by pressing Enter in the middle of a sentence: the
 * words that moved down still finish the box.
 *
 * The advance is computed against the first half as it will be AFTER the split,
 * when it no longer ends its box, so a line that used to close the box hands the
 * new line the next row down instead of restarting at row one.
 */
import { ROWS_PER_BOX } from '@shared/game/language';
import { editorRuntime } from './editor-runtime';
import { advanceAfterLine } from './line-shape';
import { attrsForLine, DIALOGUE_LINE_TYPE, advanceOfAttrs, endsBoxOfAttrs } from './line-attrs';
import { lineHere } from './line-here';
import type { Command } from '@tiptap/pm/state';

/** Lines in the caret's box so far, counted back to the previous wait. */
const rowsInBoxBefore = (state: Parameters<Command>[0], caretPos: number): number => {
  let rows = 0;
  state.doc.forEach((node, offset) => {
    if (offset > caretPos) return;
    rows = node.attrs.endsBox === true && offset + node.nodeSize <= caretPos ? 0 : rows + 1;
  });
  return rows;
};

const splitLine: Command = (state, dispatch) => {
  const here = lineHere(state);
  if (here === null) return false;

  // The automation mode is a promise about what Enter may restructure. Off
  // consumes the key and changes nothing; in-block refuses once the caret's
  // box already holds its three rows.
  if (editorRuntime.mode === 'off') return true;
  if (editorRuntime.mode === 'block' && rowsInBoxBefore(state, here.pos) >= ROWS_PER_BOX) return true;

  const type = state.schema.nodes[DIALOGUE_LINE_TYPE];
  if (type === undefined) return false;

  const wasEnding = endsBoxOfAttrs(here.node.attrs);
  const advance = advanceAfterLine({
    advance: advanceOfAttrs(here.node.attrs),
    tokens: [],
    endsBox: false,
  });

  if (!dispatch) return true;

  const tr = state.tr;
  tr.deleteSelection();
  // The paragraph's own start is before everything the split touches, so its
  // position still points at the first half once the second half exists.
  tr.split(tr.selection.from, 1, [{ type, attrs: attrsForLine(advance, wasEnding) }]);
  if (wasEnding) {
    tr.setNodeMarkup(here.pos, undefined, { ...here.node.attrs, endsBox: false });
  }
  dispatch(tr.scrollIntoView());

  return true;
};

export { splitLine };

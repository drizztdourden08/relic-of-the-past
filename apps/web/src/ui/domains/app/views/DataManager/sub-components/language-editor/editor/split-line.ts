/* @layer renderer-components @kind logic */
import { ROWS_PER_BOX } from '@shared/game/language';
import { editorRuntime } from './editor-runtime';
import { advanceAfterLine } from './line-shape';
import { attrsForLine, DIALOGUE_LINE_TYPE, advanceOfAttrs, endsBoxOfAttrs } from './line-attrs';
import { lineHere } from './line-here';
import type { Command } from '@tiptap/pm/state';

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
  tr.split(tr.selection.from, 1, [{ type, attrs: attrsForLine(advance, wasEnding) }]);
  if (wasEnding) {
    tr.setNodeMarkup(here.pos, undefined, { ...here.node.attrs, endsBox: false });
  }
  dispatch(tr.scrollIntoView());

  return true;
};

export { splitLine };

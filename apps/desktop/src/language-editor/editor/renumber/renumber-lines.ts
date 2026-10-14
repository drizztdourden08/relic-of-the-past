/* @layer renderer-components @kind logic */
import { ROWS_PER_BOX } from '@rotp/languages';
import type { LineAdvance } from '@rotp/languages';
import type { Transaction } from '@tiptap/pm/state';
import { editorRuntime } from '../editor-runtime';
import { rowOfAdvance } from '../line-shape';
import { advanceOfAttrs, attrsForLine, endsBoxOfAttrs } from '../line-attrs';
import type { DialogueLine } from './renumber.type';

const nextAdvance = (previousRow: number): LineAdvance => (
  previousRow < ROWS_PER_BOX
    ? { kind: 'row', row: (previousRow + 1) as 1 | 2 | 3 }
    : { kind: 'scroll' }
);

const advanceDiffers = (expected: LineAdvance | null, current: LineAdvance | null): boolean =>
  (expected?.kind ?? null) !== (current?.kind ?? null)
  || (expected?.kind === 'row' && current?.kind === 'row' && expected.row !== current.row);

const renumberLines = (tr: Transaction, lines: DialogueLine[], changedAt: number): boolean => {
  let touched = false;
  let previousRow = 0;

  for (const [i, { node, pos }] of lines.entries()) {
    if (i <= changedAt) {
      previousRow = rowOfAdvance(advanceOfAttrs(node.attrs));
      continue;
    }
    const expected = nextAdvance(previousRow);
    if (advanceDiffers(expected, advanceOfAttrs(node.attrs))) {
      tr.setNodeMarkup(pos, undefined, {
        ...attrsForLine(expected, endsBoxOfAttrs(node.attrs)),
      });
      touched = true;
    }
    previousRow = rowOfAdvance(expected);
    if (editorRuntime.mode === 'block' && endsBoxOfAttrs(node.attrs)) break;
  }
  return touched;
};

export { renumberLines };

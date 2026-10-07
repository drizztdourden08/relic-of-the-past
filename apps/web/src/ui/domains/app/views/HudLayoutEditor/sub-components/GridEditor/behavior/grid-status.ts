/* @layer renderer-components @kind logic */
/**
 * The one line that says what is selected, in words, plus the two words the
 * toolbar wears as its leading chip.
 *
 * THE CHIP IS HOW THE TOOLBAR SAYS WHAT IT IS ACTING ON (§54). The maintainer:
 * "be clear what section or purpose they're for." A strip of five icon buttons
 * that appears when you press something is only legible if it names the thing:
 * `COLUMN 2`, `ROW 1`, `3 CELLS`. It comes out of the SAME selection the status
 * line reads, in this file, so the chip and the sentence can never disagree
 * about what is picked.
 *
 * IT NAMES WHAT A TRACK HOLDS, AND THAT IS ALL IT DOES WITH A CHILD. §48 used
 * the same sentence as the preface to a refusal ("move it first"); §50 removed
 * the refusal because children follow a track edit automatically, so naming them
 * is now a courtesy instead of a demand: it is how a person sees what the next
 * press is about to move.
 *
 * ON A 3x3 IT ALSO NAMES THE ANCHOR. §42 deleted the nine-anchor dropdown by
 * making the screen an ordinary grid, which is right and left anyone who had
 * learned "bottom-left" with nothing to search for.
 */
import { boundsOf, originsIn } from '../../GridLattice';
import { sizeOf } from './grid-actions';
import type { Occupant } from '../../GridLattice';
import type { GridSelection } from '../GridEditor.type';

const ANCHORS: readonly string[] = [
  'top-left', 'top-center', 'top-right',
  'mid-left', 'center', 'mid-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const anchorName = (columns: number, rows: number, column: number, row: number): string =>
  (columns === 3 && rows === 3 ? ` (${ANCHORS[(row - 1) * 3 + (column - 1)]})` : '');

const holds = (ids: readonly string[]): string => (ids.length > 0 ? ` holds ${ids.join(', ')}` : ' is empty');

interface StatusParams {
  selection: GridSelection;
  occupants: readonly Occupant[];
  columns: number;
  rows: number;
}

const statusOf = (params: StatusParams): string => {
  const { selection, occupants, columns, rows } = params;
  if (selection.kind === 'none') return `${columns} × ${rows} grid, nothing selected`;

  if (selection.kind === 'track') {
    const axis = selection.axis === 'columns' ? 'column' : 'row';
    const total = selection.axis === 'columns' ? columns : rows;
    const held = originsIn(occupants, selection.axis === 'columns'
      ? { c0: Math.min(...selection.indices) + 1, c1: Math.max(...selection.indices) + 1, r0: 1, r1: rows }
      : { c0: 1, c1: columns, r0: Math.min(...selection.indices) + 1, r1: Math.max(...selection.indices) + 1 });
    const name = selection.indices.length === 1
      ? `${axis} ${selection.indices[0] + 1} of ${total}`
      : `${selection.indices.length} ${selection.axis}`;
    return `${name}${holds(held.map((o) => o.id))}`;
  }

  const bounds = boundsOf(selection.cells);
  const held = originsIn(occupants, bounds).map((o) => o.id);
  if (selection.cells.length === 1) {
    return `column ${bounds.c0}, row ${bounds.r0}${
      anchorName(columns, rows, bounds.c0, bounds.r0)}${holds(held)}`;
  }
  return `${selection.cells.length} cells, ${sizeOf(bounds)}${holds(held)}`;
};

/** Two or three words, upper-cased by the sheet, not by the string, so a
 *  screen reader hears "column 2" and not "C O L U M N". `null` is the
 *  nothing-selected case and the toolbar prints its own hint for it. */
const chipOf = (selection: GridSelection): string | null => {
  if (selection.kind === 'none') return null;
  if (selection.kind === 'track') {
    return selection.indices.length === 1
      ? `${selection.axis === 'columns' ? 'column' : 'row'} ${selection.indices[0] + 1}`
      : `${selection.indices.length} ${selection.axis}`;
  }
  const bounds = boundsOf(selection.cells);
  return selection.cells.length === 1
    ? `cell ${bounds.c0},${bounds.r0}`
    : `${selection.cells.length} cells`;
};

export { anchorName, chipOf, statusOf };
export type { StatusParams };

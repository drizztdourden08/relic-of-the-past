/* @layer renderer-components @kind constants */
import type { LegendEntry } from '@app/hud-layout-editing/selection-bands.type';
import type { CellRef } from '../GridLattice';

const CELL_PICK_KEYS: readonly LegendEntry[] = [
  { key: 'set', label: 'set the cell', shortcut: { mouse: 'left' } },
  { key: 'span', label: 'span to here', shortcut: { keys: ['shift'], mouse: 'left' } },
  { key: 'rectangle', label: 'span a rectangle', shortcut: { mouse: 'drag' } },
];

const CELL_STEP: Readonly<Record<string, CellRef | undefined>> = {
  ArrowLeft: { column: -1, row: 0 },
  ArrowRight: { column: 1, row: 0 },
  ArrowUp: { column: 0, row: -1 },
  ArrowDown: { column: 0, row: 1 },
};

export { CELL_PICK_KEYS, CELL_STEP };

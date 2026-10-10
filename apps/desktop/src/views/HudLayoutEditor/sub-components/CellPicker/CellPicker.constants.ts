/* @layer renderer-components @kind constants */
import type { LegendEntry } from '@app/hud-layout-editing/selection-bands.type';

const CELL_PICK_KEYS: readonly LegendEntry[] = [
  { key: 'set', label: 'set the cell', shortcut: { mouse: 'left' } },
  { key: 'span', label: 'span to here', shortcut: { keys: ['shift'], mouse: 'left' } },
  { key: 'rectangle', label: 'span a rectangle', shortcut: { mouse: 'drag' } },
];

export { CELL_PICK_KEYS };

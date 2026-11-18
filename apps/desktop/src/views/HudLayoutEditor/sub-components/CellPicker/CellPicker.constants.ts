/* @layer renderer-components @kind constants */
import type { Translate } from '@app/hud-layout-editing/translate.type';
import type { LegendEntry } from '@app/hud-layout-editing/selection-bands.type';
import type { CellRef } from '../GridLattice';

const cellPickKeys = (t: Translate): readonly LegendEntry[] => [
  { key: 'set', label: t('hud-editor:cell-picker.set'), shortcut: { mouse: 'left' } },
  { key: 'span', label: t('hud-editor:cell-picker.span'), shortcut: { keys: ['shift'], mouse: 'left' } },
  { key: 'rectangle', label: t('hud-editor:cell-picker.rectangle'), shortcut: { mouse: 'drag' } },
];

const CELL_STEP: Readonly<Record<string, CellRef | undefined>> = {
  ArrowLeft: { column: -1, row: 0 },
  ArrowRight: { column: 1, row: 0 },
  ArrowUp: { column: 0, row: -1 },
  ArrowDown: { column: 0, row: 1 },
};

export { CELL_STEP, cellPickKeys };

/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';
import { boundsOf } from '../../GridLattice';
import type { GridSelection } from '../GridEditor.type';

const chipOf = (selection: GridSelection, t: Translate): string | null => {
  if (selection.kind === 'none') return null;
  if (selection.kind === 'track') {
    const [only] = selection.indices;
    const columns = selection.axis === 'columns';
    if (selection.indices.length === 1 && only !== undefined) {
      return columns
        ? t('hud-editor:grid.chip.column', { n: only + 1 })
        : t('hud-editor:grid.chip.row', { n: only + 1 });
    }
    return columns
      ? t('hud-editor:grid.chip.columns', { count: selection.indices.length })
      : t('hud-editor:grid.chip.rows', { count: selection.indices.length });
  }
  const bounds = boundsOf(selection.cells);
  return selection.cells.length === 1
    ? t('hud-editor:grid.chip.cell', { column: bounds.c0, row: bounds.r0 })
    : t('hud-editor:grid.chip.cells', { count: selection.cells.length });
};

export { chipOf };

/* @layer tests @kind constants */
import type { HudContainer } from '@rotp/hud';

const GRID_PARENT: HudContainer = {
  id: 'screen',
  kind: 'container',
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  children: [{ id: 'n', kind: 'element', element: { type: 'spacer' }, place: { column: 1, row: 3 } }],
};

export { GRID_PARENT };

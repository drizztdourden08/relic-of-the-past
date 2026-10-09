/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '../../../shared/platform';
import type { HudContainer } from '../../../shared/types/hud';

const EDITOR = resolve(__dirname, '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor');

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const FLEX_PARENT = {
  id: 'row', kind: 'container', direction: 'row', children: [],
} as unknown as HudContainer;

const GRID_PARENT = {
  id: 'screen',
  kind: 'container',
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  children: [{ id: 'n', kind: 'element', element: { type: 'spacer' }, place: { column: 1, row: 3 } }],
} as unknown as HudContainer;

export { EDITOR, FLEX_PARENT, GRID_PARENT, PLATFORM };

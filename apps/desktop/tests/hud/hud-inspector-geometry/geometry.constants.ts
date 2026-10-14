/* @layer tests @kind constants */
import { resolve } from 'path';
import type { HudContainer } from '@rotp/hud';
import { REPO_ROOT } from '../../repo-root';

const EDITOR = resolve(REPO_ROOT, 'apps/desktop/src/views/HudLayoutEditor');

const FLEX_PARENT: HudContainer = {
  id: 'row', kind: 'container', direction: 'row', children: [],
};

const GRID_PARENT: HudContainer = {
  id: 'screen',
  kind: 'container',
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  children: [{ id: 'n', kind: 'element', element: { type: 'spacer' }, place: { column: 1, row: 3 } }],
};

export { EDITOR, FLEX_PARENT, GRID_PARENT };

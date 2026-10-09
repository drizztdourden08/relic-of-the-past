/* @layer tests @kind constants */
import { resolve } from 'path';
import type { GridSelection } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';

const ROOT_DIR = resolve(__dirname, '../../..');
const DESIGN_SYSTEM_DIR = `${ROOT_DIR}/apps/web/src/ui/design-system`;
const EDITOR_DIR = `${ROOT_DIR}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;
const GRID_EDITOR_SRC = `${EDITOR_DIR}/GridEditor/GridEditor.tsx`;
const LAYOUT_SECTION_SRC = `${EDITOR_DIR}/sections/LayoutSection.tsx`;

const SELECTIONS: Readonly<Record<string, GridSelection>> = {
  none: { kind: 'none' },
  cell: { kind: 'cells', cells: [{ column: 2, row: 2 }], anchor: { column: 2, row: 2 } },
  column: { kind: 'track', axis: 'columns', indices: [1], anchor: 1 },
  row: { kind: 'track', axis: 'rows', indices: [1], anchor: 1 },
};

const RAILS = [220, 232, 320];

const ONE_ROW = 26 + 2 * 2;

export {
  DESIGN_SYSTEM_DIR, EDITOR_DIR, GRID_EDITOR_SRC, LAYOUT_SECTION_SRC, ONE_ROW, RAILS, SELECTIONS,
};

/* @layer tests @kind constants */
import type { GridSelection } from '@app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';
import { REPO_ROOT } from '../../repo-root';

const ROOT_DIR = REPO_ROOT;
const DESIGN_SYSTEM_DIR = `${ROOT_DIR}/node_modules/@drizztdourden08/tessera/src`;
const ROTP_THEME = `${ROOT_DIR}/apps/desktop/src/theme.css`;
const EDITOR_DIR = `${ROOT_DIR}/apps/desktop/src/views/HudLayoutEditor/sub-components`;
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
  DESIGN_SYSTEM_DIR, EDITOR_DIR, GRID_EDITOR_SRC, LAYOUT_SECTION_SRC, ONE_ROW, RAILS, ROTP_THEME, SELECTIONS,
};

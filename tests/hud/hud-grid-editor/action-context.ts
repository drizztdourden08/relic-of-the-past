/* @layer tests @kind helper */
import { occupantsOf } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridLattice';
import type { HudGridContainer } from '@rotp/hud';
import type {
  GridActionContext, GridSelection,
} from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';

const ignore = (): void => {};

const actionContext = (selection: GridSelection, container: HudGridContainer): GridActionContext => ({
  container,
  selection,
  cursor: { column: 1, row: 1 },
  occupants: occupantsOf(container),
  rows: 3,
  edits: { patchContainer: ignore, setSelection: ignore, refuse: ignore },
});

export { actionContext };

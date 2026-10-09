/* @layer tests @kind helper */
import { occupantsOf } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridLattice';
import type { HudGridContainer } from '../../../shared/types/hud';
import type {
  GridActionContext, GridSelection,
} from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';

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

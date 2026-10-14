/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { GridSolveContext } from '@app/hud-layout-editing/grid-solve';
import { CellPicker } from '@app/views/HudLayoutEditor/sub-components/CellPicker';
import { GridEditor } from '@app/views/HudLayoutEditor/sub-components/GridEditor';
import { StageGridEcho } from '@app/views/HudLayoutEditor/sub-components/StageGridEcho';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { HudGridContainer, PlacedNode } from '@rotp/hud';
import { ECHO_SAMPLE } from './echo-sample.constants';
import { ECHO_BOX, ECHO_GRID, ECHO_SCALE, STATES, THREE, TWELVE } from './metrics.constants';
import { solveOf } from './solve-of';
import { WINDOWS_PLATFORM } from '../windows-platform';

const noop = (): void => {};

const withSolve = (container: HudGridContainer, node: unknown): unknown =>
  h(GridSolveContext.Provider, { value: () => solveOf(container) }, h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, node as never));

const placed: PlacedNode[] = [{
  id: 'echo-grid', node: ECHO_GRID, rect: ECHO_BOX, scale: 1, opacity: 1, dimmed: false,
}];

const editor = (container: HudGridContainer): unknown =>
  withSolve(container, h(GridEditor, { container, onPatchContainer: noop }));

const metricsCases: Record<string, () => unknown> = {
  three: () => editor(THREE),
  twelve: () => editor(TWELVE),
  states: () => withSolve(STATES, h(CellPicker, {
    container: STATES, childId: 'band', place: { column: 1, row: 1, colSpan: 2 }, onChange: noop,
  })),
  echo: () => h('div', { className: 'echo-stage' },
    h(StageGridEcho, { placed, scale: ECHO_SCALE, sample: ECHO_SAMPLE })),
};

export { metricsCases };

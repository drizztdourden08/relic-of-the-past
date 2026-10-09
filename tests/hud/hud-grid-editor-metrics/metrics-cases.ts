/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { GridSolveContext } from '@app/views/HudLayoutEditor/behavior/grid-solve';
import { CellPicker } from '@app/views/HudLayoutEditor/sub-components/CellPicker';
import { GridEditor } from '@app/views/HudLayoutEditor/sub-components/GridEditor';
import { StageGridEcho } from '@app/views/HudLayoutEditor/sub-components/StageGridEcho';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { HudGridContainer } from '@rotp/hud';
import type { PlacedNode } from '@rotp/hud';
import type { EditorSampleState } from '@app/views/HudLayoutEditor/behavior/useSampleState.type';
import { CTX, ECHO_BOX, ECHO_GRID, ECHO_SCALE, PLATFORM, STATES, THREE, TWELVE } from './metrics.constants';
import { solveOf } from './solve-of';

const noop = (): void => {};

const withSolve = (container: HudGridContainer, node: unknown): unknown =>
  h(GridSolveContext.Provider, { value: () => solveOf(container) }, h(PlatformContext.Provider, { value: PLATFORM }, node as never));

const placed: PlacedNode[] = [{
  id: 'echo-grid', node: ECHO_GRID, rect: ECHO_BOX, scale: 1, opacity: 1, dimmed: false,
}];
const sample = { hearts: CTX.hearts, filledSlots: [], dataScope: {} } as unknown as EditorSampleState;

const editor = (container: HudGridContainer): unknown =>
  withSolve(container, h(GridEditor, { container, scope: {}, onPatchContainer: noop }));

const metricsCases: Record<string, () => unknown> = {
  three: () => editor(THREE),
  twelve: () => editor(TWELVE),
  states: () => withSolve(STATES, h(CellPicker, {
    container: STATES, childId: 'band', place: { column: 1, row: 1, colSpan: 2 }, onChange: noop,
  })),
  echo: () => h('div', { className: 'echo-stage' },
    h(StageGridEcho, { placed, scale: ECHO_SCALE, sample })),
};

export { metricsCases };

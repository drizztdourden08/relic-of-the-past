/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { GridLattice, occupantsOf, rowCountFor } from '@app/views/HudLayoutEditor/sub-components/GridLattice';
import { contextualActions } from '@app/views/HudLayoutEditor/sub-components/GridEditor/behavior/contextual-actions';
import { gestureActions } from '@app/views/HudLayoutEditor/sub-components/GridEditor/behavior/gesture-actions';
import { cellStateOf } from '@app/views/HudLayoutEditor/sub-components/GridEditor/behavior/cell-state-of';
import { chipOf } from '@app/views/HudLayoutEditor/sub-components/GridEditor/behavior/chip-of';
import { statusOf } from '@app/views/HudLayoutEditor/sub-components/GridEditor/behavior/status-of';
import { trackExtentOf } from '@app/views/HudLayoutEditor/sub-components/GridEditor/behavior/track-extent-of';
import { SelectionLegend } from '@app/views/HudLayoutEditor/sub-components/SelectionLegend';
import { SelectionToolbar } from '@app/views/HudLayoutEditor/sub-components/SelectionToolbar';
import { LayoutSection } from '@app/views/HudLayoutEditor/sub-components/LayoutSection';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { ReactNode } from 'react';
import type { HudContainer, HudGridContainer, HudNode, HudPlace } from '@rotp/hud';
import type { GridActionContext, GridSelection } from '@app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';
import { SELECTIONS } from './layout-bands.constants';
import { WINDOWS_PLATFORM } from '../windows-platform';
import { FIXTURE_COLOURS } from '../fixture-colours.constants';

const noop = (): void => {};
const leaf = (id: string, place: HudPlace): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, place });

const screenRoot = (): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  guide: { show: true, color: FIXTURE_COLOURS.guideMagenta },
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

const flexContainer: HudContainer = { kind: 'container', id: 'f', direction: 'row', children: [] };

const ctxFor = (selection: GridSelection): GridActionContext => {
  const container = screenRoot();
  return {
    container,
    selection,
    cursor: { column: 1, row: 1 },
    occupants: occupantsOf(container),
    rows: rowCountFor(container, occupantsOf(container)),
    edits: { patchContainer: noop, setSelection: noop, refuse: noop },
  };
};

const block = (selection: GridSelection): ReactNode => {
  const ctx = ctxFor(selection);
  const occupants = ctx.occupants;
  const on = (axis: 'columns' | 'rows', index: number): boolean =>
    selection.kind === 'track' && selection.axis === axis && selection.indices.includes(index);
  return h('div', { className: 'hud-grid' },
    h(SelectionToolbar, { chip: chipOf(selection), actions: contextualActions(ctx) }),
    h(GridLattice, {
      columns: ctx.container.columns, rows: ctx.container.rows, rowCount: ctx.rows,
      colSizes: [], rowSizes: [], occupants,
      cellState: (cell) => cellStateOf(selection, occupants, cell),
      trackOn: on,
      extentOf: (axis, index) => trackExtentOf(ctx.container, axis, index),
      cursor: { column: 1, row: 1 },
      label: 'grid', onCellDown: noop, onCellEnter: noop, onPointerUp: noop, onKeyDown: noop,
      onTrackDown: noop, onAddTrack: noop, onSizeTrack: noop,
    }),
    h(SelectionLegend, {
      actions: [...contextualActions(ctx), ...gestureActions(ctx)],
      os: 'windows',
      status: statusOf({
        selection, occupants, columns: ctx.container.columns.length, rows: ctx.rows,
      }),
      refusal: null,
    }),
  );
};

const layoutCases: Record<string, () => ReactNode> = {
  sectionGrid: () => h(PlatformContext.Provider, { value: WINDOWS_PLATFORM },
    h(LayoutSection, { node: screenRoot(), onPatch: noop, scope: {} })),
  sectionFlex: () => h(PlatformContext.Provider, { value: WINDOWS_PLATFORM },
    h(LayoutSection, { node: flexContainer, onPatch: noop, scope: {} })),
  ...Object.fromEntries(Object.entries(SELECTIONS).map(([name, sel]) =>
    [`state-${name}`, () => block(sel)])),
};

export { layoutCases };

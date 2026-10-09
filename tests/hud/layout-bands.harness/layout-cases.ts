/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { GridLattice, occupantsOf, rowCountFor } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridLattice';
import { contextualActions, gestureActions } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions';
import { cellStateOf } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-cell-state';
import { chipOf, statusOf } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-status';
import { trackExtentOf } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-track-actions';
import { SelectionLegend } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/SelectionBands/SelectionLegend';
import { SelectionToolbar } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/SelectionBands/SelectionToolbar';
import { LayoutSection } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { ReactNode } from 'react';
import type { Platform } from '@drizztdourden08/brock-core';
import type { HudContainer, HudGridContainer, HudNode } from '@rotp/hud';
import type { GridActionContext, GridSelection } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';
import { SELECTIONS } from './layout-bands.constants';

const noop = (): void => {};
const platform = { info: { os: 'windows' } } as unknown as Platform;

const leaf = (id: string, place: Record<string, number>): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, place }) as unknown as HudNode;

const screenRoot = (): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  guide: { show: true, color: '#c064c0' },
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

const flexContainer = { kind: 'container', id: 'f', direction: 'row', children: [] } as unknown as HudContainer;

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
  sectionGrid: () => h(PlatformContext.Provider, { value: platform },
    h(LayoutSection, { node: screenRoot() as unknown as HudContainer, onPatch: noop, scope: {} })),
  sectionFlex: () => h(PlatformContext.Provider, { value: platform },
    h(LayoutSection, { node: flexContainer, onPatch: noop, scope: {} })),
  ...Object.fromEntries(Object.entries(SELECTIONS).map(([name, sel]) =>
    [`state-${name}`, () => block(sel)])),
};

export { layoutCases };

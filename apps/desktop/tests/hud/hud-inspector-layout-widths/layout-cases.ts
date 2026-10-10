/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { AlignmentTiles } from '@app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import { FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS } from '@app/hud-layout-editing/align-options';
import { ColorField } from '@app/views/HudLayoutEditor/sub-components/ColorField';
import { DirectionControl } from '@app/views/HudLayoutEditor/sub-components/DirectionControl';
import { ExtentField } from '@app/views/HudLayoutEditor/sub-components/ExtentField';
import { IconButton } from '@drizztdourden08/tessera/primitives';
import { GridEditor } from '@app/views/HudLayoutEditor/sub-components/GridEditor';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { Platform } from '@drizztdourden08/brock-core';
import type { AlignRowSpec } from '@app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import type { HudGridContainer } from '@rotp/hud';

const noop = (): void => {};
const guide = '#c064c0';
const platform = { info: { os: 'windows' } } as unknown as Platform;

const grid: HudGridContainer = {
  kind: 'container', id: 'g', layout: 'grid',
  columns: ['auto', 'fill', { px: 16 }], rows: ['auto', 'auto'],
  guide: { show: true, color: guide }, children: [],
};

const gridRows: AlignRowSpec[] = [
  { key: 'justifyItems', cap: '↔', label: 'items across the cell', engine: 'grid', axis: 'main', options: GRID_ITEMS, value: 'stretch', onChange: noop },
  { key: 'alignItems', cap: '↕', label: 'items down the cell', engine: 'grid', axis: 'cross', options: GRID_ITEMS, value: 'stretch', onChange: noop },
];
const flexRows: AlignRowSpec[] = [
  { key: 'justify', cap: 'main', label: 'along the main axis', engine: 'flex', axis: 'main', options: FLEX_JUSTIFY, value: 'start', onChange: noop },
  { key: 'align', cap: 'cross', label: 'across the cross axis', engine: 'flex', axis: 'cross', options: FLEX_ALIGN, value: 'start', onChange: noop },
];

const layoutCases: Record<string, () => unknown> = {
  alignGrid: () => h(AlignmentTiles, { direction: 'row', rows: gridRows }),
  alignFlexRow: () => h(AlignmentTiles, { direction: 'row', rows: flexRows }),
  alignFlexColumn: () => h(AlignmentTiles, { direction: 'column', rows: flexRows }),
  direction: () => h(DirectionControl, { value: 'row', onChange: noop }),
  tracks: () => h(PlatformContext.Provider, { value: platform }, h(GridEditor, {
    container: grid, scope: {}, onPatchContainer: noop,
  })),
  trackEditor: () => h('div', { className: 'hud-grid__control' },
    h(ExtentField, { label: 'column 2', value: { px: 16 }, onChange: noop }),
    h('div', { className: 'hud-grid__bar' }, ...['◀', '▶', '+', '✕'].map((glyph, i) => h(
      IconButton, { key: i, variant: 'ghost', size: 'sm', label: glyph, onClick: noop }, glyph,
    )))),
  colour: () => h(ColorField, {
    label: 'guide', value: guide, onChange: noop, hint: 'Editor only. Never drawn in game.',
  }),
};

export { layoutCases };

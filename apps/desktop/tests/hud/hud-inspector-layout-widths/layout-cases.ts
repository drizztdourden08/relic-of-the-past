/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { AlignmentTiles } from '@app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import { FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS } from '@app/hud-layout-editing/align-options';
import { ColorField } from '@app/views/HudLayoutEditor/sub-components/ColorField';
import { DirectionControl } from '@app/views/HudLayoutEditor/sub-components/DirectionControl';
import { ExtentField } from '@app/views/HudLayoutEditor/sub-components/ExtentField';
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { IconName } from '@drizztdourden08/tessera/primitives';
import { GridEditor } from '@app/views/HudLayoutEditor/sub-components/GridEditor';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { AlignRowSpec } from '@app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import type { HudGridContainer } from '@rotp/hud';
import { WINDOWS_PLATFORM } from '../windows-platform';

const noop = (): void => {};
const guide = '#c064c0';
const grid: HudGridContainer = {
  kind: 'container', id: 'g', layout: 'grid',
  columns: ['auto', 'fill', { px: 16 }], rows: ['auto', 'auto'],
  guide: { show: true, color: guide }, children: [],
};

const TOOLS: { name: IconName; label: string }[] = [
  { name: 'arrow-left', label: 'move earlier' },
  { name: 'arrow-right', label: 'move later' },
  { name: 'plus', label: 'insert' },
  { name: 'x', label: 'remove' },
];

const gridRows: AlignRowSpec[] = [
  { key: 'justifyItems', cap: 'across', capIcon: 'arrow-left-right', label: 'items across the cell', engine: 'grid', axis: 'main', options: GRID_ITEMS, value: 'stretch', onChange: noop },
  { key: 'alignItems', cap: 'down', capIcon: 'arrow-up-down', label: 'items down the cell', engine: 'grid', axis: 'cross', options: GRID_ITEMS, value: 'stretch', onChange: noop },
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
  tracks: () => h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, h(GridEditor, {
    container: grid, onPatchContainer: noop,
  })),
  trackEditor: () => h('div', { className: 'hud-grid__control' },
    h(ExtentField, { label: 'column 2', value: { px: 16 }, onChange: noop }),
    h('div', { className: 'hud-grid__bar' }, ...TOOLS.map(({ name, label }) => h(
      IconButton, { key: name, variant: 'ghost', size: 'sm', label, onClick: noop, children: h(Icon, { name, size: 14 }) },
    )))),
  colour: () => h(ColorField, {
    label: 'guide', value: guide, onChange: noop, hint: 'Editor only. Never drawn in game.',
  }),
};

export { layoutCases };

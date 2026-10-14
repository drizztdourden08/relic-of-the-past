/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { BoxModelField } from '@app/views/HudLayoutEditor/sub-components/BoxModelField';
import { ExtentField } from '@app/views/HudLayoutEditor/sub-components/ExtentField';
import { GridEditor } from '@app/views/HudLayoutEditor/sub-components/GridEditor';
import { MinMaxField } from '@app/views/HudLayoutEditor/sub-components/MinMaxField';
import { OffsetField } from '@app/views/HudLayoutEditor/sub-components/OffsetField';
import { SizeBoxSection } from '@app/views/HudLayoutEditor/sub-components/SizeBoxSection';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { HudGridContainer, HudNode } from '@rotp/hud';
import { WINDOWS_PLATFORM } from '../windows-platform';

const noop = (): void => {};
const scope = { life_current: 8 };
const gridParent: HudGridContainer = {
  id: 'g', kind: 'container', layout: 'grid',
  columns: ['auto', 'auto', 'auto'], rows: ['auto', 'auto'],
  children: [{ id: 'pip', kind: 'element', element: { type: 'spacer' }, place: { column: 2, row: 1, colSpan: 2 } }],
};

const SIZED_NODE: HudNode = {
  id: 'n', kind: 'element', element: { type: 'spacer' },
  size: { w: { px: 80 } }, margin: { left: -12 },
  padding: { top: 2, right: 2, bottom: 2, left: 2 },
};

const geometryCases: Record<string, () => unknown> = {
  box: () => h(BoxModelField, {
    margin: { top: 0, right: 0, bottom: 0, left: -12 },
    padding: { top: 2, right: 2, bottom: 2, left: 2 },
    centre: '80 × 24',
    onMargin: noop,
    onPadding: noop,
  }),
  offset: () => h(OffsetField, { value: { left: -12 }, onChange: noop }),
  size: () => h('div', { className: 'hud-inspect__row' },
    h(ExtentField, { label: 'w', value: { px: 80 }, onChange: noop }),
    h(ExtentField, { label: 'h', value: undefined, onChange: noop })),
  limits: () => h(MinMaxField, { min: { w: 8 }, max: undefined, onMin: noop, onMax: noop, scope }),
  sizebox: () => h(SizeBoxSection, {
    node: SIZED_NODE,
    onPatch: noop,
    scope,
  }),
  cell: () => h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, h(GridEditor, {
    container: gridParent, onPatchContainer: noop,
  })),
};

export { geometryCases };

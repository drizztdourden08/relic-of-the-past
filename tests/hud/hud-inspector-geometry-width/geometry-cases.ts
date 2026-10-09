/* @layer tests @kind helper */
import { createElement as h } from 'react';
import { BoxModelField } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/BoxModelField';
import { ExtentField } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/ExtentField';
import { GridEditor } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor';
import { MinMaxField } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/MinMaxField';
import { OffsetField } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/OffsetField';
import { SizeBoxSection } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/SizeBoxSection';
import { PlatformContext } from '../../../apps/desktop/src/platform/PlatformProvider';
import type { Platform } from '../../../shared/platform';
import type { HudGridContainer, HudNode } from '../../../shared/types/hud';

const noop = (): void => {};
const scope = { life_current: 8 };
const platform = { info: { os: 'windows' } } as unknown as Platform;

const gridParent = {
  id: 'g', kind: 'container', layout: 'grid',
  columns: ['auto', 'auto', 'auto'], rows: ['auto', 'auto'],
  children: [{ id: 'pip', kind: 'element', element: { type: 'spacer' }, place: { column: 2, row: 1, colSpan: 2 } }],
} as unknown as HudGridContainer;

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
    node: {
      id: 'n', kind: 'element', element: { type: 'spacer' },
      size: { w: { px: 80 } }, margin: { left: -12 },
      padding: { top: 2, right: 2, bottom: 2, left: 2 },
    } as unknown as HudNode,
    onPatch: noop,
    scope,
  }),
  cell: () => h(PlatformContext.Provider, { value: platform }, h(GridEditor, {
    container: gridParent, scope: {}, onPatchContainer: noop,
  })),
};

export { geometryCases };

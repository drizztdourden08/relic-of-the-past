/* @layer renderer-components @kind logic */
import { GRID_ITEMS } from '../align-options';
import type { AlignValue } from '../align-options';
import type { AlignRowSpec } from '@app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import type { HudGridContainer, HudGridJustifyItems } from '@rotp/hud';
import type { PatchGrid } from './layout-sides.type';
import { msg } from '@drizztdourden08/brock-core/i18n';

const gridAlignRows = (container: HudGridContainer, onPatch: PatchGrid): AlignRowSpec[] => [
  {
    key: 'justifyItems', cap: 'across', capIcon: 'arrow-left-right', label: msg('hud-editing:layout.items-across'), engine: 'grid', axis: 'main',
    options: GRID_ITEMS, value: container.justifyItems ?? 'stretch',
    onChange: (next: AlignValue) => onPatch({ justifyItems: next as HudGridJustifyItems }),
  },
  {
    key: 'alignItems', cap: 'down', capIcon: 'arrow-up-down', label: msg('hud-editing:layout.items-down'), engine: 'grid', axis: 'cross',
    options: GRID_ITEMS, value: container.alignItems ?? 'stretch',
    onChange: (next: AlignValue) => onPatch({ alignItems: next as HudGridJustifyItems }),
  },
];

export { gridAlignRows };

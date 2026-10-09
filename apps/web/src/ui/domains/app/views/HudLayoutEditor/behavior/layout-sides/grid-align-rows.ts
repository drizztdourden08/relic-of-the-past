/* @layer renderer-components @kind logic */
import { GRID_ITEMS } from '../align-options';
import type { AlignValue } from '../align-options';
import type { AlignRowSpec } from '../../sub-components/AlignmentTiles';
import type { HudGridContainer, HudGridJustifyItems } from '@shared/types/hud';
import type { PatchGrid } from './layout-sides.type';

const gridAlignRows = (container: HudGridContainer, onPatch: PatchGrid): AlignRowSpec[] => [
  {
    key: 'justifyItems', cap: '↔', label: 'items across the cell', engine: 'grid', axis: 'main',
    options: GRID_ITEMS, value: container.justifyItems ?? 'stretch',
    onChange: (next: AlignValue) => onPatch({ justifyItems: next as HudGridJustifyItems }),
  },
  {
    key: 'alignItems', cap: '↕', label: 'items down the cell', engine: 'grid', axis: 'cross',
    options: GRID_ITEMS, value: container.alignItems ?? 'stretch',
    onChange: (next: AlignValue) => onPatch({ alignItems: next as HudGridJustifyItems }),
  },
];

export { gridAlignRows };

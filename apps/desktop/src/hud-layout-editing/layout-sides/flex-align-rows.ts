/* @layer renderer-components @kind logic */
import { FLEX_ALIGN, FLEX_JUSTIFY } from '../align-options';
import type { AlignPos, AlignValue } from '../align-options';
import type { AlignRowSpec } from '@app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import type { HudFlexContainer } from '@rotp/hud';
import type { PatchFlex } from './layout-sides.type';

const flexAlignRows = (node: HudFlexContainer, onPatch: PatchFlex): AlignRowSpec[] => [
  {
    key: 'justify', cap: 'main', label: 'along the main axis', engine: 'flex', axis: 'main',
    options: FLEX_JUSTIFY, value: node.justify ?? 'start',
    onChange: (next: AlignValue) => onPatch({ justify: next as HudFlexContainer['justify'] }),
  },
  {
    key: 'align', cap: 'cross', label: 'across the cross axis', engine: 'flex', axis: 'cross',
    options: FLEX_ALIGN, value: node.align ?? 'start',
    onChange: (next: AlignValue) => onPatch({ align: next as AlignPos }),
  },
];

export { flexAlignRows };

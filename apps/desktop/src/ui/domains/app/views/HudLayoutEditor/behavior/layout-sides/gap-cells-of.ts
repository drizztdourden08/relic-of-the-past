/* @layer renderer-components @kind logic */
import type { GapCell } from '../../sub-components/LayoutSettings.type';
import type { HudContainer } from '@shared/types/hud';

const gapCellsOf = (node: HudContainer): GapCell[] => [
  { axis: 'x', cap: '↔', label: 'gap x', value: node.gap?.x ?? 0 },
  { axis: 'y', cap: '↕', label: 'gap y', value: node.gap?.y ?? 0 },
];

export { gapCellsOf };

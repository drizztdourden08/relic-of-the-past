/* @layer renderer-components @kind logic */
import type { GapCell } from '@app/views/HudLayoutEditor/sub-components/LayoutSettings.type';
import type { HudContainer } from '@rotp/hud';

const gapCellsOf = (node: HudContainer): GapCell[] => [
  { axis: 'x', cap: 'x', capIcon: 'arrow-left-right', label: 'gap x', value: node.gap?.x ?? 0 },
  { axis: 'y', cap: 'y', capIcon: 'arrow-up-down', label: 'gap y', value: node.gap?.y ?? 0 },
];

export { gapCellsOf };

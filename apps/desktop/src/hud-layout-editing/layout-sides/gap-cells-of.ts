/* @layer renderer-components @kind logic */
import type { GapCell } from '@app/views/HudLayoutEditor/sub-components/LayoutSettings.type';
import type { HudContainer } from '@rotp/hud';
import { msg } from '@drizztdourden08/brock-core/i18n';

const gapCellsOf = (node: HudContainer): GapCell[] => [
  { axis: 'x', cap: 'x', capIcon: 'arrow-left-right', label: msg('hud-editing:layout.gap-x'), value: node.gap?.x ?? 0 },
  { axis: 'y', cap: 'y', capIcon: 'arrow-up-down', label: msg('hud-editing:layout.gap-y'), value: node.gap?.y ?? 0 },
];

export { gapCellsOf };

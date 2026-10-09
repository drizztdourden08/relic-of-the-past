/* @layer tests @kind helper */
import type { HudNode } from '@shared/types/hud';

const boxCell = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'container', id, direction: 'row', size: { w: { px: 10 }, h: { px: 10 } }, children: [], ...extra,
} as HudNode);

export { boxCell };

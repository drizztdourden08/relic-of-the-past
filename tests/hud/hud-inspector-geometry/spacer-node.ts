/* @layer tests @kind helper */
import type { HudNode } from '@rotp/hud';

const spacerNode = (extra: Partial<HudNode> = {}): HudNode =>
  ({ id: 'n', kind: 'element', element: { type: 'spacer' }, ...extra }) as HudNode;

export { spacerNode };

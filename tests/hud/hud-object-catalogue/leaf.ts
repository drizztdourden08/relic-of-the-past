/* @layer test @kind helper */
import type { HudNode } from '@shared/types/hud';

const leaf = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'element', id, element: { type: 'slot', index: 1 }, ...extra,
} as HudNode);

export { leaf };

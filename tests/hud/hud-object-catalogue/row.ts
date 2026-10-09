/* @layer test @kind helper */
import type { HudContainer, HudNode } from '@rotp/hud';

const row = (children: HudNode[], extra: Partial<HudContainer> = {}): HudContainer => ({
  kind: 'container', id: 'root', direction: 'row', children, ...extra,
} as HudContainer);

export { row };

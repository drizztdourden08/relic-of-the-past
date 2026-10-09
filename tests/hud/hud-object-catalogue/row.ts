/* @layer test @kind helper */
import type { HudContainer, HudNode } from '@shared/types/hud';

const row = (children: HudNode[], extra: Partial<HudContainer> = {}): HudContainer => ({
  kind: 'container', id: 'root', direction: 'row', children, ...extra,
} as HudContainer);

export { row };

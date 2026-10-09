/* @layer renderer-hud @kind logic */
import type { PlacedNode } from '@shared/hud/engine';
import type { HudNode } from '@shared/types/hud';
import type { DrawOrigin } from '../HudNodeRenderer.type';

const snapsToGamePixels = (node: HudNode): boolean =>
  node.kind === 'element' && node.element.type === 'countdown';

const drawOrigin = (placed: PlacedNode): DrawOrigin => {
  const { x, y } = placed.rect;
  return snapsToGamePixels(placed.node) ? { x: Math.round(x), y: Math.round(y) } : { x, y };
};

export { drawOrigin };

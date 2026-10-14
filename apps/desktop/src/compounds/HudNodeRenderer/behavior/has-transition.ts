/* @layer renderer-hud @kind logic */
import type { PlacedNode } from '@rotp/hud';

const hasTransition = (placed: PlacedNode, which: 'enter' | 'exit'): boolean =>
  placed.node.kind === 'element' && Boolean(placed.node.transition?.[which]);

export { hasTransition };
